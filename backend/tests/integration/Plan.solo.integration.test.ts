import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

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
import { ACTIVE_ORGANIZATION_COOKIE } from "../../utils/session/sessionCookies";
import {
    insertTestSocialIntegration,
    seedSocialConnectOAuthState,
    seedSocialIntegrations,
    stubInMemorySocialConnectCache,
} from "../helpers/integrationTestHelper";
import { seedScheduledSocialPosts } from "../helpers/postHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import {
    activateWorkspace,
    restoreSoloWorkspaceSpies,
    stubBillingEnabled,
    stubSoloPlanLimits,
    stubSoloSubscriptionLookup,
    stubTeamSeatCapacityChecks,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { planLimitsForTier, SubscriptionSection } from "openquok-common";

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
const PASSWORD = "Test1234!";

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
 * `subscriptionGuard.getTierAndLimits` to SOLO. Team invite uses POST /settings/team + `showorg` cookie.
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

    afterAll(async () => {
        await userHelper.cleanAll();
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    beforeEach(() => {
        billingEnabledSpy = stubBillingEnabled();
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

    async function supabaseAuthUserId(accessToken: string): Promise<string> {
        const { data, error } = await adminSupabase.auth.getUser(accessToken);
        expect(error).toBeNull();
        expect(data.user?.id).toBeDefined();
        return data.user!.id;
    }

    async function acceptWorkspaceInvite(
        accessToken: string,
        organizationId: string
    ): Promise<void> {
        const pendingRes = await supertest(app)
            .get(`${settingsPath}/invites/pending`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(pendingRes.status).toBe(200);
        const invite = (pendingRes.body?.data ?? []).find(
            (row: { organizationId: string }) => row.organizationId === organizationId
        );
        expect(invite?.id).toBeDefined();
        const acceptRes = await supertest(app)
            .post(`${settingsPath}/invites/${invite.id}/accept`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(acceptRes.status).toBe(200);
        expect(acceptRes.body?.success).toBe(true);
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
            const soloLimits = planLimitsForTier("SOLO");
            const seatCap = soloLimits.team_members_per_workspace;
            expect(seatCap).toBe(1);

            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(accessToken);
            const tierLimitsSpy = stubSoloPlanLimits();
            const workspaceCookie = [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`];

            try {
                await activateWorkspace(accessToken, orgId);

                const teamBeforeRes = await supertest(app)
                    .get(`${settingsPath}/team`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie);
                expect(teamBeforeRes.status).toBe(200);
                expect(teamBeforeRes.body?.data).toHaveLength(seatCap);
                expect(
                    (teamBeforeRes.body.data as { email?: string }[]).some(
                        (m) => m.email?.toLowerCase() === payload.email.toLowerCase()
                    )
                ).toBe(true);

                const sentBeforeRes = await supertest(app)
                    .get(`${settingsPath}/invites/sent`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie);
                expect(sentBeforeRes.status).toBe(200);
                expect(sentBeforeRes.body?.data ?? []).toHaveLength(0);

                await expect(subscriptionGuard.assertTeamInviteCapacity(orgId)).rejects.toBeInstanceOf(
                    SubscriptionError
                );

                const inviteeEmail = `invitee-${uuidv4()}@test.com`.toLowerCase();
                const res = await supertest(app)
                    .post(`${settingsPath}/team`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie)
                    .send({
                        email: inviteeEmail,
                        workspaceRole: "user",
                        sendEmail: false,
                    });

                expect(res.status).toBe(402);
                expect(res.body?.success).toBe(false);
                expect(res.body?.error?.section).toBe("team_members_per_workspace");

                const sentAfterRes = await supertest(app)
                    .get(`${settingsPath}/invites/sent`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie);
                expect(sentAfterRes.status).toBe(200);
                const sentInvites = (sentAfterRes.body?.data ?? []) as { email?: string }[];
                expect(
                    sentInvites.some((inv) => inv.email?.toLowerCase() === inviteeEmail)
                ).toBe(false);

                const teamAfterRes = await supertest(app)
                    .get(`${settingsPath}/team`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .set("Cookie", workspaceCookie);
                expect(teamAfterRes.status).toBe(200);
                expect(teamAfterRes.body?.data).toHaveLength(seatCap);
                expect(
                    (teamAfterRes.body.data as { email?: string }[]).some(
                        (m) => m.email?.toLowerCase() === inviteeEmail
                    )
                ).toBe(false);
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
            subscriptionGuard.assert(SubscriptionSection.CHANNEL_PER_WORKSPACE, {
                scope: "workspaceWithReconnect",
                organizationId: orgId,
                reconnectInternalId: "brand-new-internal-id",
            })
        ).rejects.toBeInstanceOf(SubscriptionError);

        // Cap blocks new provider accounts only; same internal_id is a reconnect (token refresh), not a 16th slot.
        await expect(
            subscriptionGuard.assert(SubscriptionSection.CHANNEL_PER_WORKSPACE, {
                scope: "workspaceWithReconnect",
                organizationId: orgId,
                reconnectInternalId: internalIds[0]!,
            })
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

            await expect(
                subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                    scope: "workspaceWithDelta",
                    organizationId: orgId,
                    delta: 1,
                })
            ).rejects.toBeInstanceOf(SubscriptionError);

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

    it("allows scheduling again after posts_per_month resets for a new billing period", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const postsCap = soloLimits.posts_per_month;
        expect(postsCap).toBe(500);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        // Simulate an active monthly billing cycle anchored by Stripe.
        const currentPeriodStart = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h ago
        const currentPeriodEnd = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000); // ~4 weeks ahead
        const previousPeriodPublishIso = new Date(currentPeriodStart.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const tierLimitsSpy = jest
            .spyOn(subscriptionGuard, "getTierAndLimits")
            .mockImplementation(async (orgIdForCall) => ({
                tier: "SOLO",
                limits: soloLimits,
                subscription: {
                    ...((await subscriptionService.getEffectiveSubscription(orgIdForCall)) ?? {
                        id: `test-reset-${uuidv4()}`,
                        organization_id: orgIdForCall,
                        subscription_tier: "SOLO",
                        period: "MONTHLY",
                        identifier: `test-reset-${uuidv4()}`,
                        cancel_at: null,
                        channels_per_workspace: soloLimits.channel_per_workspace,
                        is_lifetime: false,
                        current_period_start: null,
                        current_period_end: null,
                        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                        updated_at: new Date().toISOString(),
                        deleted_at: null,
                    }),
                    current_period_start: currentPeriodStart.toISOString(),
                    current_period_end: currentPeriodEnd.toISOString(),
                    period: "MONTHLY",
                },
            }));

        try {
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
                internalId: "solo-posts-reset-channel",
            });

            // 500 posts in the previous period should not count toward the new period.
            await seedScheduledSocialPosts(adminSupabase, orgId, {
                count: postsCap,
                postGroupPrefix: "solo-posts-reset-prev",
                publishDateIso: previousPeriodPublishIso,
            });

            await expect(
                subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                    scope: "workspaceWithDelta",
                    organizationId: orgId,
                    delta: 1,
                })
            ).resolves.toBeUndefined();

            // Success case: API can schedule again in the new period.
            const findSlotOk = await supertest(app)
                .get(`${postsPath}/find-slot`)
                .query({ organizationId: orgId })
                .set("Authorization", `Bearer ${accessToken}`);
            expect(findSlotOk.status).toBe(200);
            const scheduledAtOk = findSlotOk.body?.data?.date as string;
            expect(scheduledAtOk).toBeDefined();

            const createOk = await supertest(app)
                .post(postsPath)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    organizationId: orgId,
                    body: "Should be allowed after monthly reset",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt: scheduledAtOk,
                    tagNames: [],
                    status: "scheduled",
                });
            expect(createOk.status).toBe(200);
            expect(createOk.body?.success).toBe(true);

            // Now fill the current period to the cap and verify it blocks.
            await seedScheduledSocialPosts(adminSupabase, orgId, {
                count: postsCap - 1, // one slot already used by the successful create above
                postGroupPrefix: "solo-posts-reset-cur",
                publishDateIso: new Date(currentPeriodStart.getTime() + 5 * 60 * 1000).toISOString(),
            });
            await expect(
                subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                    scope: "workspaceWithDelta",
                    organizationId: orgId,
                    delta: 1,
                })
            ).rejects.toBeInstanceOf(SubscriptionError);

            // API should also enforce it at create time.
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
                    body: "Should exceed monthly post cap after reset test",
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

    describe("SOLO posts_per_month credit access", () => {
        it("rejects unauthenticated find-slot and post create requests", async () => {
            const soloLimits = planLimitsForTier("SOLO");
            expect(soloLimits.posts_per_month).toBe(500);

            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(accessToken);
            const tierLimitsSpy = stubSoloPlanLimits();

            try {
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
                    internalId: "solo-posts-anon-channel",
                });

                const findSlotRes = await supertest(app)
                    .get(`${postsPath}/find-slot`)
                    .query({ organizationId: orgId });
                expect(findSlotRes.status).toBe(401);
                expect(findSlotRes.body?.success).toBe(false);

                const createRes = await supertest(app).post(postsPath).send({
                    organizationId: orgId,
                    body: "Anonymous post attempt",
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    tagNames: [],
                    status: "scheduled",
                });
                expect(createRes.status).toBe(401);
                expect(createRes.body?.success).toBe(false);
            } finally {
                tierLimitsSpy.mockRestore();
            }
        });

        it("rejects a non-member from scheduling on another user's SOLO workspace", async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken: ownerToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(ownerToken);
            const tierLimitsSpy = stubSoloPlanLimits();

            const strangerPayload = {
                email: `stranger-${uuidv4()}@test.com`,
                password: PASSWORD,
                fullName: faker.person.fullName(),
            };
            const { accessToken: strangerToken } = await signupVerifyAndSignIn(strangerPayload);

            try {
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
                    internalId: "solo-posts-stranger-channel",
                });

                const usageBefore = await subscriptionGuard.getPostsPerMonthUsage(orgId, ownerToken);
                expect(usageBefore.used).toBe(0);

                const findSlotRes = await supertest(app)
                    .get(`${postsPath}/find-slot`)
                    .query({ organizationId: orgId })
                    .set("Authorization", `Bearer ${strangerToken}`);
                expect(findSlotRes.status).toBe(403);

                const createRes = await supertest(app)
                    .post(postsPath)
                    .set("Authorization", `Bearer ${strangerToken}`)
                    .send({
                        organizationId: orgId,
                        body: "Stranger should not schedule on this workspace",
                        integrationIds: [integrationId],
                        isGlobal: true,
                        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                        tagNames: [],
                        status: "scheduled",
                    });
                expect(createRes.status).toBe(403);
                expect(createRes.body?.success).toBe(false);

                const usageAfter = await subscriptionGuard.getPostsPerMonthUsage(orgId, ownerToken);
                expect(usageAfter.used).toBe(usageBefore.used);
            } finally {
                tierLimitsSpy.mockRestore();
            }
        });

        itIfInviteSigning(
            "allows a workspace admin member to use the shared SOLO posts_per_month credit",
            async () => {
                const soloLimits = planLimitsForTier("SOLO");
                expect(soloLimits.posts_per_month).toBe(500);

                let workspaceSpies: SoloWorkspaceSpies | undefined;
                const tierLimitsSpy = stubSoloPlanLimits();

                try {
                    workspaceSpies = {
                        billingEnabledSpy: stubBillingEnabled(),
                        tierLimitsSpy,
                        subscriptionLookupSpy: stubSoloSubscriptionLookup(),
                        ...stubTeamSeatCapacityChecks(),
                    };

                    const { accessToken: ownerToken } = await signupVerifyAndSignIn({
                        email: `solo-owner-${uuidv4()}@test.com`,
                        password: PASSWORD,
                        fullName: faker.person.fullName(),
                    });
                    const orgId = await firstOrganizationId(ownerToken);
                    await activateWorkspace(ownerToken, orgId);
                    const workspaceCookie = [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`];

                    const adminEmail = `solo-admin-${uuidv4()}@test.com`;
                    const inviteAdminRes = await supertest(app)
                        .post(`${settingsPath}/team`)
                        .set("Authorization", `Bearer ${ownerToken}`)
                        .set("Cookie", workspaceCookie)
                        .send({ email: adminEmail, workspaceRole: "admin", sendEmail: false });
                    expect(inviteAdminRes.status).toBe(200);

                    const { accessToken: adminToken } = await signupVerifyAndSignIn({
                        email: adminEmail,
                        password: PASSWORD,
                        fullName: faker.person.fullName(),
                    });
                    await acceptWorkspaceInvite(adminToken, orgId);
                    await activateWorkspace(adminToken, orgId);

                    const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
                        internalId: "solo-posts-member-channel",
                    });

                    const usageBefore = await subscriptionGuard.getPostsPerMonthUsage(orgId);
                    expect(usageBefore.used).toBe(0);

                    const adminAuthUserId = await supabaseAuthUserId(adminToken);
                    await expect(
                        subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                            scope: "workspaceWithDelta",
                            organizationId: orgId,
                            delta: 1,
                            authUserId: adminAuthUserId,
                        })
                    ).resolves.toBeUndefined();

                    const adminFindSlot = await supertest(app)
                        .get(`${postsPath}/find-slot`)
                        .query({ organizationId: orgId })
                        .set("Authorization", `Bearer ${adminToken}`);
                    expect(adminFindSlot.status).toBe(200);
                    const adminScheduledAt = adminFindSlot.body?.data?.date as string;
                    expect(adminScheduledAt).toBeDefined();

                    const adminCreateRes = await supertest(app)
                        .post(postsPath)
                        .set("Authorization", `Bearer ${adminToken}`)
                        .send({
                            organizationId: orgId,
                            body: "Admin member shares workspace monthly post credit",
                            integrationIds: [integrationId],
                            isGlobal: true,
                            scheduledAt: adminScheduledAt,
                            tagNames: [],
                            status: "scheduled",
                        });
                    expect(adminCreateRes.status).toBe(200);
                    expect(adminCreateRes.body?.success).toBe(true);

                    const usageAfter = await subscriptionGuard.getPostsPerMonthUsage(orgId);
                    expect(usageAfter.used).toBe(usageBefore.used + 1);
                } finally {
                    tierLimitsSpy.mockRestore();
                    restoreSoloWorkspaceSpies(workspaceSpies);
                }
            }
        );

        itIfInviteSigning(
            "allows a workspace member (non-admin) to use the shared SOLO posts_per_month credit",
            async () => {
                const soloLimits = planLimitsForTier("SOLO");
                expect(soloLimits.posts_per_month).toBe(500);

                let workspaceSpies: SoloWorkspaceSpies | undefined;
                const tierLimitsSpy = stubSoloPlanLimits();

                try {
                    workspaceSpies = {
                        billingEnabledSpy: stubBillingEnabled(),
                        tierLimitsSpy,
                        subscriptionLookupSpy: stubSoloSubscriptionLookup(),
                        ...stubTeamSeatCapacityChecks(),
                    };

                    const { accessToken: ownerToken } = await signupVerifyAndSignIn({
                        email: `solo-owner-member-${uuidv4()}@test.com`,
                        password: PASSWORD,
                        fullName: faker.person.fullName(),
                    });
                    const orgId = await firstOrganizationId(ownerToken);
                    await activateWorkspace(ownerToken, orgId);
                    const workspaceCookie = [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`];

                    const memberEmail = `solo-member-${uuidv4()}@test.com`;
                    const inviteMemberRes = await supertest(app)
                        .post(`${settingsPath}/team`)
                        .set("Authorization", `Bearer ${ownerToken}`)
                        .set("Cookie", workspaceCookie)
                        .send({ email: memberEmail, workspaceRole: "user", sendEmail: false });
                    expect(inviteMemberRes.status).toBe(200);

                    const { accessToken: memberToken } = await signupVerifyAndSignIn({
                        email: memberEmail,
                        password: PASSWORD,
                        fullName: faker.person.fullName(),
                    });
                    await acceptWorkspaceInvite(memberToken, orgId);
                    await activateWorkspace(memberToken, orgId);

                    const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
                        internalId: "solo-posts-regular-member-channel",
                    });

                    const usageBefore = await subscriptionGuard.getPostsPerMonthUsage(orgId);
                    expect(usageBefore.used).toBe(0);

                    const memberAuthUserId = await supabaseAuthUserId(memberToken);
                    await expect(
                        subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                            scope: "workspaceWithDelta",
                            organizationId: orgId,
                            delta: 1,
                            authUserId: memberAuthUserId,
                        })
                    ).resolves.toBeUndefined();

                    const memberFindSlot = await supertest(app)
                        .get(`${postsPath}/find-slot`)
                        .query({ organizationId: orgId })
                        .set("Authorization", `Bearer ${memberToken}`);
                    expect(memberFindSlot.status).toBe(200);
                    const memberScheduledAt = memberFindSlot.body?.data?.date as string;
                    expect(memberScheduledAt).toBeDefined();

                    const memberCreateRes = await supertest(app)
                        .post(postsPath)
                        .set("Authorization", `Bearer ${memberToken}`)
                        .send({
                            organizationId: orgId,
                            body: "Regular member shares workspace monthly post credit",
                            integrationIds: [integrationId],
                            isGlobal: true,
                            scheduledAt: memberScheduledAt,
                            tagNames: [],
                            status: "scheduled",
                        });
                    expect(memberCreateRes.status).toBe(200);
                    expect(memberCreateRes.body?.success).toBe(true);

                    const usageAfter = await subscriptionGuard.getPostsPerMonthUsage(orgId);
                    expect(usageAfter.used).toBe(usageBefore.used + 1);
                } finally {
                    tierLimitsSpy.mockRestore();
                    restoreSoloWorkspaceSpies(workspaceSpies);
                }
            }
        );
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
