import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { integrationService, subscriptionService } from "../../services/index";
import {
    insertTestSocialIntegration,
    seedSocialIntegrationsWithSpecs,
} from "../helpers/integrationTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import { stubBillingEnabled, stubPlanLimitsWithActiveChannelCap } from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const settingsPath = `${apiPrefix}/settings`;
const integrationsPath = `${apiPrefix}/integrations`;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase = supabaseUrl && supabaseSecretKey ? describe : describe.skip;

jest.mock("openquok-orchestrator", () => ({
    __esModule: true,
    runScheduledSocialPostOrchestration: jest.fn().mockResolvedValue(true),
}));

/**
 * Focused SOLO billing checks for active-channel cap enforcement (enable-at-cap and downgrade auto-disable).
 * Kept separate from Plan.solo.integration.test.ts so it can run without loading the full SOLO suite.
 */
describeIfSupabase("SOLO active channel cap (integration)", () => {
    const adminSupabase = createClient(supabaseUrl!, supabaseSecretKey!) as SupabaseClient;
    const userHelper = new UserTestHelper();
    const ACTIVE_CHANNEL_CAP = 3;

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
        return { accessToken };
    }

    async function firstOrganizationId(accessToken: string): Promise<string> {
        const listRes = await supertest(app).get(settingsPath).set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();
        return orgId;
    }

    it("blocks enabling a disabled channel when the workspace is at the active cap", async () => {
        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);
        const tierLimitsSpy = stubPlanLimitsWithActiveChannelCap("SOLO", ACTIVE_CHANNEL_CAP);

        const activeIds: string[] = [];
        for (let i = 0; i < ACTIVE_CHANNEL_CAP; i++) {
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId, {
                internalId: `solo-active-cap-active-${i}`,
                createdAt: new Date(Date.UTC(2020, 0, i + 1)).toISOString(),
            });
            activeIds.push(integrationId);
        }

        const { integrationId: disabledChannelId } = await insertTestSocialIntegration(adminSupabase, orgId, {
            internalId: "solo-active-cap-disabled",
            disabled: true,
            createdAt: new Date(Date.UTC(2026, 0, 1)).toISOString(),
        });

        try {
            const blockedRes = await supertest(app)
                .post(`${integrationsPath}/enable`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ organizationId: orgId, id: disabledChannelId });

            expect(blockedRes.status).toBe(402);
            expect(blockedRes.body?.success).toBe(false);
            expect(blockedRes.body?.error?.section).toBe("channel_per_workspace");

            const disableRes = await supertest(app)
                .post(`${integrationsPath}/disable`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ organizationId: orgId, id: activeIds[0] });
            expect(disableRes.status).toBe(200);
            expect(disableRes.body?.success).toBe(true);

            const enableRes = await supertest(app)
                .post(`${integrationsPath}/enable`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ organizationId: orgId, id: disabledChannelId });
            expect(enableRes.status).toBe(200);
            expect(enableRes.body?.success).toBe(true);

            const channels = await integrationService.listByOrganization(orgId);
            expect(channels).toHaveLength(ACTIVE_CHANNEL_CAP + 1);
            expect(channels.filter((c) => !c.disabled)).toHaveLength(ACTIVE_CHANNEL_CAP);
            expect(channels.find((c) => c.id === disabledChannelId)?.disabled).toBe(false);
            expect(channels.find((c) => c.id === activeIds[0])?.disabled).toBe(true);
        } finally {
            tierLimitsSpy.mockRestore();
        }
    });

    it("auto-disables the newest active channels when a downgrade lowers the active cap", async () => {
        const payload = userHelper.setupTestUser1();
        const { accessToken } = await signupVerifyAndSignIn(payload);
        const orgId = await firstOrganizationId(accessToken);

        const createdAtByIndex = [
            "2020-01-01T00:00:00.000Z",
            "2021-06-01T00:00:00.000Z",
            "2022-12-01T00:00:00.000Z",
            "2025-06-01T00:00:00.000Z",
            "2026-01-01T00:00:00.000Z",
        ];
        const { integrationIds } = await seedSocialIntegrationsWithSpecs(
            adminSupabase,
            orgId,
            createdAtByIndex.map((createdAt, index) => ({
                internalId: `solo-downgrade-ch-${index}`,
                createdAt,
            }))
        );

        const beforeDowngrade = await integrationService.listByOrganization(orgId);
        expect(beforeDowngrade).toHaveLength(5);
        expect(beforeDowngrade.every((c) => !c.disabled)).toBe(true);

        await subscriptionService.createOrUpdateFromStripe({
            organizationId: orgId,
            isTrialing: false,
            identifier: `solo-downgrade-${uuidv4()}`,
            subscriptionTier: "SOLO",
            period: "MONTHLY",
            channelsPerWorkspace: ACTIVE_CHANNEL_CAP,
            cancelAt: null,
        });

        const afterDowngrade = await integrationService.listByOrganization(orgId);
        expect(afterDowngrade).toHaveLength(5);
        expect(afterDowngrade.filter((c) => !c.disabled)).toHaveLength(ACTIVE_CHANNEL_CAP);
        expect(afterDowngrade.filter((c) => c.disabled)).toHaveLength(2);

        const disabledIds = afterDowngrade.filter((c) => c.disabled).map((c) => c.id).sort();
        expect(disabledIds).toEqual([integrationIds[3], integrationIds[4]].sort());

        const activeIds = afterDowngrade.filter((c) => !c.disabled).map((c) => c.id);
        expect(activeIds).toEqual([integrationIds[0], integrationIds[1], integrationIds[2]]);
    });
});
