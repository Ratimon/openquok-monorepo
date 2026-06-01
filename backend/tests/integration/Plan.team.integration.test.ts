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
import { ACTIVE_ORGANIZATION_COOKIE } from "../../utils/session/sessionCookies";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import {
    activateWorkspace,
    preparePlanEnforcement,
    restorePlanEnforcementSpies,
    type PlanEnforcementSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import {
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
 * TEAM tier caps from the shared plan catalog (`planLimitsForTier("TEAM")`):
 * - three owned workspaces per billing account
 * - five team member seats per workspace (owner + invites)
 * - twenty connected channels per workspace
 * - unlimited scheduled posts per billing month
 * - five GiB media library storage per workspace
 * - shareable post previews and public API enabled
 */
describeIfSupabase("TEAM plan subscription limits (integration)", () => {
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

    it("blocks creating a fourth workspace when TEAM workspaces cap is 3", async () => {
        const teamLimits = planLimitsForTier("TEAM");
        const workspaceCap = teamLimits.workspaces;
        expect(workspaceCap).toBe(3);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("TEAM");

            for (let i = 1; i < workspaceCap; i++) {
                const createRes = await supertest(app)
                    .post(settingsPath)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({ name: `TEAM workspace ${i + 1}`, description: null });
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
                .send({ name: "Fourth workspace", description: null });

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

    itIfInviteSigning(
        "blocks a sixth team invite when TEAM team_members_per_workspace cap is 5",
        async () => {
            const teamLimits = planLimitsForTier("TEAM");
            const seatCap = teamLimits.team_members_per_workspace;
            expect(seatCap).toBe(3);

            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(accessToken);
            let planSpies: PlanEnforcementSpies | undefined;
            const workspaceCookie = [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`];

            try {
                planSpies = preparePlanEnforcement("TEAM");
                await activateWorkspace(accessToken, orgId);

                const teamBeforeRes = await supertest(app)
                    .get(`${settingsPath}/team`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie);
                expect(teamBeforeRes.status).toBe(200);
                expect(teamBeforeRes.body?.data).toHaveLength(1);

                for (let i = 0; i < seatCap - 1; i++) {
                    const inviteRes = await supertest(app)
                        .post(`${settingsPath}/team`)
                        .set("Authorization", `Bearer ${accessToken}`)
                        .set("Cookie", workspaceCookie)
                        .send({
                            email: `team-invite-${i}-${uuidv4()}@test.com`.toLowerCase(),
                            workspaceRole: "user",
                            sendEmail: false,
                        });
                    expect(inviteRes.status).toBe(200);
                    expect(inviteRes.body?.success).toBe(true);
                }

                const sentRes = await supertest(app)
                    .get(`${settingsPath}/invites/sent`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie);
                expect(sentRes.status).toBe(200);
                expect(sentRes.body?.data ?? []).toHaveLength(seatCap - 1);

                await expect(subscriptionGuard.assertTeamInviteCapacity(orgId)).rejects.toBeInstanceOf(
                    SubscriptionError
                );

                const blockedEmail = `team-invite-blocked-${uuidv4()}@test.com`.toLowerCase();
                const blockedRes = await supertest(app)
                    .post(`${settingsPath}/team`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie)
                    .send({
                        email: blockedEmail,
                        workspaceRole: "user",
                        sendEmail: false,
                    });

                expect(blockedRes.status).toBe(402);
                expect(blockedRes.body?.success).toBe(false);
                expect(blockedRes.body?.error?.section).toBe("team_members_per_workspace");

                const sentAfterRes = await supertest(app)
                    .get(`${settingsPath}/invites/sent`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie);
                expect(sentAfterRes.status).toBe(200);
                const sentInvites = (sentAfterRes.body?.data ?? []) as { email?: string }[];
                expect(
                    sentInvites.some((inv) => inv.email?.toLowerCase() === blockedEmail)
                ).toBe(false);
            } finally {
                restorePlanEnforcementSpies(planSpies);
            }
        }
    );

    it("blocks a new social channel when the workspace is at TEAM channel_per_workspace cap", async () => {
        const teamLimits = planLimitsForTier("TEAM");
        const channelCap = teamLimits.channel_per_workspace;
        expect(channelCap).toBe(15);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        let planSpies: PlanEnforcementSpies | undefined;

        const { internalIds } = await seedSocialIntegrations(adminSupabase, orgId, {
            count: channelCap,
            internalIdPrefix: "team-cap-test",
            token: "test-token",
        });

        const connectedChannels = await integrationService.listByOrganization(orgId);
        expect(connectedChannels).toHaveLength(channelCap);

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
            planSpies = preparePlanEnforcement("TEAM");

            await expect(
                subscriptionGuard.assert(SubscriptionSection.CHANNEL_PER_WORKSPACE, {
                    scope: "workspaceWithReconnect",
                    organizationId: orgId,
                    reconnectInternalId: "brand-new-internal-id",
                })
            ).rejects.toBeInstanceOf(SubscriptionError);

            await expect(
                subscriptionGuard.assert(SubscriptionSection.CHANNEL_PER_WORKSPACE, {
                    scope: "workspaceWithReconnect",
                    organizationId: orgId,
                    reconnectInternalId: internalIds[0]!,
                })
            ).resolves.toBeUndefined();

            const blockedState = `team-cap-blocked-${uuidv4()}`;
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

            mockAuthenticate.mockImplementation(async () =>
                mockAuthDetails(internalIds[0]!, "Reconnect channel")
            );

            const reconnectState = `team-cap-reconnect-${uuidv4()}`;
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

            const afterReconnect = await integrationService.listByOrganization(orgId);
            expect(afterReconnect).toHaveLength(channelCap);
        } finally {
            restorePlanEnforcementSpies(planSpies);
            oauthCacheStub.restore();
            getSocialIntegrationSpy.mockRestore();
            refreshWorkflowSpy.mockRestore();
        }
    });

    it("does not block posts_per_month when TEAM catalog cap is unlimited", async () => {
        const teamLimits = planLimitsForTier("TEAM");
        expect(teamLimits.posts_per_month).toBe(UNLIMITED_POSTS_PER_MONTH);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("TEAM");

            await expect(
                subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                    scope: "workspaceWithDelta",
                    organizationId: orgId,
                    delta: 50_000,
                })
            ).resolves.toBeUndefined();
        } finally {
            restorePlanEnforcementSpies(planSpies);
        }
    });

    it("blocks complete-multipart-upload when workspace is at TEAM media_storage_bytes_per_workspace", async () => {
        const teamLimits = planLimitsForTier("TEAM");
        const storageCap = teamLimits.media_storage_bytes_per_workspace;
        expect(storageCap).toBeGreaterThan(0);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: storageCap - 512,
            total: storageCap,
            tier: "TEAM",
        });
        const completeMultipartSpy = jest
            .spyOn(storageR2Repository, "completeMultipartUpload")
            .mockResolvedValue({ Location: "team-cap-test.png" });
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("TEAM");

            const uploadRes = await supertest(app)
                .post(`${mediaPath}/complete-multipart-upload`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    organizationId: orgId,
                    key: "team-cap-test.png",
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
            restorePlanEnforcementSpies(planSpies);
            driveUsageSpy.mockRestore();
            completeMultipartSpy.mockRestore();
        }
    });

    it("rejects additional bytes via assertMediaStorageAvailable when TEAM storage is full", async () => {
        const teamLimits = planLimitsForTier("TEAM");
        const storageCap = teamLimits.media_storage_bytes_per_workspace;

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const driveUsageSpy = jest.spyOn(subscriptionService, "getWorkspaceDriveUsage").mockResolvedValue({
            used: storageCap,
            total: storageCap,
            tier: "TEAM",
        });
        let planSpies: PlanEnforcementSpies | undefined;

        try {
            planSpies = preparePlanEnforcement("TEAM");

            await expect(subscriptionService.assertMediaStorageAvailable(orgId, 1)).rejects.toBeInstanceOf(
                SubscriptionError
            );
        } finally {
            restorePlanEnforcementSpies(planSpies);
            driveUsageSpy.mockRestore();
        }
    });
});
