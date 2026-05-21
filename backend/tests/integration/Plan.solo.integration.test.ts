import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { SubscriptionError } from "../../errors/SubscriptionError";
import { EmailService } from "../../services/EmailService";
import {
    integrationService,
    permissionsService,
    subscriptionService,
} from "../../services/index";
import {
    attachSoloSubscription,
    insertTestSocialIntegration,
    seedMediaStorageUsage,
    seedMediaStorageUsage,
    seedSocialIntegrations,
} from "../helpers/integrationTestHelper";
import { seedScheduledSocialPosts } from "../helpers/postHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { planLimitsForTier } from "openquok-common";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const mediaPath = `${apiPrefix}/media`;
const postsPath = `${apiPrefix}/posts`;

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
 * - limited media library storage per workspace (`media_storage_bytes_per_workspace`, 5 GiB on SOLO)
 * - limited scheduled posts per billing month (`posts_per_month`)
 *
 * Policy checks run when Stripe billing is configured; this suite forces billing on via a spy
 * so limits apply using a real `organization_subscriptions` row.
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
        billingEnabledSpy = jest.spyOn(subscriptionService, "billingEnabled").mockReturnValue(true);
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
        await attachSoloSubscription(adminSupabase, orgId);

        const listRes = await supertest(app).get(settingsPath).set("Authorization", `Bearer ${accessToken}`);
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
    });

    itIfInviteSigning(
        "returns error when a SOLO workspace admin tries to invite another member (single seat)",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(accessToken);
            await attachSoloSubscription(adminSupabase, orgId);

            const inviteeEmail = `invitee-${uuidv4()}@test.com`.toLowerCase();
            const res = await supertest(app)
                .post(`${settingsPath}/${orgId}/invite`)
                .set("Authorization", `Bearer ${accessToken}`)
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

    it("blocks a new social channel when the workspace already has SOLO channel_per_workspace connections", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const channelCap = soloLimits.channel_per_workspace;
        expect(channelCap).toBe(15);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        await attachSoloSubscription(adminSupabase, orgId);

        const { internalIds } = await seedSocialIntegrations(adminSupabase, orgId, {
            count: channelCap, // 15 channels
            internalIdPrefix: "solo-cap-test",
            token: "test-token",
        });

        const connectedChannels = await integrationService.listByOrganization(orgId);
        expect(connectedChannels).toHaveLength(channelCap);

        await expect(
            permissionsService.assertConnectSocialChannelAllowed(orgId, "brand-new-internal-id")
        ).rejects.toBeInstanceOf(SubscriptionError);

        await expect(
            permissionsService.assertConnectSocialChannelAllowed(orgId, internalIds[0]!)
        ).resolves.toBeUndefined();
    });

    it("blocks scheduling another post when the workspace already has SOLO posts_per_month rows", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const postsCap = soloLimits.posts_per_month;
        expect(postsCap).toBe(500);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        await attachSoloSubscription(adminSupabase, orgId);

        await seedScheduledSocialPosts(adminSupabase, orgId, {
            count: postsCap,
            postGroupPrefix: "solo-posts-cap",
        });

        await expect(permissionsService.assertPostsPerMonthAllowed(orgId, 1)).rejects.toBeInstanceOf(
            SubscriptionError
        );

        await expect(permissionsService.assertPostsPerMonthAllowed(orgId, 0)).resolves.toBeUndefined();
    });

    it("blocks scheduling when creating a scheduled exceed the limit cap", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const postsCap = soloLimits.posts_per_month;
        expect(postsCap).toBe(500);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        await attachSoloSubscription(adminSupabase, orgId);

        const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
            internalId: "solo-posts-cap-channel",
        });

        await seedScheduledSocialPosts(adminSupabase, orgId, {
            count: postsCap,
            postGroupPrefix: "solo-posts-cap-api",
        });

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

    it("blocks media upload when workspace usage already meets SOLO media_storage_bytes_per_workspace", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const storageCap = soloLimits.media_storage_bytes_per_workspace;
        expect(storageCap).toBeGreaterThan(0);

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        await attachSoloSubscription(adminSupabase, orgId);

        await seedMediaStorageUsage(adminSupabase, orgId, {
            usedBytes: storageCap - 512,
            keyPrefix: "solo-storage-cap",
        });

        const uploadRes = await supertest(app)
            .post(`${mediaPath}/upload`)
            .set("Authorization", `Bearer ${accessToken}`)
            .field("organizationId", orgId)
            .attach("mediaFile", Buffer.alloc(1024), {
                filename: "over-cap.png",
                contentType: "image/png",
            });

        expect(uploadRes.status).toBe(402);
        expect(uploadRes.body?.success).toBe(false);
        expect(uploadRes.body?.error?.section).toBe("media_storage_bytes_per_workspace");
    });

    it("rejects additional bytes via assertMediaStorageAvailable when SOLO storage is full", async () => {
        const soloLimits = planLimitsForTier("SOLO");
        const storageCap = soloLimits.media_storage_bytes_per_workspace;

        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        await attachSoloSubscription(adminSupabase, orgId);

        await seedMediaStorageUsage(adminSupabase, orgId, {
            usedBytes: storageCap,
            keyPrefix: "solo-storage-cap-assert",
        });

        await expect(subscriptionService.assertMediaStorageAvailable(orgId, 1)).rejects.toBeInstanceOf(
            SubscriptionError
        );

        const drive = await subscriptionService.getWorkspaceDriveUsage(orgId);
        expect(drive.used).toBe(storageCap);
        expect(drive.total).toBeGreaterThanOrEqual(storageCap);
    });
    });
});
