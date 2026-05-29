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
    subscriptionGuard,
    refreshIntegrationService,
    subscriptionService,
} from "../../services/index";
import { storageR2Repository } from "../../repositories/index";
import type { AuthTokenDetails, SocialProvider } from "../../integrations/social.integrations.interface";
import { cacheServiceConnection } from "../../connections/index";
import {
    seedSocialConnectOAuthState,
    seedSocialIntegrations,
    stubInMemorySocialConnectCache,
} from "../helpers/integrationTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import {
    preparePlanEnforcement,
    restorePlanEnforcementSpies,
    type PlanEnforcementSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import {
    gbToBytes,
    isUnlimitedTeamMembersPerWorkspace,
    planLimitsForTier,
    SubscriptionSection,
    UNLIMITED_POSTS_PER_MONTH,
} from "openquok-common";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const mediaPath = `${apiPrefix}/media`;
const integrationsPath = `${apiPrefix}/integrations`;
const SOCIAL_CONNECT_PROVIDER = "threads";

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase =
    supabaseUrl && supabaseSecretKey ? describe : describe.skip;

jest.mock("openquok-orchestrator", () => ({
    __esModule: true,
    runScheduledSocialPostOrchestration: jest.fn().mockResolvedValue(true),
}));

/**
 * MAX tier caps from the shared plan catalog (`planLimitsForTier("MAX")`):
 * - ten owned workspaces per billing account
 * - thirty connected channels per workspace
 * - unlimited team member seats per workspace
 * - unlimited scheduled posts per billing month
 * - six GiB media library storage per workspace (higher than TEAM / ULTIMATE)
 */
describeIfSupabase("MAX plan subscription limits (integration)", () => {
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

    it("blocks creating an eleventh workspace when MAX workspaces cap is 10", async () => {
        const maxLimits = planLimitsForTier("MAX");
        const workspaceCap = maxLimits.workspaces;
        expect(workspaceCap).toBe(10);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("MAX");

            for (let i = 1; i < workspaceCap; i++) {
                const createRes = await supertest(app)
                    .post(settingsPath)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ name: `MAX workspace ${i + 1}`, description: null });
                expect(createRes.status).toBe(201);
                expect(createRes.body?.success).toBe(true);
            }

            const listRes = await supertest(app)
                .get(settingsPath)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(listRes.status).toBe(200);
            expect(listRes.body?.data).toHaveLength(workspaceCap);

            const blockedRes = await supertest(app)
                .post(settingsPath)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ name: "Eleventh workspace", description: null });

            expect(blockedRes.status).toBe(402);
            expect(blockedRes.body?.success).toBe(false);
            expect(blockedRes.body?.error?.section).toBe("workspaces");

            const listAfterRes = await supertest(app)
                .get(settingsPath)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(listAfterRes.status).toBe(200);
            expect(listAfterRes.body?.data).toHaveLength(workspaceCap);
        } finally {
            restorePlanEnforcementSpies(planSpies);
        }
    });

    it("allows team invites when MAX team_members_per_workspace is unlimited", async () => {
        const maxLimits = planLimitsForTier("MAX");
        expect(isUnlimitedTeamMembersPerWorkspace(maxLimits.team_members_per_workspace)).toBe(true);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("MAX");

            await expect(subscriptionGuard.assertTeamInviteCapacity(orgId)).resolves.toBeUndefined();
            await expect(
                subscriptionGuard.assertWorkspaceHasSeatForNewMember(orgId)
            ).resolves.toBeUndefined();
        } finally {
            restorePlanEnforcementSpies(planSpies);
        }
    });

    it("blocks a new social channel when the workspace is at MAX channel_per_workspace cap", async () => {
        const maxLimits = planLimitsForTier("MAX");
        const channelCap = maxLimits.channel_per_workspace;
        expect(channelCap).toBe(30);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        let planSpies: PlanEnforcementSpies | undefined;

        const { internalIds } = await seedSocialIntegrations(adminSupabase, orgId, {
            count: channelCap,
            internalIdPrefix: "max-cap-test",
            token: "test-token",
        });

        expect((await integrationService.listByOrganization(orgId)).length).toBe(channelCap);

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
            planSpies = preparePlanEnforcement("MAX");

            await expect(
                subscriptionGuard.assert(SubscriptionSection.CHANNEL_PER_WORKSPACE, {
                    scope: "workspaceWithReconnect",
                    organizationId: orgId,
                    reconnectInternalId: "brand-new-internal-id",
                })
            ).rejects.toBeInstanceOf(SubscriptionError);

            const blockedState = `max-cap-blocked-${uuidv4()}`;
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
            expect(blockedRes.body?.error?.section).toBe("channel_per_workspace");

            mockAuthenticate.mockImplementation(async () =>
                mockAuthDetails(internalIds[0]!, "Reconnect channel")
            );

            const reconnectState = `max-cap-reconnect-${uuidv4()}`;
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
            expect(reconnectRes.body?.data?.internalId).toBe(internalIds[0]);
            expect((await integrationService.listByOrganization(orgId)).length).toBe(channelCap);
        } finally {
            restorePlanEnforcementSpies(planSpies);
            oauthCacheStub.restore();
            getSocialIntegrationSpy.mockRestore();
            refreshWorkflowSpy.mockRestore();
        }
    });

    it("does not block posts_per_month when MAX catalog cap is unlimited", async () => {
        const maxLimits = planLimitsForTier("MAX");
        expect(maxLimits.posts_per_month).toBe(UNLIMITED_POSTS_PER_MONTH);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("MAX");

            await expect(
                subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                    scope: "workspaceWithDelta",
                    organizationId: orgId,
                    delta: 200_000,
                })
            ).resolves.toBeUndefined();
        } finally {
            restorePlanEnforcementSpies(planSpies);
        }
    });

    it("blocks complete-multipart-upload when workspace is at MAX media_storage_bytes_per_workspace (6 GiB)", async () => {
        const maxLimits = planLimitsForTier("MAX");
        const storageCap = maxLimits.media_storage_bytes_per_workspace;
        expect(storageCap).toBe(gbToBytes(6));
        expect(storageCap).toBeGreaterThan(planLimitsForTier("ULTIMATE").media_storage_bytes_per_workspace);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: storageCap - 1024,
            total: storageCap,
            tier: "MAX",
        });
        const completeMultipartSpy = jest
            .spyOn(storageR2Repository, "completeMultipartUpload")
            .mockResolvedValue({ Location: "max-cap-test.png" });
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("MAX");

            const uploadRes = await supertest(app)
                .post(`${mediaPath}/complete-multipart-upload`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    organizationId: orgId,
                    key: "max-cap-test.png",
                    uploadId: "test-upload-id",
                    parts: [{ ETag: '"etag"', PartNumber: 1 }],
                    file: { name: "over-cap.png", size: 2048 },
                    contentType: "image/png",
                });

            expect(uploadRes.status).toBe(402);
            expect(uploadRes.body?.error?.section).toBe("media_storage_bytes_per_workspace");
            expect(completeMultipartSpy).not.toHaveBeenCalled();
        } finally {
            restorePlanEnforcementSpies(planSpies);
            driveUsageSpy.mockRestore();
            completeMultipartSpy.mockRestore();
        }
    });

    it("rejects additional bytes via assertMediaStorageAvailable when MAX storage is full", async () => {
        const maxLimits = planLimitsForTier("MAX");
        const storageCap = maxLimits.media_storage_bytes_per_workspace;

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: storageCap,
            total: storageCap,
            tier: "MAX",
        });
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("MAX");

            await expect(subscriptionService.assertMediaStorageAvailable(orgId, 1)).rejects.toBeInstanceOf(
                SubscriptionError
            );
        } finally {
            restorePlanEnforcementSpies(planSpies);
            driveUsageSpy.mockRestore();
        }
    });
});
