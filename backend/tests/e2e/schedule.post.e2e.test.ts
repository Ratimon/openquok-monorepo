import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { UserTestHelper } from "../helpers/userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

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

    (hasSupabaseE2E ? it : it.skip)("user with a connected channel can schedule a post, persist QUEUE state, and attempt to enqueue the delayed publish workflow (BullMQ path)", async () => {
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
            });

        expect(createRes.status).toBe(200);
        expect(createRes.body?.success).toBe(true);
        const postGroup = createRes.body?.data?.postGroup as string;
        const posts = createRes.body?.data?.posts as Array<{ state: string; postGroup: string }>;
        expect(postGroup).toBeDefined();
        expect(Array.isArray(posts)).toBe(true);
        expect(posts.some((p) => p.state === "QUEUE" && p.postGroup === postGroup)).toBe(true);

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
    });
});
