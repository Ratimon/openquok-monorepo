import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { SubscriptionError } from "../../errors/SubscriptionError";
import { EmailService } from "../../services/EmailService";
import { integrationService, permissionsService, subscriptionService } from "../../services/index";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { planLimitsForTier } from "openquok-common";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;

const inviteTokenSecret = (config.auth as { inviteTokenSecret?: string } | undefined)?.inviteTokenSecret?.trim();
const itIfInviteSigning = inviteTokenSecret ? it : it.skip;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase =
    supabaseUrl && supabaseSecretKey ? describe : describe.skip;

/**
 * SOLO tier caps from the shared plan catalog (`planLimitsForTier("SOLO")`):
 * - one workspace seat (no additional team members / invites beyond the owner)
 * - limited connected channels per workspace
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

    async function attachSoloSubscription(organizationId: string): Promise<void> {
        const { error } = await adminSupabase.from("organization_subscriptions").upsert(
            {
                organization_id: organizationId,
                subscription_tier: "SOLO",
                period: "MONTHLY",
                identifier: `test_checkout_${uuidv4()}`,
                cancel_at: null,
                total_channels: 0,
                is_lifetime: false,
                deleted_at: null,
            },
            { onConflict: "organization_id" }
        );
        expect(error).toBeNull();
    }

    itIfInviteSigning(
        "returns error when a SOLO workspace admin tries to invite another member (single seat)",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken } = await signupVerifyAndSignIn(payload);
            const orgId = await firstOrganizationId(accessToken);
            await attachSoloSubscription(orgId);

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
        await attachSoloSubscription(orgId);

        const now = new Date().toISOString();
        const seedRows = Array.from({ length: channelCap }, (_, i) => ({
            organization_id: orgId,
            internal_id: `solo-cap-test-${i}`,
            name: `Test channel ${i}`,
            picture: null,
            provider_identifier: "threads",
            type: "social",
            token: "test-token",
            disabled: false,
            token_expiration: null,
            refresh_token: null,
            profile: null,
            deleted_at: null,
            created_at: now,
            updated_at: now,
            in_between_steps: false,
            refresh_needed: false,
            posting_times: "[{\"time\":120},{\"time\":400},{\"time\":700}]",
            custom_instance_details: null,
            customer_id: null,
            root_internal_id: `solo-cap-test-${i}`,
            additional_settings: "[]",
        }));

        const { error: insertErr } = await adminSupabase.from("integrations").insert(seedRows);
        expect(insertErr).toBeNull();

        const connectedChannels = await integrationService.listByOrganization(orgId);
        expect(connectedChannels).toHaveLength(channelCap);

        await expect(
            permissionsService.assertConnectSocialChannelAllowed(orgId, "brand-new-internal-id")
        ).rejects.toBeInstanceOf(SubscriptionError);

        await expect(
            permissionsService.assertConnectSocialChannelAllowed(orgId, "solo-cap-test-0")
        ).resolves.toBeUndefined();
    });
});
