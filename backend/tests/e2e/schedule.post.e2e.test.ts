import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import {
    createPublishScheduledGroupHandler,
    type ScheduledPostsRepository,
} from "openquok-orchestrator/activities/scheduledSocialPostExecution.js";
import { IntegrationManager } from "../../integrations/integrationManager.js";
import { integrationRepository, postsRepository } from "../../repositories/index.js";
import type { RefreshIntegrationService } from "../../services/RefreshIntegrationService.js";

jest.mock("openquok-orchestrator", () => ({
    __esModule: true,
    runScheduledSocialPostOrchestration: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

const {
    runScheduledSocialPostOrchestration: mockRunScheduledSocialPost,
} = jest.requireMock<{
    runScheduledSocialPostOrchestration: jest.MockedFunction<
        (args: { organizationId: string; postGroup: string; delayMs: number }) => Promise<boolean>
    >;
}>("openquok-orchestrator");

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const postsPath = `${apiPrefix}/posts`;

const supabaseConfig = config.supabase as { supabaseUrl?: string; supabaseServiceRoleKey?: string };
const hasSupabaseE2E = Boolean(supabaseConfig.supabaseUrl?.trim() && supabaseConfig.supabaseServiceRoleKey?.trim());

describe("Scheduling a post for social channels", () => {
    let adminSupabase: SupabaseClient;
    let userHelper: UserTestHelper;

    let getVerificationTokenSpy: jest.SpyInstance;
    let verificationToken: string;
    let emailSendSpy: jest.SpyInstance;

    let prevScheduledEnabled: boolean;
    let prevScheduledTransport: string;

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
        const bull = config as {
            bullmq: { scheduledSocialPost: { enabled: boolean; transport: string } };
        };
        bull.bullmq.scheduledSocialPost.enabled = prevScheduledEnabled;
        bull.bullmq.scheduledSocialPost.transport = prevScheduledTransport;
        if (userHelper) {
            await userHelper.cleanAllStoredUsers();
        }
        mockRunScheduledSocialPost.mockClear();
    });

    beforeEach(() => {
        const bull = config as {
            bullmq: { scheduledSocialPost: { enabled: boolean; transport: string } };
        };
        prevScheduledEnabled = bull.bullmq.scheduledSocialPost.enabled;
        prevScheduledTransport = bull.bullmq.scheduledSocialPost.transport;
        bull.bullmq.scheduledSocialPost.enabled = true;
        bull.bullmq.scheduledSocialPost.transport = "bullmq";
    });

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string; orgId: string }> {
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

        return { accessToken: accessToken as string, orgId };
    }

    (hasSupabaseE2E ? it : it.skip)(
        "member with a connected channel can schedule a main post plus threaded follow-ups and a weekly repeat cadence; queue rows, interval, and reply rows persist and the delayed publish workflow is enqueued (BullMQ path)",
        async () => {
        const payload = userHelper.setupTestUser1();
        const { accessToken, orgId } = await signupVerifyAndSignIn(payload);

        const integrationId = faker.string.uuid();
        const { error: intErr } = await adminSupabase.from("integrations").insert({
            id: integrationId,
            organization_id: orgId,
            internal_id: `e2e-${faker.string.alphanumeric(12)}`,
            name: faker.company.name(),
            picture: null,
            provider_identifier: "threads",
            type: "social",
            token: "e2e-test-token",
        });
        expect(intErr).toBeNull();

        const findSlot = await supertest(app)
            .get(`${postsPath}/find-slot`)
            .query({ organizationId: orgId })
            .set("Authorization", `Bearer ${accessToken}`);
        expect(findSlot.status).toBe(200);
        const scheduledAt = findSlot.body?.data?.date as string;
        expect(typeof scheduledAt).toBe("string");
        expect(Number.isNaN(new Date(scheduledAt).getTime())).toBe(false);

        const bodyText = faker.lorem.paragraph();
        const threadReplyFirst = `e2e-reply-a-${faker.string.alphanumeric(8)}`;
        const threadReplySecond = `e2e-reply-b-${faker.string.alphanumeric(8)}`;
        const delayFirstSeconds = 5;
        const delaySecondSeconds = 10;
        /** Auto-repeat cadence: `week` → 7 days in `posts.interval_in_days` (see repeatIntervalToDays). */
        const repeatInterval = "week" as const;
        const expectedIntervalInDays = 7;

        const createRes = await supertest(app)
            .post(postsPath)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                organizationId: orgId,
                body: bodyText,
                integrationIds: [integrationId],
                isGlobal: true,
                scheduledAt,
                repeatInterval,
                tagNames: [],
                status: "scheduled",
                providerSettingsByIntegrationId: {
                    [integrationId]: {
                        threads: {
                            replies: [
                                { id: faker.string.uuid(), message: threadReplyFirst, delaySeconds: delayFirstSeconds },
                                {
                                    id: faker.string.uuid(),
                                    message: threadReplySecond,
                                    delaySeconds: delaySecondSeconds,
                                },
                            ],
                        },
                    },
                },
            });

        expect(createRes.status).toBe(200);
        expect(createRes.body?.success).toBe(true);
        const postGroup = createRes.body?.data?.postGroup as string;
        const posts = createRes.body?.data?.posts as Array<{
            id: string;
            state: string;
            postGroup: string;
            integrationId: string | null;
            intervalInDays: number | null;
            settings: string | null;
        }>;
        expect(postGroup).toBeDefined();
        expect(Array.isArray(posts)).toBe(true);
        expect(posts.some((p) => p.state === "QUEUE" && p.postGroup === postGroup)).toBe(true);
        expect(posts.every((p) => p.intervalInDays === expectedIntervalInDays)).toBe(true);

        const mainPost = posts.find((p) => p.integrationId === integrationId);
        expect(mainPost?.id).toBeDefined();
        const mainPostId = mainPost!.id;

        const parsedSettings = JSON.parse(mainPost!.settings ?? "{}") as {
            isGlobal?: boolean;
            repeatInterval?: string | null;
            providerSettings?: unknown;
        };
        expect(parsedSettings.isGlobal).toBe(true);
        expect(parsedSettings.repeatInterval).toBe(repeatInterval);
        expect(parsedSettings.providerSettings).toEqual(
            expect.objectContaining({
                threads: expect.objectContaining({
                    replies: expect.arrayContaining([
                        expect.objectContaining({ message: threadReplyFirst, delaySeconds: delayFirstSeconds }),
                        expect.objectContaining({ message: threadReplySecond, delaySeconds: delaySecondSeconds }),
                    ]),
                }),
            })
        );

        const { data: postRow, error: postRowErr } = await adminSupabase
            .from("posts")
            .select("interval_in_days, settings")
            .eq("id", mainPostId)
            .maybeSingle();
        expect(postRowErr).toBeNull();
        expect(postRow).toMatchObject({
            interval_in_days: expectedIntervalInDays,
        });
        const dbSettings = JSON.parse((postRow?.settings as string) ?? "{}") as { repeatInterval?: string };
        expect(dbSettings.repeatInterval).toBe(repeatInterval);

        const { data: replyRows, error: repliesErr } = await adminSupabase
            .from("post_thread_replies")
            .select("post_id, organization_id, integration_id, content, delay_seconds, state, deleted_at")
            .eq("post_id", mainPostId)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        expect(repliesErr).toBeNull();
        expect(replyRows).toHaveLength(2);
        expect(replyRows![0]).toMatchObject({
            post_id: mainPostId,
            organization_id: orgId,
            integration_id: integrationId,
            content: threadReplyFirst,
            delay_seconds: delayFirstSeconds,
            state: "QUEUE",
        });
        expect(replyRows![1]).toMatchObject({
            post_id: mainPostId,
            organization_id: orgId,
            integration_id: integrationId,
            content: threadReplySecond,
            delay_seconds: delaySecondSeconds,
            state: "QUEUE",
        });

        for (let i = 0; i < 30 && mockRunScheduledSocialPost.mock.calls.length === 0; i++) {
            // `PostsService` enqueues in a non-awaited async continuation after the handler returns
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setImmediate(r));
        }
        expect(mockRunScheduledSocialPost).toHaveBeenCalledTimes(1);
        expect(mockRunScheduledSocialPost).toHaveBeenCalledWith(
            expect.objectContaining({
                organizationId: orgId,
                postGroup,
                delayMs: expect.any(Number),
            })
        );
        const delayMs = mockRunScheduledSocialPost.mock.calls[0]![0]!.delayMs;
        expect(delayMs).toBeGreaterThanOrEqual(0);

        const getGroup = await supertest(app)
            .get(`${postsPath}/group/${encodeURIComponent(postGroup)}`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(getGroup.status).toBe(200);
        expect(getGroup.body?.data?.status).toBe("scheduled");
        expect(getGroup.body?.data?.integrationIds).toContain(integrationId);
        expect(getGroup.body?.data?.repeatInterval).toBe(repeatInterval);
        },
        25_000
    );

    (hasSupabaseE2E ? it : it.skip)(
        "when the scheduled-social publish activity runs, stubbed provider calls mark the main post and each thread reply as PUBLISHED in the database",
        async () => {
            const payload = userHelper.setupTestUser1();
            const { accessToken, orgId } = await signupVerifyAndSignIn(payload);

            const integrationId = faker.string.uuid();
            const { error: intErr } = await adminSupabase.from("integrations").insert({
                id: integrationId,
                organization_id: orgId,
                internal_id: `e2e-${faker.string.alphanumeric(12)}`,
                name: faker.company.name(),
                picture: null,
                provider_identifier: "threads",
                type: "social",
                token: "e2e-test-token",
            });
            expect(intErr).toBeNull();

            const findSlot = await supertest(app)
                .get(`${postsPath}/find-slot`)
                .query({ organizationId: orgId })
                .set("Authorization", `Bearer ${accessToken}`);
            expect(findSlot.status).toBe(200);
            const scheduledAt = findSlot.body?.data?.date as string;

            const bodyText = faker.lorem.sentence();
            const threadReplyFirst = `e2e-pub-a-${faker.string.alphanumeric(8)}`;
            const threadReplySecond = `e2e-pub-b-${faker.string.alphanumeric(8)}`;
            /** Different delays (0s and 1s) exercise chained orchestration waits without a long suite runtime. */
            const delayFirstSeconds = 0;
            const delaySecondSeconds = 1;

            const createRes = await supertest(app)
                .post(postsPath)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    organizationId: orgId,
                    body: bodyText,
                    integrationIds: [integrationId],
                    isGlobal: true,
                    scheduledAt,
                    repeatInterval: null,
                    tagNames: [],
                    status: "scheduled",
                    providerSettingsByIntegrationId: {
                        [integrationId]: {
                            threads: {
                                replies: [
                                    { id: faker.string.uuid(), message: threadReplyFirst, delaySeconds: delayFirstSeconds },
                                    {
                                        id: faker.string.uuid(),
                                        message: threadReplySecond,
                                        delaySeconds: delaySecondSeconds,
                                    },
                                ],
                            },
                        },
                    },
                });
            expect(createRes.status).toBe(200);
            const postGroup = createRes.body?.data?.postGroup as string;
            const createdPosts = createRes.body?.data?.posts as Array<{ id: string; integrationId: string | null }>;
            const mainPostId = createdPosts.find((p) => p.integrationId === integrationId)?.id;
            expect(mainPostId).toBeDefined();

            for (let i = 0; i < 30 && mockRunScheduledSocialPost.mock.calls.length === 0; i++) {
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setImmediate(r));
            }

            const postMock = jest.fn().mockResolvedValue([
                {
                    id: "e2e-main",
                    postId: "e2e-main-release-id",
                    releaseURL: "https://e2e.example/thread/main",
                    status: "published",
                },
            ]);
            let replySeq = 0;
            const commentMock = jest.fn().mockImplementation(async () => {
                replySeq += 1;
                return [
                    {
                        id: `e2e-reply-${replySeq}`,
                        postId: `e2e-reply-release-${replySeq}`,
                        releaseURL: "",
                        status: "published",
                    },
                ];
            });
            const integrationManagerStub = {
                getSocialIntegration: jest.fn(() => ({
                    post: postMock,
                    comment: commentMock,
                })),
            } as unknown as IntegrationManager;

            const refreshService: Pick<RefreshIntegrationService, "refresh"> = {
                refresh: jest.fn().mockResolvedValue(false),
            };

            const publishScheduledGroup = createPublishScheduledGroupHandler({
                postsRepository: postsRepository as unknown as ScheduledPostsRepository,
                integrationRepository,
                integrationManager: integrationManagerStub,
                refreshService,
                notificationService: undefined,
            });

            await publishScheduledGroup({ organizationId: orgId, postGroup });

            const { data: publishedRow, error: pubErr } = await adminSupabase
                .from("posts")
                .select("state, release_id")
                .eq("id", mainPostId!)
                .maybeSingle();
            expect(pubErr).toBeNull();
            expect(publishedRow).toMatchObject({ state: "PUBLISHED", release_id: "e2e-main-release-id" });

            const { data: repliesAfter, error: repliesAfterErr } = await adminSupabase
                .from("post_thread_replies")
                .select("content, delay_seconds, state, release_id")
                .eq("post_id", mainPostId!)
                .is("deleted_at", null)
                .order("created_at", { ascending: true });
            expect(repliesAfterErr).toBeNull();
            expect(repliesAfter).toHaveLength(2);
            expect(repliesAfter![0]).toMatchObject({
                content: threadReplyFirst,
                delay_seconds: delayFirstSeconds,
                state: "PUBLISHED",
                release_id: "e2e-reply-release-1",
            });
            expect(repliesAfter![1]).toMatchObject({
                content: threadReplySecond,
                delay_seconds: delaySecondSeconds,
                state: "PUBLISHED",
                release_id: "e2e-reply-release-2",
            });

            expect(postMock).toHaveBeenCalledTimes(1);
            expect(commentMock).toHaveBeenCalledTimes(2);
        },
        35_000
    );
});
