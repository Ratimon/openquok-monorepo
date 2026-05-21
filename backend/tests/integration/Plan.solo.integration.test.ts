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
import { ACTIVE_ORGANIZATION_COOKIE } from "../../utils/session/sessionCookies";
import {
    insertTestSocialIntegration,
    seedSocialConnectOAuthState,
    seedSocialIntegrations,
    stubInMemorySocialConnectCache,
} from "../helpers/integrationTestHelper";
import { seedScheduledSocialPosts } from "../helpers/postHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import { activateWorkspace, stubBillingEnabled, stubSoloPlanLimits } from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { planLimitsForTier } from "openquok-common";

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
 * SOLO tier caps from the shared plan catalog (`planLimitsForTier("SOLO")`):
 * - one workspace per billing account (`workspaces: 1`)
 * - one workspace seat (no additional team members / invites beyond the owner)
 * - limited connected channels per workspace
 * - limited scheduled posts per billing month (`posts_per_month`)
 * - limited media library storage per workspace (`media_storage_bytes_per_workspace`, 5 GiB on SOLO)
 *
 * Policy checks run when Stripe billing is configured; this suite forces billing on and stubs
 * `permissionsService.getTierAndLimits` to SOLO. Team invite uses POST /settings/team + `showorg` cookie.
 */
describeIfSupabase("SOLO plan subscription limits (integration)", () => {
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

    afterAll(() => {
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    beforeEach(() => {
        billingEnabledSpy = stubBillingEnabled();
    });

    afterEach(async () => {
        billingEnabledSpy?.mockRestore();
        await userHelper.cleanAllStoredUsers();
    });

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string }> {
        const signupRes = await supertest(app).post(`${authPath}/sign-up`).send(payload);
        if (signupRes.body?.data?.session?.accessToken) {
            const token = signupRes.body.data.session.accessToken;
            const { data } = await adminSupabase.auth.getUser(token);
            if (data?.user?.id) userHelper.trackUser(data.user.id);
        }
        expect(signupRes.status).toBe(201);

        const verifyRes = await supertest(app).get(
            `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(payload.email)}`
        );
        expect(verifyRes.status).toBe(200);

        const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
            email: payload.email,
            password: payload.password,
        });
        expect(signInRes.status).toBe(200);
        const accessToken = signInRes.body.data?.accessToken ?? signInRes.body.data?.session?.accessToken;
        expect(accessToken).toBeDefined();

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(meRes.status).toBe(200);

        return { accessToken: accessToken as string };
    }

    async function firstOrganizationId(accessToken: string): Promise<string> {
        const listRes = await supertest(app).get(settingsPath).set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();
        return orgId;
    }

    it("blocks creating a second workspace when SOLO workspaces cap is 1", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const workspaceCap = soloLimits.workspaces;
        expect(workspaceCap).toBe(1);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        const tierLimitsSpy = stubSoloPlanLimits();

        try {
            const listRes = await supertest(app)
                .get(settingsPath)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(listRes.status).toBe(200);
            expect(listRes.body?.data).toHaveLength(workspaceCap);

            const createRes = await supertest(app)
                .post(settingsPath)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ name: "Second workspace", description: null });

            expect(createRes.status).toBe(402);
            expect(createRes.body?.success).toBe(false);
            expect(createRes.body?.error?.section).toBe("workspaces");

            const listAfterRes = await supertest(app)
                .get(settingsPath)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(listAfterRes.status).toBe(200);
            expect(listAfterRes.body?.data).toHaveLength(workspaceCap);
        } finally {
            tierLimitsSpy.mockRestore();
        }
    });

    itIfInviteSigning(
        "returns error when a SOLO workspace admin tries to invite another member (single seat)",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(accessToken);
            const tierLimitsSpy = stubSoloPlanLimits();

            try {
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
            } finally {
                tierLimitsSpy.mockRestore();
            }
        }
    );

    it("blocks a new social channel when the workspace is at SOLO channel_per_workspace cap", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const channelCap = soloLimits.channel_per_workspace;
        expect(channelCap).toBe(15);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        const tierLimitsSpy = stubSoloPlanLimits();

        const { internalIds } = await seedSocialIntegrations(adminSupabase, orgId, {
            count: channelCap,
            internalIdPrefix: "solo-cap-test",
            token: "test-token",
        });

        const connectedChannels = await integrationService.listByOrganization(orgId);
        expect(connectedChannels).toHaveLength(channelCap);

        await expect(
            permissionsService.assertConnectSocialChannelAllowed(orgId, "brand-new-internal-id")
        ).rejects.toBeInstanceOf(SubscriptionError);

        // Cap blocks new provider accounts only; same internal_id is a reconnect (token refresh), not a 16th slot.
        await expect(
            permissionsService.assertConnectSocialChannelAllowed(orgId, internalIds[0]!)
        ).resolves.toBeUndefined();

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
                mockAuthDetails("brand-new-internal-id", "Blocked channel")
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
            const blockedState = `solo-cap-blocked-${uuidv4()}`;
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
            expect(afterBlocked).toHaveLength(channelCap);

            // At cap, social-connect still returns 200 when OAuth resolves to an existing internal_id (upsert, not a new channel).
            mockAuthenticate.mockImplementation(async () =>
                mockAuthDetails(internalIds[0]!, "Reconnect channel")
            );

            const reconnectState = `solo-cap-reconnect-${uuidv4()}`;
            await seedSocialConnectOAuthState(cacheServiceConnection, orgId, reconnectState);

            const reconnectRes = await supertest(app)
                .post(`${integrationsPath}/social-connect/${SOCIAL_CONNECT_PROVIDER}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    state: reconnectState,
                    code: "mock-oauth-code",
                    timezone: "0",
                });

            expect(reconnectRes.status).toBe(200);
            expect(reconnectRes.body?.success).toBe(true);
            expect(reconnectRes.body?.data?.internalId).toBe(internalIds[0]);
            expect(mockAuthenticate).toHaveBeenCalledTimes(2);

            const afterReconnect = await integrationService.listByOrganization(orgId);
            expect(afterReconnect).toHaveLength(channelCap); // reconnect must not increase connected count
        } finally {
            tierLimitsSpy.mockRestore();
            oauthCacheStub.restore();
            getSocialIntegrationSpy.mockRestore();
            refreshWorkflowSpy.mockRestore();
        }
    });

    it("blocks scheduling another post when the workspace is at SOLO posts_per_month cap", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const postsCap = soloLimits.posts_per_month;
        expect(postsCap).toBe(500);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        const tierLimitsSpy = stubSoloPlanLimits();

        try {
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
                internalId: "solo-posts-cap-channel",
            });

            await seedScheduledSocialPosts(adminSupabase, orgId, {
                count: postsCap,
                postGroupPrefix: "solo-posts-cap-api",
            });

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
                    body: "Should exceed monthly post cap",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt,
                    tagNames: [],
                    status: "scheduled",
                });

            expect(createRes.status).toBe(402);
            expect(createRes.body?.success).toBe(false);
            expect(createRes.body?.error?.section).toBe("posts_per_month");
        } finally {
            tierLimitsSpy.mockRestore();
        }
    });

    it("blocks complete-multipart-upload when workspace is at SOLO media_storage_bytes_per_workspace", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const storageCap = soloLimits.media_storage_bytes_per_workspace;
        expect(storageCap).toBeGreaterThan(0);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: storageCap - 512,
            total: storageCap,
            tier: "SOLO",
        });
        const completeMultipartSpy = jest
            .spyOn(storageR2Repository, "completeMultipartUpload")
            .mockResolvedValue({ Location: "solo-cap-test.png" });

        try {
            const uploadRes = await supertest(app)
                .post(`${mediaPath}/complete-multipart-upload`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    organizationId: orgId,
                    key: "solo-cap-test.png",
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

    it("rejects additional bytes via assertMediaStorageAvailable when SOLO storage is full", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const storageCap = soloLimits.media_storage_bytes_per_workspace;

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: storageCap,
            total: storageCap,
            tier: "SOLO",
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
