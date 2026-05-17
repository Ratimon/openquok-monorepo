import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { insertTestSocialIntegration } from "../helpers/integrationTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { startE2eHttpServer } from "./helpers/e2e-http-server";
import { runOpenquokCli } from "./helpers/run-openquok-cli";

jest.mock("openquok-orchestrator", () => ({
    __esModule: true,
    runScheduledSocialPostOrchestration: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const postsPath = `${apiPrefix}/posts`;
const publicPostsPath = `${apiPrefix}/public/posts`;

const supabaseConfig = config.supabase as { supabaseUrl?: string; supabaseSecretKey?: string };
const hasSupabaseE2E = Boolean(supabaseConfig.supabaseUrl?.trim() && supabaseConfig.supabaseSecretKey?.trim());

type PostRowDto = {
    id: string;
    state: string;
    postGroup: string;
    integrationId?: string | null;
    isAgentEdited?: boolean;
    isReviewed?: boolean;
    note?: string | null;
};

describe("Post kanban review (agent and human)", () => {
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
        const bull = config as {
            bullmq: { scheduledSocialPost: { enabled: boolean; transport: string } };
        };
        bull.bullmq.scheduledSocialPost.enabled = prevScheduledEnabled;
        bull.bullmq.scheduledSocialPost.transport = prevScheduledTransport;
        if (userHelper) {
            await userHelper.cleanAllStoredUsers();
        }
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

        return { accessToken: accessToken as string, orgId, apiKey: apiKey as string };
    }

    async function readPostReviewColumns(postId: string): Promise<{
        note: string | null;
        is_agent_edited: boolean;
        is_reviewed: boolean;
        state: string;
    }> {
        const { data, error } = await adminSupabase
            .from("posts")
            .select("note, is_agent_edited, is_reviewed, state")
            .eq("id", postId)
            .maybeSingle();
        expect(error).toBeNull();
        expect(data).toBeTruthy();
        return data as {
            note: string | null;
            is_agent_edited: boolean;
            is_reviewed: boolean;
            state: string;
        };
    }

    describe("Agent drafts a post and a human reviews and schedules it", () => {
        let e2eServer: Awaited<ReturnType<typeof startE2eHttpServer>>;
        let isolatedHome: string;

        beforeAll(async () => {
            if (!hasSupabaseE2E) return;
            isolatedHome = fs.mkdtempSync(path.join(os.tmpdir(), "openquok-backend-e2e-"));
            e2eServer = await startE2eHttpServer();
        });

        afterAll(async () => {
            if (!hasSupabaseE2E) return;
            await e2eServer?.close();
            if (isolatedHome) {
                fs.rmSync(isolatedHome, { recursive: true, force: true });
            }
        });

        (hasSupabaseE2E ? it : it.skip)(
            "agent-created draft stays flagged until the human marks review complete and schedules from the dashboard",
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

                const bodyText = faker.lorem.paragraph();
                const reviewNote = `e2e-review-${faker.string.alphanumeric(8)}`;

                const cliArgv = [
                    "posts:create",
                    "-c",
                    bodyText,
                    "-s",
                    scheduledAt,
                    "-i",
                    integrationId,
                    "-t",
                    "draft",
                ];
                const { status: cliStatus, stdout, stderr } = await runOpenquokCli(cliArgv, {
                    HOME: isolatedHome,
                    OPENQUOK_API_URL: e2eServer.baseUrl,
                    OPENQUOK_API_KEY: apiKey,
                });
                if (cliStatus !== 0) {
                    throw new Error(`openquok posts:create failed (${cliStatus}): ${stderr || stdout}`);
                }
                expect(cliStatus).toBe(0);
                if (stderr.trim()) {
                    expect(stderr).not.toMatch(/ERR_|Error:|Cannot find module/i);
                }

                const agentCreate = JSON.parse(stdout) as {
                    success?: boolean;
                    data?: { postGroup?: string; posts?: PostRowDto[] };
                };
                expect(agentCreate.success).toBe(true);

                const postGroup = agentCreate.data?.postGroup as string;
                const createdPosts = agentCreate.data?.posts as PostRowDto[];
                expect(postGroup).toBeDefined();
                expect(createdPosts.length).toBeGreaterThan(0);

                const postId = createdPosts[0]!.id;
                expect(createdPosts[0]!.state).toBe("DRAFT");
                expect(createdPosts[0]!.isAgentEdited).toBe(true);
                expect(createdPosts[0]!.isReviewed).toBe(false);

                const dbAfterAgent = await readPostReviewColumns(postId);
                expect(dbAfterAgent.state).toBe("DRAFT");
                expect(dbAfterAgent.is_agent_edited).toBe(true);
                expect(dbAfterAgent.is_reviewed).toBe(false);

                const listStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                const listEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                const humanList = await supertest(app)
                    .get(`${postsPath}/list`)
                    .query({ organizationId: orgId, start: listStart, end: listEnd })
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(humanList.status).toBe(200);
                const listed = (humanList.body?.data?.posts as PostRowDto[]).find((p) => p.id === postId);
                expect(listed).toBeDefined();
                expect(listed!.isAgentEdited).toBe(true);

                const humanReview = await supertest(app)
                    .put(`${postsPath}/${postId}/review-todo`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        organizationId: orgId,
                        note: reviewNote,
                        isReviewed: true,
                    });
                expect(humanReview.status).toBe(200);
                expect(humanReview.body?.success).toBe(true);
                const reviewedPosts = humanReview.body?.data?.posts as PostRowDto[];
                expect(reviewedPosts.some((p) => p.id === postId)).toBe(true);
                expect(reviewedPosts.every((p) => p.isAgentEdited === false)).toBe(true);
                expect(reviewedPosts.every((p) => p.isReviewed === true)).toBe(true);
                expect(reviewedPosts.every((p) => p.note === reviewNote)).toBe(true);

                const dbAfterReview = await readPostReviewColumns(postId);
                expect(dbAfterReview.is_agent_edited).toBe(false);
                expect(dbAfterReview.is_reviewed).toBe(true);
                expect(dbAfterReview.note).toBe(reviewNote);

                const getGroup = await supertest(app)
                    .get(`${postsPath}/group/${encodeURIComponent(postGroup)}`)
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(getGroup.status).toBe(200);
                expect(getGroup.body?.data?.status).toBe("draft");

                const humanSchedule = await supertest(app)
                    .put(`${postsPath}/group/${encodeURIComponent(postGroup)}`)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        organizationId: orgId,
                        body: bodyText,
                        integrationIds: [integrationId],
                        isGlobal: true,
                        scheduledAt: getGroup.body?.data?.publishDateIso ?? scheduledAt,
                        repeatInterval: null,
                        tagNames: [],
                        status: "scheduled",
                    });
                expect(humanSchedule.status).toBe(200);
                expect(humanSchedule.body?.success).toBe(true);
                const scheduledPosts = humanSchedule.body?.data?.posts as PostRowDto[];
                expect(scheduledPosts.some((p) => p.state === "QUEUE")).toBe(true);
                expect(scheduledPosts.every((p) => p.isAgentEdited === false)).toBe(true);
                expect(scheduledPosts.every((p) => p.isReviewed === true)).toBe(true);
                expect(scheduledPosts.every((p) => p.note === reviewNote)).toBe(true);

                const scheduledPostId = scheduledPosts.find((p) => p.integrationId === integrationId)?.id;
                expect(scheduledPostId).toBeDefined();
                const dbAfterSchedule = await readPostReviewColumns(scheduledPostId!);
                expect(dbAfterSchedule.state).toBe("QUEUE");
                expect(dbAfterSchedule.is_agent_edited).toBe(false);
                expect(dbAfterSchedule.is_reviewed).toBe(true);
                expect(dbAfterSchedule.note).toBe(reviewNote);
            },
            60_000
        );
    });

    describe("Human creates a post from the dashboard", () => {
        (hasSupabaseE2E ? it : it.skip)(
            "session create does not flag the post as agent-edited",
            async () => {
                const payload = userHelper.setupTestUser1();
                const { accessToken, orgId } = await signupVerifyAndSignIn(payload);
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

                const findSlot = await supertest(app)
                    .get(`${postsPath}/find-slot`)
                    .query({ organizationId: orgId })
                    .set("Authorization", `Bearer ${accessToken}`);
                expect(findSlot.status).toBe(200);
                const scheduledAt = findSlot.body?.data?.date as string;

                const humanCreate = await supertest(app)
                    .post(postsPath)
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        organizationId: orgId,
                        body: faker.lorem.paragraph(),
                        integrationIds: [integrationId],
                        isGlobal: true,
                        scheduledAt,
                        repeatInterval: null,
                        tagNames: [],
                        status: "draft",
                    });
                expect(humanCreate.status).toBe(200);
                const posts = humanCreate.body?.data?.posts as PostRowDto[];
                expect(posts[0]!.isAgentEdited).toBe(false);
                expect(posts[0]!.isReviewed).toBe(false);

                const dbRow = await readPostReviewColumns(posts[0]!.id);
                expect(dbRow.is_agent_edited).toBe(false);
                expect(dbRow.is_reviewed).toBe(false);
            }
        );
    });

    describe("Review todo access control", () => {
        (hasSupabaseE2E ? it : it.skip)("unauthenticated user cannot update a post review todo", async () => {
            const res = await supertest(app)
                .put(`${postsPath}/${faker.string.uuid()}/review-todo`)
                .send({ organizationId: faker.string.uuid(), isReviewed: true });
            expect(res.status).toBe(401);
        });
    });

    describe("Agent updates review fields via the programmatic API", () => {
        (hasSupabaseE2E ? it : it.skip)(
            "API key holder can set a review note and keep isAgentEdited true",
            async () => {
                const payload = userHelper.setupTestUser1();
                const { apiKey, orgId } = await signupVerifyAndSignIn(payload);
                const { integrationId } = await insertTestSocialIntegration(adminSupabase, orgId);

                const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                const agentNote = `agent-todo-${faker.string.alphanumeric(6)}`;

                const createRes = await supertest(app)
                    .post(publicPostsPath)
                    .set("Authorization", `Bearer ${apiKey}`)
                    .send({
                        isAgent: true,
                        body: faker.lorem.paragraph(),
                        integrationIds: [integrationId],
                        isGlobal: true,
                        scheduledAt,
                        repeatInterval: null,
                        tagNames: [],
                        status: "draft",
                    });
                expect(createRes.status).toBe(200);
                const postId = createRes.body?.data?.posts?.[0]?.id as string;

                const agentReview = await supertest(app)
                    .put(`${publicPostsPath}/${postId}/review-todo`)
                    .set("Authorization", `Bearer ${apiKey}`)
                    .send({ note: agentNote, isAgent: true, isReviewed: false });
                expect(agentReview.status).toBe(200);
                const rows = agentReview.body?.data?.posts as PostRowDto[];
                expect(rows.every((p) => p.isAgentEdited === true)).toBe(true);
                expect(rows.every((p) => p.note === agentNote)).toBe(true);
                expect(rows.every((p) => p.isReviewed === false)).toBe(true);
            }
        );
    });
});
