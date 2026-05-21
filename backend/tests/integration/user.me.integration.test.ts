import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    prepareSoloWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
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

    afterAll(() => {
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    beforeEach(() => {
        soloWorkspaceSpies = prepareSoloWorkspace();
    });

    afterEach(async () => {
        restoreSoloWorkspaceSpies(soloWorkspaceSpies);
        await userHelper.cleanAllStoredUsers();
    });

    async function signupVerifyAndSignIn(): Promise<{ accessToken: string }> {
        const payload = userHelper.setupTestUser1();
        const signupRes = await supertest(app).post(`${authPath}/sign-up`).send(payload);
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
        return { accessToken: accessToken as string };
    }

    it("returns profile only when organizationId is omitted", async () => {
        const { accessToken } = await signupVerifyAndSignIn();

        const res = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body?.data?.email).toBeDefined();
        expect(res.body?.data?.orgId).toBeUndefined();
        expect(res.body?.data?.tier).toBeUndefined();
    });

    it("returns session fields when organizationId is provided", async () => {
        const { accessToken } = await signupVerifyAndSignIn();

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
        expect(data?.totalChannels).toBe(soloLimits.channel_per_workspace);
        expect(data?.role).toBe("OWNER");
        expect(data?.billingEnabled).toBe(true);
        expect(typeof data?.publicApi).toBe("string");
        expect(data?.isPlatformAdmin).toBe(false);
        expect(data?.impersonate).toBe(false);
    });

    it("rejects invalid organizationId query", async () => {
        const { accessToken } = await signupVerifyAndSignIn();

        const res = await supertest(app)
            .get(`${usersPath}/me`)
            .query({ organizationId: "not-a-uuid" })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(400);
    });
});
