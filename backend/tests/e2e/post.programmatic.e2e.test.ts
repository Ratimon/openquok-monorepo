import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { insertTestSocialIntegration } from "../helpers/integrationTestHelper";
import {
    programmaticBearerAuth,
    provisionLegacyOrgApiKey,
    provisionOAuthAppAccessToken,
    type ProgrammaticAuthFixture,
    type SignupPayload,
} from "../helpers/programmaticAuthTestHelper";
import { prepareSoloWorkspace, restoreSoloWorkspaceSpies } from "../helpers/workspaceTestHelper";
import type { SoloWorkspaceSpies } from "../helpers/workspaceTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const publicPath = `${apiPrefix}/public`;
const publicPostsPath = `${publicPath}/posts`;
const publicAnalyticsPath = `${publicPath}/analytics`;
const publicNotificationsPath = `${publicPath}/notifications`;
const publicUploadFromUrlPath = `${publicPath}/upload-from-url`;

const supabaseConfig = config.supabase as { supabaseUrl?: string; supabaseSecretKey?: string };
const hasSupabaseE2E = Boolean(supabaseConfig.supabaseUrl?.trim() && supabaseConfig.supabaseSecretKey?.trim());

type ProvisionProgrammaticAuth = (
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper,
    payload: SignupPayload
) => Promise<ProgrammaticAuthFixture>;

const programmaticAuthCases: Array<{ name: string; provision: ProvisionProgrammaticAuth }> = [
    {
        name: "legacy org api_key (organizations.api_key)",
        provision: provisionLegacyOrgApiKey,
    },
    {
        name: "OAuth app access token (opo_, hashed authorization)",
        provision: provisionOAuthAppAccessToken,
    },
];

/**
 * E2E for programmatic posts (`routes/publicApi/PostRoutes.ts` → `{apiPrefix}/public/posts/*`).
 *
 * `requireProgrammaticAuth` ({@link middlewares/programmaticAuth.ts}) accepts either:
 * 1) OAuth app bearer (`opo_…`) — verified via `OauthAppService.verifyProgrammaticToken`
 * 2) Legacy workspace API key (`opk_…`) — `organizations.api_key`
 *
 * Session JWT / `showorg` cookie are not used on these routes. Each `describe` block below
 * runs the same post surface tests under one auth path.
 */
describe("Programmatic posts API (public /posts)", () => {
    let adminSupabase: SupabaseClient;
    let userHelper: UserTestHelper;

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;
    let soloWorkspaceSpies: SoloWorkspaceSpies | undefined;

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

    afterAll(async () => {
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
        if (userHelper) {
            await userHelper.cleanAll();
        }
    });

    beforeEach(() => {
        if (hasSupabaseE2E) {
            soloWorkspaceSpies = prepareSoloWorkspace();
        }
    });

    afterEach(async () => {
        restoreSoloWorkspaceSpies(soloWorkspaceSpies);
        soloWorkspaceSpies = undefined;
        if (userHelper) {
            await userHelper.cleanAll();
        }
    });

    (hasSupabaseE2E ? it : it.skip)("requires a programmatic bearer token", async () => {
        const res = await supertest(app).get(`${publicPostsPath}/list`).query({
            start: new Date(Date.now() - 60_000).toISOString(),
            end: new Date(Date.now() + 60_000).toISOString(),
        });
        expect(res.status).toBe(401);
    });

    describe.each(programmaticAuthCases)("auth: $name", ({ provision }) => {
        async function provisionAuth(): Promise<ProgrammaticAuthFixture> {
            const payload = userHelper.setupTestUser1();
            return provision(adminSupabase, userHelper, payload);
        }

        (hasSupabaseE2E ? it : it.skip)("rejects a session JWT on programmatic routes", async () => {
            const payload = userHelper.setupTestUser1();
            const signupRes = await supertest(app).post(`${authPath}/sign-up`).send(payload);
            expect(signupRes.status).toBe(201);
            await userHelper.trackUserAfterSignUp(signupRes, payload.email);
            const accessToken =
                signupRes.body.data?.accessToken ?? signupRes.body.data?.session?.accessToken;
            expect(accessToken).toBeDefined();

            const res = await supertest(app)
                .get(`${publicPostsPath}/list`)
                .query({
                    start: new Date(Date.now() - 60_000).toISOString(),
                    end: new Date(Date.now() + 60_000).toISOString(),
                })
                .set("Authorization", `Bearer ${accessToken as string}`);
            expect(res.status).toBe(401);
        });

        (hasSupabaseE2E ? it : it.skip)(
            "can create a scheduled post group and list it via programmatic API",
            async () => {
                const { orgId, bearerToken } = await provisionAuth();
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

                const findSlot = await supertest(app)
                    .get(`${publicPostsPath}/find-slot`)
                    .set(programmaticBearerAuth(bearerToken));
                expect(findSlot.status).toBe(200);
                const scheduledAt = findSlot.body?.data?.date as string;
                expect(typeof scheduledAt).toBe("string");

                const bodyText = faker.lorem.paragraph();

                const createRes = await supertest(app)
                    .post(publicPostsPath)
                    .set(programmaticBearerAuth(bearerToken))
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
                const postId = createRes.body?.data?.posts?.[0]?.id as string;
                expect(postGroup).toBeDefined();
                expect(postId).toBeDefined();

                const summaryRes = await supertest(app)
                    .get(`${publicPostsPath}/${postId}`)
                    .set(programmaticBearerAuth(bearerToken));
                expect(summaryRes.status).toBe(200);
                expect(summaryRes.body?.data?.postGroup).toBe(postGroup);

                const listRes = await supertest(app)
                    .get(`${publicPostsPath}/list`)
                    .query({
                        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    })
                    .set(programmaticBearerAuth(bearerToken));
                expect(listRes.status).toBe(200);
                expect(Array.isArray(listRes.body?.data?.posts)).toBe(true);
            }
        );

        (hasSupabaseE2E ? it : it.skip)(
            "can find a free posting slot for the workspace and for one channel",
            async () => {
                const { orgId, bearerToken } = await provisionAuth();
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

                const orgWide = await supertest(app)
                    .get(`${publicPostsPath}/find-slot`)
                    .set(programmaticBearerAuth(bearerToken));
                expect(orgWide.status).toBe(200);
                expect(typeof orgWide.body?.data?.date).toBe("string");

                const perChannel = await supertest(app)
                    .get(`${publicPostsPath}/find-slot/${integrationId}`)
                    .set(programmaticBearerAuth(bearerToken));
                expect(perChannel.status).toBe(200);
            }
        );

        (hasSupabaseE2E ? it : it.skip)("can delete a post by id", async () => {
            const { orgId, bearerToken } = await provisionAuth();
            const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

            const createRes = await supertest(app)
                .post(publicPostsPath)
                .set(programmaticBearerAuth(bearerToken))
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

            const deleteRes = await supertest(app)
                .delete(`${publicPostsPath}/${postId}`)
                .set(programmaticBearerAuth(bearerToken));
            expect(deleteRes.status).toBe(200);

            const summaryAfter = await supertest(app)
                .get(`${publicPostsPath}/${postId}`)
                .set(programmaticBearerAuth(bearerToken));
            expect(summaryAfter.status).toBe(404);
        });

        (hasSupabaseE2E ? it : it.skip)(
            "returns empty missing-candidates for a freshly scheduled post",
            async () => {
                const { orgId, bearerToken } = await provisionAuth();
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

                const createRes = await supertest(app)
                    .post(publicPostsPath)
                    .set(programmaticBearerAuth(bearerToken))
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
                    .set(programmaticBearerAuth(bearerToken));
                expect(missingRes.status).toBe(200);
                expect(missingRes.body?.data?.items).toEqual([]);
            }
        );

        (hasSupabaseE2E ? it : it.skip)(
            "rejects release-id update when post is not in missing state",
            async () => {
                const { orgId, bearerToken } = await provisionAuth();
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

                const createRes = await supertest(app)
                    .post(publicPostsPath)
                    .set(programmaticBearerAuth(bearerToken))
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
                    .set(programmaticBearerAuth(bearerToken))
                    .send({ releaseId: faker.string.numeric(18) });
                expect(releaseRes.status).toBe(400);
            }
        );

        (hasSupabaseE2E ? it : it.skip)(
            "returns empty post-analytics for an unpublished post",
            async () => {
                const { orgId, bearerToken } = await provisionAuth();
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

                const createRes = await supertest(app)
                    .post(publicPostsPath)
                    .set(programmaticBearerAuth(bearerToken))
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
                    .set(programmaticBearerAuth(bearerToken));
                expect(analyticsRes.status).toBe(200);
                expect(analyticsRes.body?.data).toEqual([]);
            }
        );

        (hasSupabaseE2E ? it : it.skip)("rejects invalid post-analytics date window", async () => {
            const { bearerToken } = await provisionAuth();
            const res = await supertest(app)
                .get(`${publicAnalyticsPath}/post/${faker.string.uuid()}`)
                .query({ date: "5" })
                .set(programmaticBearerAuth(bearerToken));
            expect(res.status).toBe(400);
        });

        (hasSupabaseE2E ? it : it.skip)("returns empty notifications list for a new workspace", async () => {
            const { bearerToken } = await provisionAuth();
            const res = await supertest(app)
                .get(publicNotificationsPath)
                .set(programmaticBearerAuth(bearerToken));
            expect(res.status).toBe(200);
            expect(res.body?.data?.notifications).toEqual([]);
        });

        (hasSupabaseE2E ? it : it.skip)("rejects upload-from-url without a valid url", async () => {
            const { bearerToken } = await provisionAuth();
            const missing = await supertest(app)
                .post(publicUploadFromUrlPath)
                .set(programmaticBearerAuth(bearerToken))
                .send({});
            expect(missing.status).toBe(400);

            const invalid = await supertest(app)
                .post(publicUploadFromUrlPath)
                .set(programmaticBearerAuth(bearerToken))
                .send({ url: "not-a-url" });
            expect(invalid.status).toBe(400);
        });
    });
});
