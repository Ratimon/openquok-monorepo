import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { SubscriptionError } from "../../errors/SubscriptionError";
import { EmailService } from "../../services/EmailService";
import {
    integrationManager,
    integrationService,
    permissionsService,
    refreshIntegrationService,
    subscriptionService,
} from "../../services/index";
import { storageR2Repository } from "../../repositories/index";
import type { AuthTokenDetails, SocialProvider } from "../../integrations/social.integrations.interface";
import { cacheServiceConnection } from "../../connections/index";
import {
    insertTestSocialIntegration,
    seedSocialConnectOAuthState,
    stubInMemorySocialConnectCache,
} from "../helpers/integrationTestHelper";
import { ACTIVE_ORGANIZATION_COOKIE } from "../../utils/session/sessionCookies";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import { activateWorkspace } from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { DEFAULT_MEDIA_STORAGE_QUOTA_BYTES, planLimitsForTier } from "openquok-common";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const postsPath = `${apiPrefix}/posts`;
const mediaPath = `${apiPrefix}/media`;
const integrationsPath = `${apiPrefix}/integrations`;
const SOCIAL_CONNECT_PROVIDER = "threads";

const inviteTokenSecret = (config.auth as { inviteTokenSecret?: string } | undefined)?.inviteTokenSecret?.trim();
const itIfInviteSigning = inviteTokenSecret ? it : it.skip;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase =
    supabaseUrl && supabaseSecretKey ? describe : describe.skip;

jest.mock("openquok-orchestrator", () => ({
    __esModule: true,
    runScheduledSocialPostOrchestration: jest.fn().mockResolvedValue(true),
}));

/**
 * FREE tier caps from the shared plan catalog (`planLimitsForTier("FREE")`):
 * - zero workspaces cap skips create-workspace enforcement (signup default org still allowed)
 * - no connected channels, scheduled posts, team seats, or catalog media bytes
 * - runtime media quota falls back to {@link DEFAULT_MEDIA_STORAGE_QUOTA_BYTES} when catalog bytes are 0
 *
 * Policy checks run when Stripe billing is configured; this suite forces billing on via a spy
 * and leaves organizations without a paid `organization_subscriptions` row (resolved tier FREE).
 */
describeIfSupabase("FREE plan subscription limits (integration)", () => {
    const adminSupabase = createClient(supabaseUrl!, supabaseSecretKey!) as SupabaseClient;
    const userHelper = new UserTestHelper();

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;
    let billingEnabledSpy: jest.SpyInstance;

    beforeAll(() => {
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        await userHelper.cleanAll();
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    beforeEach(() => {
        billingEnabledSpy = jest.spyOn(subscriptionService, "billingEnabled").mockReturnValue(true);
    });

    afterEach(async () => {
        billingEnabledSpy?.mockRestore();
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string }> {
        const { accessToken } = await sharedSignupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken,
            payload
        );

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(meRes.status).toBe(200);

        return { accessToken };
    }

    async function firstOrganizationId(accessToken: string): Promise<string> {
        const listRes = await supertest(app).get(settingsPath).set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();
        return orgId;
    }

    it("allows creating another workspace when FREE workspaces cap is 0 (enforcement skipped)", async () => {
        const freeLimits = planLimitsForTier("FREE");
        expect(freeLimits.workspaces).toBe(0);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);

        const listRes = await supertest(app).get(settingsPath).set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body?.data?.length).toBeGreaterThanOrEqual(1);

        const createRes = await supertest(app)
            .post(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Second workspace", description: null });

        expect(createRes.status).toBe(201);
        expect(createRes.body?.success).toBe(true);

        const listAfterRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(listAfterRes.status).toBe(200);
        expect(listAfterRes.body?.data?.length).toBeGreaterThanOrEqual(2);
    });

    itIfInviteSigning(
        "returns error when a FREE workspace admin tries to invite another member (no seats)",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(accessToken);
            await activateWorkspace(accessToken, orgId);

            const inviteeEmail = `invitee-${uuidv4()}@test.com`.toLowerCase();
            const res = await supertest(app)
                .post(`${settingsPath}/team`)
                .set("Authorization", `Bearer ${accessToken}`)
                .set("Cookie", [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`])
                .send({
                    email: inviteeEmail,
                    workspaceRole: "user",
                    sendEmail: false,
                });

            expect(res.status).toBe(402);
            expect(res.body?.success).toBe(false);
            expect(res.body?.error?.section).toBe("team_members_per_workspace");
        }
    );

    it("blocks the first social channel when FREE channel_per_workspace cap is 0", async () => {
        const freeLimits = planLimitsForTier("FREE");
        const channelCap = freeLimits.channel_per_workspace;
        expect(channelCap).toBe(0);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const connectedChannels = await integrationService.listByOrganization(orgId);
        expect(connectedChannels).toHaveLength(0);

        await expect(
            permissionsService.assertConnectSocialChannelAllowed(orgId, "free-first-channel")
        ).rejects.toBeInstanceOf(SubscriptionError);

        const mockAuthDetails = (internalId: string, name: string): AuthTokenDetails => ({
            id: internalId,
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            expiresIn: 3600,
            name,
            username: "mock-user",
            additionalSettings: [],
        });
        const mockAuthenticate = jest.fn(
            async (_params: { code: string; codeVerifier: string; refresh?: string }) =>
                mockAuthDetails("free-first-channel", "Blocked channel")
        );
        const getSocialIntegrationSpy = jest
            .spyOn(integrationManager, "getSocialIntegration")
            .mockImplementation((identifier: string) => {
                if (identifier !== SOCIAL_CONNECT_PROVIDER) return undefined;
                return {
                    identifier: SOCIAL_CONNECT_PROVIDER,
                    name: "Threads",
                    editor: "normal",
                    isBetweenSteps: false,
                    scopes: [],
                    maxLength: () => 10_000,
                    authenticate: mockAuthenticate,
                } as unknown as SocialProvider;
            });
        const refreshWorkflowSpy = jest
            .spyOn(refreshIntegrationService, "startRefreshWorkflow")
            .mockResolvedValue(false);
        const oauthCacheStub = stubInMemorySocialConnectCache();

        try {
            const blockedState = `free-cap-blocked-${uuidv4()}`;
            await seedSocialConnectOAuthState(cacheServiceConnection, orgId, blockedState);

            const blockedRes = await supertest(app)
                .post(`${integrationsPath}/social-connect/${SOCIAL_CONNECT_PROVIDER}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    state: blockedState,
                    code: "mock-oauth-code",
                    timezone: "0",
                });

            expect(blockedRes.status).toBe(402);
            expect(blockedRes.body?.success).toBe(false);
            expect(blockedRes.body?.error?.section).toBe("channel_per_workspace");
            expect(mockAuthenticate).toHaveBeenCalledTimes(1);

            const afterBlocked = await integrationService.listByOrganization(orgId);
            expect(afterBlocked).toHaveLength(0);
        } finally {
            oauthCacheStub.restore();
            getSocialIntegrationSpy.mockRestore();
            refreshWorkflowSpy.mockRestore();
        }
    });

    it("blocks scheduling a post when FREE posts_per_month cap is 0", async () => {
        const freeLimits = planLimitsForTier("FREE");
        const postsCap = freeLimits.posts_per_month;
        expect(postsCap).toBe(0);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
            internalId: "free-posts-cap-channel",
        });

        await expect(permissionsService.assertPostsPerMonthAllowed(orgId, 0)).resolves.toBeUndefined();

        await expect(permissionsService.assertPostsPerMonthAllowed(orgId, 1)).rejects.toBeInstanceOf(
            SubscriptionError
        );

        const findSlot = await supertest(app)
            .get(`${postsPath}/find-slot`)
            .query({ organizationId: orgId })
            .set("Authorization", `Bearer ${accessToken}`);
        expect(findSlot.status).toBe(200);
        const scheduledAt = findSlot.body?.data?.date as string;
        expect(scheduledAt).toBeDefined();

        const createRes = await supertest(app)
            .post(postsPath)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                organizationId: orgId,
                body: "Should be blocked on FREE plan",
                integrationIds: [integrationId],
                isGlobal: true,
                scheduledAt,
                tagNames: [],
                status: "scheduled",
            });

        expect(createRes.status).toBe(402);
        expect(createRes.body?.success).toBe(false);
        expect(createRes.body?.error?.section).toBe("posts_per_month");
    });

    it("blocks complete-multipart-upload when FREE workspace is at the effective media quota", async () => {
        const freeLimits = planLimitsForTier("FREE");
        expect(freeLimits.media_storage_bytes_per_workspace).toBe(0);

        const effectiveStorageCap = DEFAULT_MEDIA_STORAGE_QUOTA_BYTES;
        expect(effectiveStorageCap).toBeGreaterThan(0);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: effectiveStorageCap - 512,
            total: effectiveStorageCap,
            tier: "FREE",
        });
        const completeMultipartSpy = jest
            .spyOn(storageR2Repository, "completeMultipartUpload")
            .mockResolvedValue({ Location: "free-cap-test.png" });

        try {
            const uploadRes = await supertest(app)
                .post(`${mediaPath}/complete-multipart-upload`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    organizationId: orgId,
                    key: "free-cap-test.png",
                    uploadId: "test-upload-id",
                    parts: [{ ETag: '"etag"', PartNumber: 1 }],
                    file: { name: "over-cap.png", size: 1024 },
                    contentType: "image/png",
                });

            expect(uploadRes.status).toBe(402);
            expect(uploadRes.body?.success).toBe(false);
            expect(uploadRes.body?.error?.section).toBe("media_storage_bytes_per_workspace");
            expect(completeMultipartSpy).not.toHaveBeenCalled();
        } finally {
            driveUsageSpy.mockRestore();
            completeMultipartSpy.mockRestore();
        }
    });

    it("rejects additional bytes via assertMediaStorageAvailable when FREE effective storage is full", async () => {
        const effectiveStorageCap = DEFAULT_MEDIA_STORAGE_QUOTA_BYTES;

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: effectiveStorageCap,
            total: effectiveStorageCap,
            tier: "FREE",
        });

        try {
            await expect(subscriptionService.assertMediaStorageAvailable(orgId, 1)).rejects.toBeInstanceOf(
                SubscriptionError
            );
        } finally {
            driveUsageSpy.mockRestore();
        }
    });
});
