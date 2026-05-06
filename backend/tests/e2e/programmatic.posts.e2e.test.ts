import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { insertTestSocialIntegration } from "../helpers/integrationTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const postsPath = `${apiPrefix}/posts`;
const publicPostsPath = `${apiPrefix}/public/posts`;

const supabaseConfig = config.supabase as { supabaseUrl?: string; supabaseServiceRoleKey?: string };
const hasSupabaseE2E = Boolean(supabaseConfig.supabaseUrl?.trim() && supabaseConfig.supabaseServiceRoleKey?.trim());

describe("Programmatic posts API", () => {
    let adminSupabase: SupabaseClient;
    let userHelper: UserTestHelper;

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;

    beforeAll(() => {
        verificationToken = generateRandomVerificationToken();
        getVerificationTokenSpy = jest
            .spyOn(EmailService.prototype, "generateVerificationToken")
            .mockImplementation(() => verificationToken);
        emailSendSpy = jest.spyOn(EmailService.prototype, "send").mockResolvedValue(undefined);

        if (hasSupabaseE2E) {
            adminSupabase = createClient(
                supabaseConfig.supabaseUrl!,
                supabaseConfig.supabaseServiceRoleKey!
            ) as SupabaseClient;
            userHelper = new UserTestHelper();
        }
    });

    afterAll(() => {
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    afterEach(async () => {
        if (userHelper) {
            await userHelper.cleanAllStoredUsers();
        }
    });

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string; orgId: string; apiKey: string }> {
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

        const listRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken as string}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();

        let apiKey = listRes.body?.data?.[0]?.apiKey as string | null;
        if (!apiKey) {
            const rotate = await supertest(app)
                .post(`${settingsPath}/${orgId}/rotate-api-key`)
                .set("Authorization", `Bearer ${accessToken as string}`);
            expect(rotate.status).toBe(200);
            apiKey = rotate.body?.data?.apiKey as string | null;
        }
        expect(typeof apiKey).toBe("string");
        expect(apiKey).toMatch(/^opo_/);

        return { accessToken: accessToken as string, orgId, apiKey: apiKey as string };
    }

    (hasSupabaseE2E ? it : it.skip)("requires API key for programmatic routes", async () => {
        const res = await supertest(app).get(`${publicPostsPath}/list`).query({
            start: new Date(Date.now() - 60_000).toISOString(),
            end: new Date(Date.now() + 60_000).toISOString(),
        });
        expect(res.status).toBe(401);
    });

    (hasSupabaseE2E ? it : it.skip)(
        "can create a scheduled post group and list it via programmatic API",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken, orgId, apiKey } = await signupVerifyAndSignIn(payload);

            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

            const findSlot = await supertest(app)
                .get(`${postsPath}/find-slot`)
                .query({ organizationId: orgId })
                .set("Authorization", `Bearer ${accessToken}`);
            expect(findSlot.status).toBe(200);
            const scheduledAt = findSlot.body?.data?.date as string;
            expect(typeof scheduledAt).toBe("string");

            const bodyText = faker.lorem.paragraph();

            const createRes = await supertest(app)
                .post(publicPostsPath)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({
                    body: bodyText,
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt,
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                });
            expect(createRes.status).toBe(200);
            expect(createRes.body?.success).toBe(true);
            const postGroup = createRes.body?.data?.postGroup as string;
            expect(postGroup).toBeDefined();

            const groupRes = await supertest(app)
                .get(`${publicPostsPath}/group/${postGroup}`)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(groupRes.status).toBe(200);
            expect(groupRes.body?.success).toBe(true);
            expect(groupRes.body?.data?.postGroup).toBe(postGroup);
            expect(groupRes.body?.data?.organizationId).toBe(orgId);

            const listRes = await supertest(app)
                .get(`${publicPostsPath}/list`)
                .query({
                    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                })
                .set("Authorization", `Bearer ${apiKey}`);
            expect(listRes.status).toBe(200);
            expect(listRes.body?.success).toBe(true);
            expect(Array.isArray(listRes.body?.data?.posts)).toBe(true);
        }
    );
});

