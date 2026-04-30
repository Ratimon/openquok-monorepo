import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const settingsPath = `${apiPrefix}/settings`;
const signaturesPath = `${apiPrefix}/signatures`;

interface SignupPayload {
    email: string;
    password: string;
    fullName?: string;
}

async function requestSignup(
    payload: SignupPayload,
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper
) {
    const res = await supertest(app).post(`${authPath}/sign-up`).send(payload);
    if (res.body?.success && res.body?.data?.session?.accessToken) {
        const token = res.body.data.session.accessToken;
        const {
            data: { user },
        } = await adminSupabase.auth.getUser(token);
        if (user?.id) userHelper.trackUser(user.id);
    }
    return res;
}

async function signUpVerifyAndSignIn(
    payload: SignupPayload,
    verificationToken: string,
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper
): Promise<string> {
    const signupRes = await requestSignup(payload, adminSupabase, userHelper);
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
    expect(signInRes.body.data?.accessToken).toBeDefined();
    return signInRes.body.data.accessToken;
}

/** GET /settings and return the first organization id (default org after signup). */
async function getFirstOrgId(accessToken: string): Promise<string> {
    const res = await supertest(app).get(settingsPath).set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const first = res.body.data[0];
    expect(first.id).toBeDefined();
    return first.id;
}

describe("Signatures E2E", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseServiceRoleKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseServiceRoleKey!
    );
    const userHelper = new UserTestHelper();

    let testUser: { email: string; password: string; fullName: string };
    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;

    beforeAll(async () => {
        await userHelper.cleanTestUsersByEmailPattern();
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        getVerificationTokenSpy?.mockRestore();
        await userHelper.cleanAllStoredUsers();
        await userHelper.cleanTestUsersByEmailPattern();
    });

    beforeEach(() => {
        testUser = userHelper.setupTestUser1();
    });

    afterEach(async () => {
        await userHelper.cleanAllStoredUsers();
    });

    it("unauthenticated requests are rejected", async () => {
        const res = await supertest(app).get(signaturesPath).query({ organizationId: randomUUID() });
        expect(res.status).toBe(401);
    });

    it("authenticated user can create, list, update, and delete signatures", async () => {
        const accessToken = await signUpVerifyAndSignIn(
            { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
            verificationToken,
            adminSupabase,
            userHelper
        );

        const organizationId = await getFirstOrgId(accessToken);

        const createRes = await supertest(app)
            .post(signaturesPath)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                organizationId,
                title: "My signature",
                content: "— OpenQuok",
                isDefault: true,
            });
        expect(createRes.status).toBe(201);
        expect(createRes.body.success).toBe(true);
        const id = createRes.body.data?.id;
        expect(typeof id).toBe("string");

        const listRes = await supertest(app)
            .get(signaturesPath)
            .query({ organizationId })
            .set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.success).toBe(true);
        expect(Array.isArray(listRes.body.data)).toBe(true);
        expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
        expect(listRes.body.data[0]).toMatchObject({
            id,
            title: "My signature",
            content: "— OpenQuok",
            isDefault: true,
        });

        const patchRes = await supertest(app)
            .patch(`${signaturesPath}/${id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Updated signature" });
        expect(patchRes.status).toBe(200);
        expect(patchRes.body.success).toBe(true);

        const getRes = await supertest(app)
            .get(`${signaturesPath}/${id}`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.success).toBe(true);
        expect(getRes.body.data).toMatchObject({
            id,
            title: "Updated signature",
            content: "— OpenQuok",
        });

        const delRes = await supertest(app)
            .delete(`${signaturesPath}/${id}`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(delRes.status).toBe(200);
        expect(delRes.body.success).toBe(true);
    });
});

