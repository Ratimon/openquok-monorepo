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
const publicPath = `${apiPrefix}/public`;
const publicPostsPath = `${publicPath}/posts`;
const publicAnalyticsPath = `${publicPath}/analytics`;
const publicNotificationsPath = `${publicPath}/notifications`;
const publicUploadFromUrlPath = `${publicPath}/upload-from-url`;

const supabaseConfig = config.supabase as { supabaseUrl?: string; supabaseSecretKey?: string };
const hasSupabaseE2E = Boolean(supabaseConfig.supabaseUrl?.trim() && supabaseConfig.supabaseSecretKey?.trim());

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
                supabaseConfig.supabaseSecretKey!
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
        expect(apiKey).toMatch(/^opk_/);

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

    (hasSupabaseE2E ? it : it.skip)(
        "API key holder can find a free posting slot for their workspace and for a single channel",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey, orgId } = await signupVerifyAndSignIn(payload);
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

            const orgWide = await supertest(app)
                .get(`${publicPostsPath}/find-slot`)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(orgWide.status).toBe(200);
            expect(orgWide.body?.success).toBe(true);
            expect(typeof orgWide.body?.data?.date).toBe("string");
            expect(Number.isNaN(new Date(orgWide.body.data.date).getTime())).toBe(false);

            const perChannel = await supertest(app)
                .get(`${publicPostsPath}/find-slot/${integrationId}`)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(perChannel.status).toBe(200);
            expect(typeof perChannel.body?.data?.date).toBe("string");
        }
    );

    (hasSupabaseE2E ? it : it.skip)(
        "API key holder can delete a post by id and the group disappears from list",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey, orgId } = await signupVerifyAndSignIn(payload);
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

            const createRes = await supertest(app)
                .post(publicPostsPath)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({
                    body: faker.lorem.paragraph(),
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                });
            expect(createRes.status).toBe(200);
            const postGroup = createRes.body?.data?.postGroup as string;
            const postId = createRes.body?.data?.posts?.[0]?.id as string;
            expect(postId).toBeDefined();

            const deleteRes = await supertest(app)
                .delete(`${publicPostsPath}/${postId}`)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(deleteRes.status).toBe(200);
            expect(deleteRes.body?.success).toBe(true);
            expect(deleteRes.body?.data?.postGroup).toBe(postGroup);

            const groupAfter = await supertest(app)
                .get(`${publicPostsPath}/group/${postGroup}`)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(groupAfter.status).toBe(404);
        }
    );

    (hasSupabaseE2E ? it : it.skip)(
        "API key holder gets an empty missing-candidates list for a freshly scheduled post",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey, orgId } = await signupVerifyAndSignIn(payload);
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

            const createRes = await supertest(app)
                .post(publicPostsPath)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({
                    body: faker.lorem.paragraph(),
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                });
            expect(createRes.status).toBe(200);
            const postId = createRes.body?.data?.posts?.[0]?.id as string;

            const missingRes = await supertest(app)
                .get(`${publicPostsPath}/${postId}/missing`)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(missingRes.status).toBe(200);
            expect(missingRes.body?.success).toBe(true);
            expect(missingRes.body?.data?.items).toEqual([]);
        }
    );

    (hasSupabaseE2E ? it : it.skip)(
        "API key holder cannot link a release id on a post that is not in `missing` state",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey, orgId } = await signupVerifyAndSignIn(payload);
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

            const createRes = await supertest(app)
                .post(publicPostsPath)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({
                    body: faker.lorem.paragraph(),
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                });
            expect(createRes.status).toBe(200);
            const postId = createRes.body?.data?.posts?.[0]?.id as string;

            const releaseRes = await supertest(app)
                .put(`${publicPostsPath}/${postId}/release-id`)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({ releaseId: faker.string.numeric(18) });
            expect(releaseRes.status).toBe(400);
            expect(releaseRes.body?.success).toBe(false);
        }
    );

    (hasSupabaseE2E ? it : it.skip)(
        "API key holder gets an empty post-analytics payload for an unpublished post",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey, orgId } = await signupVerifyAndSignIn(payload);
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

            const createRes = await supertest(app)
                .post(publicPostsPath)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({
                    body: faker.lorem.paragraph(),
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                });
            expect(createRes.status).toBe(200);
            const postId = createRes.body?.data?.posts?.[0]?.id as string;

            const analyticsRes = await supertest(app)
                .get(`${publicAnalyticsPath}/post/${postId}`)
                .query({ date: "7" })
                .set("Authorization", `Bearer ${apiKey}`);
            expect(analyticsRes.status).toBe(200);
            expect(analyticsRes.body?.success).toBe(true);
            // Unpublished rows (no `release_id`) short-circuit to an empty series before any provider call.
            expect(analyticsRes.body?.data).toEqual([]);
        }
    );

    (hasSupabaseE2E ? it : it.skip)(
        "API key holder rejects post-analytics requests with an invalid date window",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey } = await signupVerifyAndSignIn(payload);

            const res = await supertest(app)
                .get(`${publicAnalyticsPath}/post/${faker.string.uuid()}`)
                .query({ date: "5" })
                .set("Authorization", `Bearer ${apiKey}`);
            expect(res.status).toBe(400);
            expect(res.body?.success).toBe(false);
        }
    );

    (hasSupabaseE2E ? it : it.skip)(
        "API key holder receives an empty paginated batch when there are no notifications",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey } = await signupVerifyAndSignIn(payload);

            const res = await supertest(app)
                .get(publicNotificationsPath)
                .set("Authorization", `Bearer ${apiKey}`);
            expect(res.status).toBe(200);
            expect(res.body?.success).toBe(true);
            expect(Array.isArray(res.body?.data?.notifications)).toBe(true);
            expect(res.body.data.notifications).toEqual([]);
            expect(res.body.data.page).toBe(0);
            expect(res.body.data.limit).toBe(100);
        }
    );

    (hasSupabaseE2E ? it : it.skip)(
        "Upload-from-url is rejected when the body is missing the url field",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { apiKey } = await signupVerifyAndSignIn(payload);

            const missing = await supertest(app)
                .post(publicUploadFromUrlPath)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({});
            expect(missing.status).toBe(400);
            expect(missing.body?.success).toBe(false);

            const invalid = await supertest(app)
                .post(publicUploadFromUrlPath)
                .set("Authorization", `Bearer ${apiKey}`)
                .send({ url: "not-a-url" });
            expect(invalid.status).toBe(400);
            expect(invalid.body?.success).toBe(false);
        }
    );
});

