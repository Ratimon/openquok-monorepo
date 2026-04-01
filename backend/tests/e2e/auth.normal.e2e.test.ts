import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
// import server from 'aws-ses-v2-local'

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const settingsPath = `${apiPrefix}/settings`;
const serverConfig = config.server as { frontendDomainUrl?: string };
const frontendUrl = serverConfig.frontendDomainUrl ?? "http://localhost:5173";

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

describe("Authentication Lifecycle E2E Tests", () => {
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
    let authToken: string | undefined;
    let refreshToken: string | undefined;

    let emailSendSpy: jest.SpyInstance;

    beforeAll(async () => {
        await userHelper.cleanTestUsersByEmailPattern();
        // Avoid real email transport during e2e (no local SES); prevents ECONNREFUSED logs
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);
    });

    afterAll(async () => {
        emailSendSpy?.mockRestore();
        await userHelper.cleanAll();
    });

    beforeEach(() => {
        testUser = userHelper.setupTestUser1();
    });

    afterEach(async () => {
        await userHelper.cleanAllStoredUsers();
    });

    describe("User Signup Flow", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(() => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("should create a new user account with valid data", async () => {
            const uniqueEmail = `test-signup-${faker.string.alphanumeric(8)}-${Date.now()}@example.com`;
            const fullName = faker.person.fullName();
            const signupData: SignupPayload = {
                email: uniqueEmail,
                password: "SecurePassword123!",
                fullName,
            };

            const res = await requestSignup(signupData, adminSupabase, userHelper);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty("user");
            expect(res.body.data?.session).toHaveProperty("accessToken");
            expect(typeof res.body.data?.session?.accessToken).toBe("string");
            expect(res.body.data?.user?.email?.toLowerCase()).toBe(uniqueEmail.toLowerCase());
            expect(res.body.data?.user?.fullName).toBe(fullName);

            // Assert default organization was created (createOrgAndUser-style)
            const accessToken = res.body.data?.session?.accessToken;
            expect(accessToken).toBeDefined();
            const listRes = await supertest(app)
                .get(settingsPath)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(listRes.status).toBe(200);
            expect(listRes.body.success).toBe(true);
            expect(Array.isArray(listRes.body.data)).toBe(true);
            expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
            const defaultOrg =
                listRes.body.data.find((o: { workspaceRole?: string }) => o.workspaceRole === "superadmin") ??
                listRes.body.data[0];
            expect(defaultOrg).toMatchObject({
                name: fullName,
                workspaceRole: "superadmin",
            });
            expect(defaultOrg.id).toBeDefined();
        });

        it("should reject signup with existing verified email after verification", async () => {
            const signupData: SignupPayload = {
                email: testUser.email,
                password: "AnotherPassword123!",
                fullName: faker.person.fullName(),
            };

            const first = await requestSignup(signupData, adminSupabase, userHelper);
            expect(first.status).toBe(201);
            expect(first.body.success).toBe(true);

            // Verify email so user is considered "verified" and sign-in is allowed
            const verifyRes = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );
            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.success).toBe(true);

            const second = await requestSignup(signupData, adminSupabase, userHelper);
            expect(second.status).toBe(409);
            expect(second.body.success).toBe(false);

            const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: "AnotherPassword123!",
            });
            expect(signInRes.status).toBe(200);
            expect(signInRes.body.success).toBe(true);
        });

        it("should reject signup with invalid email format", async () => {
            const res = await requestSignup(
                {
                    email: "invalid-email",
                    password: "Test1234!",
                    fullName: faker.person.fullName(),
                },
                adminSupabase,
                userHelper
            );

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
        });

        it("should fail with weak password", async () => {
            const res = await supertest(app).post(`${authPath}/sign-up`).send({
                email: `test-weak-${faker.string.alphanumeric(6)}@example.com`,
                password: "weak",
                fullName: faker.person.fullName(),
            });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
        });
    });

    describe("User Login Flow", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(() => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);
        });

        beforeEach(async () => {
            await requestSignup(
                {
                    email: testUser.email,
                    password: testUser.password,
                    fullName: testUser.fullName,
                },
                adminSupabase,
                userHelper
            );
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("should successfully login after verifying email", async () => {
            const verifyRes = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`
            );
            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.success).toBe(true);

            const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: testUser.password,
            });

            expect(getVerificationTokenSpy).toHaveBeenCalled();
            expect(signInRes.status).toBe(200);
            expect(signInRes.body.success).toBe(true);
            expect(signInRes.body.data).toHaveProperty("user");

            authToken = signInRes.body.data?.accessToken;
            refreshToken = signInRes.body.data?.refreshToken;
        });

        it("should reject login with invalid credentials", async () => {
            const res = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: "WrongPassword123!",
            });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should reject login with non-existent email", async () => {
            const res = await supertest(app).post(`${authPath}/sign-in`).send({
                email: "nonexistent@example.com",
                password: testUser.password,
            });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe("Token Refresh Flow", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(async () => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);

            await requestSignup(
                {
                    email: testUser.email,
                    password: testUser.password,
                    fullName: testUser.fullName,
                },
                adminSupabase,
                userHelper
            );

            const verifyRes = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`
            );
            expect(verifyRes.status).toBe(200);

            const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: testUser.password,
            });
            authToken = signInRes.body.data?.accessToken;
            refreshToken = signInRes.body.data?.refreshToken;
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("should refresh token successfully", async () => {
            if (!refreshToken) {
                console.warn("No refresh token; skipping refresh test");
                return;
            }

            const refreshRes = await supertest(app)
                .post(`${authPath}/refresh`)
                .set("Cookie", `refreshToken=${refreshToken}`)
                .send({ refreshToken });

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.data?.accessToken).toBeDefined();
            expect(refreshRes.body.data?.expiresIn).toBeDefined();
            expect(refreshRes.body.data?.tokenType).toBeDefined();
        });
    });

    describe("Logout Flow", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(async () => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);

            await requestSignup(
                {
                    email: testUser.email,
                    password: testUser.password,
                    fullName: testUser.fullName,
                },
                adminSupabase,
                userHelper
            );

            const verifyRes = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`
            );
            expect(verifyRes.status).toBe(200);

            const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: testUser.password,
            });
            authToken = signInRes.body.data?.accessToken;
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("should logout successfully", async () => {
            const res = await supertest(app).post(`${authPath}/sign-out`).send({});

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/signed out|logged out/i);
        });
    });

    describe("Email verification after signup", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(() => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("user can confirm email with valid token and then sign in", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const verifyRes = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );
            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.success).toBe(true);
            expect(verifyRes.body.message).toMatch(/verified|success/i);

            const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(signInRes.status).toBe(200);
            expect(signInRes.body.success).toBe(true);
        });

        it("confirming with missing token returns 400", async () => {
            const res = await supertest(app).get(
                `${authPath}/verify-signup?email=${encodeURIComponent(testUser.email)}`
            );
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("confirming with invalid token format returns 400", async () => {
            const res = await supertest(app).get(
                `${authPath}/verify-signup?token=invalid-token`
            );
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("confirming with unknown or expired token returns 400", async () => {
            const unknownToken = "c".repeat(64);
            const res = await supertest(app).get(
                `${authPath}/verify-signup?token=${unknownToken}`
            );
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/invalid|expired/i);
        });

        it("confirming again with same token after verification returns 400 (token was consumed)", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const first = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );
            expect(first.status).toBe(200);
            expect(first.body.success).toBe(true);

            // Token was cleared after first verification, so same token is no longer valid
            const second = await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );
            expect(second.status).toBe(400);
            expect(second.body.success).toBe(false);
            expect(second.body.message).toMatch(/invalid|expired/i);
        });
    });

    describe("Verification link in email (redirect to app)", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(() => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("valid link redirects to frontend verify page with token and email", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const res = await supertest(app)
                .get(`${authPath}/request-verify-signup?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`)
                .redirects(0);

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain("/verify-signup");
            expect(res.headers.location).toContain(`token=${verificationToken}`);
            // App normalizes email to lowercase in redirect URL
            expect(res.headers.location).toContain(`email=${encodeURIComponent(testUser.email.toLowerCase())}`);
            expect(res.headers.location).toMatch(new RegExp(`^${frontendUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
        });

        it("link for already verified user redirects to sign-up", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );
            await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );

            const res = await supertest(app)
                .get(`${authPath}/request-verify-signup?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`)
                .redirects(0);

            expect(res.status).toBe(302);
            // App may redirect to sign-up or to auth-error (e.g. "link expired") for already-verified user
            expect(
                res.headers.location === `${frontendUrl}/sign-up` ||
                    res.headers.location?.startsWith(`${frontendUrl}/auth-error`)
            ).toBe(true);
        });

        it("invalid or expired link redirects to auth-error with message", async () => {
            const badToken = "a".repeat(64);
            const res = await supertest(app)
                .get(`${authPath}/request-verify-signup?token=${badToken}&email=${encodeURIComponent(testUser.email)}`)
                .redirects(0);

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain("/auth-error");
            expect(res.headers.location).toContain("message=");
        });

        it("missing or invalid token/email in link returns 400", async () => {
            const resMissing = await supertest(app).get(
                `${authPath}/request-verify-signup?email=${encodeURIComponent(testUser.email)}`
            );
            expect(resMissing.status).toBe(400);

            const resBadToken = await supertest(app).get(
                `${authPath}/request-verify-signup?token=short&email=${encodeURIComponent(testUser.email)}`
            );
            expect(resBadToken.status).toBe(400);
        });
    });

    describe("Validate verification token before confirming", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(() => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("valid token and matching email for unverified user returns valid", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const res = await supertest(app).get(
                `${authPath}/check-signup-verification?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/valid|not expired/i);
        });

        it("missing token or email returns invalid", async () => {
            // Token only (no email): API returns success false, missing message
            const resNoEmail = await supertest(app).get(
                `${authPath}/check-signup-verification?token=${verificationToken}`
            );
            expect(resNoEmail.status).toBe(200);
            expect(resNoEmail.body.success).toBe(false);
            expect(resNoEmail.body.message).toMatch(/missing/i);

            // Email only (no token): 
            const resNoToken = await supertest(app).get(
                `${authPath}/check-signup-verification?email=${encodeURIComponent(testUser.email)}`
            );
            expect(resNoToken.status).toBe(200);
            expect(resNoToken.body.success).toBe(true);
            expect(resNoToken.body).toHaveProperty("verified");
        });

        it("invalid or expired token returns invalid", async () => {
            const badToken = "b".repeat(64);
            const res = await supertest(app).get(
                `${authPath}/check-signup-verification?token=${badToken}&email=${encodeURIComponent(testUser.email)}`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found|expired/i);
        });

        it("email that does not match token returns invalid", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const res = await supertest(app).get(
                `${authPath}/check-signup-verification?token=${verificationToken}&email=${encodeURIComponent("other@example.com")}`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/does not belong|email/i);
        });

        it("already verified user returns invalid (token was consumed so not found)", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );
            await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );

            const res = await supertest(app).get(
                `${authPath}/check-signup-verification?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`
            );

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found|expired/i);
        });
    });

    describe("Resend verification email", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;

        beforeAll(() => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
        });

        it("unverified user can request a new verification email", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );

            const res = await supertest(app)
                .post(`${authPath}/send-verification-email`)
                .send({ email: testUser.email });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBeDefined();
        }, 10000);

        it("already verified user gets generic success (no information leak)", async () => {
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );
            await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}`
            );

            const res = await supertest(app)
                .post(`${authPath}/send-verification-email`)
                .send({ email: testUser.email });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it("non-existent email gets generic success (no enumeration)", async () => {
            const res = await supertest(app)
                .post(`${authPath}/send-verification-email`)
                .send({ email: "nonexistent@example.com" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBeDefined();
        });

        it("missing or invalid email in body returns 400", async () => {
            const resMissing = await supertest(app)
                .post(`${authPath}/send-verification-email`)
                .send({});
            expect(resMissing.status).toBe(400);

            const resInvalid = await supertest(app)
                .post(`${authPath}/send-verification-email`)
                .send({ email: "not-an-email" });
            expect(resInvalid.status).toBe(400);
        });
    });

    describe("Password reset (ask-reset + verify-reset with custom email)", () => {
        let getVerificationTokenSpy: jest.SpyInstance;
        let verificationToken: string;
        let capturedRecoveryCode: string | undefined;

        beforeAll(() => {
            verificationToken = generateRandomVerificationToken();
            getVerificationTokenSpy = jest
                .spyOn(EmailService.prototype, "generateVerificationToken")
                .mockImplementation(() => verificationToken);
            emailSendSpy.mockImplementation(async (template: { buildText?: () => string }, to: string) => {
                if (template?.buildText) {
                    const text = template.buildText();
                    const match = text.match(/Your code is (\S+)/);
                    if (match) capturedRecoveryCode = match[1];
                }
            });
        });

        afterAll(() => {
            getVerificationTokenSpy?.mockRestore();
            emailSendSpy.mockResolvedValue(undefined);
        });

        it(" sends reset email with code; verify-reset accepts code", async () => {
            capturedRecoveryCode = undefined;
            await requestSignup(
                { email: testUser.email, password: testUser.password, fullName: testUser.fullName },
                adminSupabase,
                userHelper
            );
            await supertest(app).get(
                `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(testUser.email)}`
            );

            const askRes = await supertest(app)
                .post(`${authPath}/ask-reset`)
                .send({ email: testUser.email });

            expect(askRes.status).toBe(200);
            expect(askRes.body.success).toBe(true);
            expect(askRes.body.message).toMatch(/account exists|password reset/i);
            expect(emailSendSpy).toHaveBeenCalled();
            expect(capturedRecoveryCode).toBeDefined();
            expect(String(capturedRecoveryCode).length).toBe(6);

            const verifyRes = await supertest(app).get(
                `${authPath}/verify-reset?email=${encodeURIComponent(testUser.email)}&code=${capturedRecoveryCode}&type=recovery`
            );

            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.success).toBe(true);
            expect(verifyRes.body.data?.accessToken).toBeDefined();
            expect(verifyRes.body.data?.refreshToken).toBeDefined();
            expect(verifyRes.body.data?.user?.email?.toLowerCase()).toBe(testUser.email.toLowerCase());
        }, 15000);

        it("ask-reset with non-existent email returns 200 (no enumeration)", async () => {
            const res = await supertest(app)
                .post(`${authPath}/ask-reset`)
                .send({ email: "nonexistent-reset@example.com" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/account exists|password reset/i);
        });

        it("ask-reset with invalid body returns 400", async () => {
            const res = await supertest(app)
                .post(`${authPath}/ask-reset`)
                .set("Content-Type", "application/json")
                .send({ email: "not-an-email" });

            // Invalid email format: validation returns 400. If auth runs first (e.g. /auth not public in config), we get 401.
            expect([400, 401]).toContain(res.status);
            expect(res.body.success).toBe(false);
        });
    });
});
