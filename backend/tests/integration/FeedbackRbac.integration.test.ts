/// <reference types="jest" />
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import supertest from "supertest";
import { faker } from "@faker-js/faker";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const feedbackPath = `${apiPrefix}/feedback`;

const PASSWORD = "Test1234!";

/**
 * Feedback RBAC integration tests. Requires user_roles, feedback table.
 * Simplified: shared helpers, grouped flows, fewer duplicate setups.
 */
describe("Feedback RBAC", () => {
    const supabaseConfig = config.supabase as {
        supabaseUrl: string;
        supabaseServiceRoleKey?: string;
    };
    const adminSupabase = createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseServiceRoleKey!
    ) as SupabaseClient;
    const userHelper = new UserTestHelper();

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;
    let createdFeedbackIds: string[] = [];
    let superAdminPublicId: string;
    let adminUserPublicId: string;
    let editorUserPublicId: string;

    beforeAll(async () => {
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

    afterEach(async () => {
        for (const id of createdFeedbackIds) {
            try {
                await adminSupabase.from("feedback").delete().eq("id", id);
            } catch {
                // ignore
            }
        }
        createdFeedbackIds = [];
        if (adminUserPublicId) {
            try {
                await adminSupabase.from("user_roles").delete().eq("user_id", adminUserPublicId);
            } catch {
                // ignore
            }
        }
        if (editorUserPublicId) {
            try {
                await adminSupabase.from("user_roles").delete().eq("user_id", editorUserPublicId);
            } catch {
                // ignore
            }
        }
        if (superAdminPublicId) {
            try {
                await adminSupabase.from("users").update({ is_super_admin: false }).eq("id", superAdminPublicId);
            } catch {
                // ignore
            }
        }
        await userHelper.cleanAllStoredUsers();
    });

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string; publicId: string }> {
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
        const publicId = meRes.body?.data?.id;
        expect(publicId).toBeDefined();
        return { accessToken, publicId };
    }

    /** Create super admin and optionally a second user with role; returns tokens and ids. */
    async function createSuperAdmin(): Promise<{ token: string; publicId: string }> {
        const result = await signupVerifyAndSignIn({
            email: `super-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        });
        superAdminPublicId = result.publicId;
        await adminSupabase.from("users").update({ is_super_admin: true }).eq("id", result.publicId);
        return { token: result.accessToken, publicId: result.publicId };
    }

    async function createUserWithRole(
        superAdminToken: string,
        role: "admin" | "support"
    ): Promise<{ token: string; publicId: string }> {
        const result = await signupVerifyAndSignIn({
            email: `${role}-${uuidv4()}@test.com`,
            password: PASSWORD,
            fullName: faker.person.fullName(),
        });
        if (role === "admin") adminUserPublicId = result.publicId;
        else editorUserPublicId = result.publicId;

        const assignRes = await supertest(app)
            .post(`${usersPath}/${result.publicId}/roles/${role}`)
            .set("Authorization", `Bearer ${superAdminToken}`);
        expect(assignRes.status).toBe(200);
        expect(assignRes.body.success).toBe(true);
        return { token: result.accessToken, publicId: result.publicId };
    }

    function submitFeedbackAsAnon(): Promise<string> {
        return (async () => {
            const res = await supertest(app).post(`${feedbackPath}/`).send({
                feedback_type: "propose",
                url: "https://example.com/page",
                description: "At least ten characters here for validation.",
                email: "anon@example.com",
            });
            expect(res.status).toBe(201);
            const id = res.body?.data?.id;
            expect(id).toBeDefined();
            createdFeedbackIds.push(id);
            return id;
        })();
    }

    describe("Submit and manage feedback", () => {
        it("anonymous can submit; admin can list and mark handled; unauthenticated cannot list", async () => {
            const superAdmin = await createSuperAdmin();
            const admin = await createUserWithRole(superAdmin.token, "admin");

            const feedbackId = await submitFeedbackAsAnon();

            const listRes = await supertest(app)
                .get(`${feedbackPath}/`)
                .set("Authorization", `Bearer ${admin.token}`)
                .expect(200);
            expect(listRes.body.success).toBe(true);
            expect(Array.isArray(listRes.body.data)).toBe(true);
            expect(listRes.body.data.find((f: { id: string }) => f.id === feedbackId)).toBeDefined();

            await supertest(app)
                .patch(`${feedbackPath}/${feedbackId}`)
                .set("Authorization", `Bearer ${admin.token}`)
                .send({ is_handled: true })
                .expect(200);

            const listAfter = await supertest(app)
                .get(`${feedbackPath}/`)
                .set("Authorization", `Bearer ${admin.token}`)
                .expect(200);
            expect(listAfter.body.data.find((f: { id: string }) => f.id === feedbackId)?.isHandled).toBe(true);

            await supertest(app).get(`${feedbackPath}/`).expect(401);
        });

        it("support can list and handle; after role revoke cannot", async () => {
            const superAdmin = await createSuperAdmin();
            const support = await createUserWithRole(superAdmin.token, "support");

            const feedbackId = await submitFeedbackAsAnon();

            const listRes = await supertest(app)
                .get(`${feedbackPath}/`)
                .set("Authorization", `Bearer ${support.token}`)
                .expect(200);
            expect(listRes.body.data.find((f: { id: string }) => f.id === feedbackId)).toBeDefined();

            await supertest(app)
                .delete(`${usersPath}/${support.publicId}/roles/support`)
                .set("Authorization", `Bearer ${superAdmin.token}`)
                .expect(200);

            await supertest(app)
                .get(`${feedbackPath}/`)
                .set("Authorization", `Bearer ${support.token}`)
                .expect(403);
            await supertest(app)
                .patch(`${feedbackPath}/${feedbackId}`)
                .set("Authorization", `Bearer ${support.token}`)
                .send({ is_handled: true })
                .expect(403);
        });
    });
});
