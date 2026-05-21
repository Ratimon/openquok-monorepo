import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { ACTIVE_ORGANIZATION_COOKIE } from "../../utils/session/sessionCookies";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    activateWorkspace,
    prepareSoloWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const billingPath = `${apiPrefix}/billing`;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase =
    supabaseUrl && supabaseSecretKey ? describe : describe.skip;

describeIfSupabase("User workspace cookies (integration)", () => {
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

    it("GET /users/me returns session fields when showorg cookie is set", async () => {
        const { accessToken } = await signupVerifyAndSignIn();

        const orgsRes = await supertest(app)
            .get(`${usersPath}/organizations`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(orgsRes.status).toBe(200);
        const orgId = orgsRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();

        await activateWorkspace(accessToken, orgId);

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`)
            .set("Cookie", [`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`]);

        expect(meRes.status).toBe(200);
        expect(meRes.body?.data?.orgId).toBe(orgId);
        expect(meRes.body?.data?.tier).toBe("SOLO");
    });

    it("POST /users/change-org sets showorg cookie", async () => {
        const { accessToken } = await signupVerifyAndSignIn();

        const orgsRes = await supertest(app)
            .get(`${usersPath}/organizations`)
            .set("Authorization", `Bearer ${accessToken}`);
        const orgId = orgsRes.body?.data?.[0]?.id as string;

        const changeRes = await supertest(app)
            .post(`${usersPath}/change-org`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ id: orgId });

        expect(changeRes.status).toBe(200);
        expect(changeRes.body?.data?.id).toBe(orgId);
        const setCookie = changeRes.headers["set-cookie"];
        const cookieHeader = Array.isArray(setCookie) ? setCookie.join(";") : String(setCookie ?? "");
        expect(cookieHeader).toContain(`${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`);
    });

    it("GET /users/subscription and GET /billing use showorg cookie", async () => {
        const { accessToken } = await signupVerifyAndSignIn();

        const orgsRes = await supertest(app)
            .get(`${usersPath}/organizations`)
            .set("Authorization", `Bearer ${accessToken}`);
        const orgId = orgsRes.body?.data?.[0]?.id as string;

        await activateWorkspace(accessToken, orgId);

        const cookieHeader = `${ACTIVE_ORGANIZATION_COOKIE}=${orgId}`;

        const subRes = await supertest(app)
            .get(`${usersPath}/subscription`)
            .set("Authorization", `Bearer ${accessToken}`)
            .set("Cookie", [cookieHeader]);
        expect(subRes.status).toBe(200);
        expect(subRes.body?.data?.subscription?.organization_id).toBe(orgId);

        const billingRes = await supertest(app)
            .get(`${billingPath}/current`)
            .set("Authorization", `Bearer ${accessToken}`)
            .set("Cookie", [cookieHeader]);
        const billingWithQueryRes = await supertest(app)
            .get(`${billingPath}/current`)
            .query({ organizationId: orgId })
            .set("Authorization", `Bearer ${accessToken}`);
        expect(billingWithQueryRes.status).toBe(billingRes.status);
        if (billingRes.status === 200) {
            expect(billingRes.body?.data?.tier).toBe("SOLO");
        }
    });
});
