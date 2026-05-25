import { randomUUID } from "crypto";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    prepareSoloWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { ACTIVE_ORGANIZATION_COOKIE } from "../../utils/session/sessionCookies";
import { planLimitsForTier } from "openquok-common";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase =
    supabaseUrl && supabaseSecretKey ? describe : describe.skip;

describeIfSupabase("GET /users/me workspace session (integration)", () => {
    const userHelper = new UserTestHelper();

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;
    let soloWorkspaceSpies: SoloWorkspaceSpies;

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
        soloWorkspaceSpies = prepareSoloWorkspace();
    });

    afterEach(async () => {
        restoreSoloWorkspaceSpies(soloWorkspaceSpies);
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function signUpAndGetToken(): Promise<{ accessToken: string }> {
        const { accessToken } = await signupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken
        );
        return { accessToken };
    }

    it("returns profile only when organizationId is omitted", async () => {
        const { accessToken } = await signUpAndGetToken();

        const res = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body?.data?.email).toBeDefined();
        expect(res.body?.data?.orgId).toBeUndefined();
        expect(res.body?.data?.tier).toBeUndefined();
    });

    it("returns session fields when organizationId is provided", async () => {
        const { accessToken } = await signUpAndGetToken();

        const listRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();

        const soloLimits = planLimitsForTier("SOLO");

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .query({ organizationId: orgId })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(meRes.status).toBe(200);
        const data = meRes.body?.data;
        expect(data?.orgId).toBe(orgId);
        expect(data?.tier).toBe("SOLO");
        expect(data?.tierPlan?.channel_per_workspace).toBe(soloLimits.channel_per_workspace);
        expect(data?.channelsPerWorkspace).toBe(soloLimits.channel_per_workspace);
        expect(data?.role).toBe("OWNER");
        expect(data?.billingEnabled).toBe(true);
        expect(typeof data?.publicApi).toBe("string");
        expect(data?.isPlatformAdmin).toBe(false);
        expect(data?.impersonate).toBe(false);
    });

    it("rejects invalid organizationId query", async () => {
        const { accessToken } = await signUpAndGetToken();

        const res = await supertest(app)
            .get(`${usersPath}/me`)
            .query({ organizationId: "not-a-uuid" })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(400);
    });

    it("returns profile and clears stale showorg cookie when workspace no longer exists", async () => {
        const { accessToken } = await signUpAndGetToken();
        const staleOrgId = randomUUID();

        const res = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`)
            .set("Cookie", [`${ACTIVE_ORGANIZATION_COOKIE}=${staleOrgId}`]);

        expect(res.status).toBe(200);
        expect(res.body?.data?.email).toBeDefined();
        expect(res.body?.data?.isEmailVerified).toBe(true);
        expect(res.body?.data?.orgId).toBeUndefined();

        const setCookie = res.headers["set-cookie"];
        const cleared = Array.isArray(setCookie)
            ? setCookie.some(
                  (c) =>
                      typeof c === "string" &&
                      c.startsWith(`${ACTIVE_ORGANIZATION_COOKIE}=`) &&
                      /Max-Age=0|Expires=/i.test(c)
              )
            : false;
        expect(cleared).toBe(true);
    });
});
