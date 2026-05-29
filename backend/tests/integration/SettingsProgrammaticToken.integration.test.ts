import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import { programmaticBearerAuth } from "../helpers/programmaticAuthTestHelper";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    prepareSoloWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const oauthAppsPath = `${apiPrefix}/oauth-apps`;
const publicProgrammaticBase = `${apiPrefix}/public`;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const programmaticTokenSecret =
    (config.auth as { programmaticTokenSecret?: string }).programmaticTokenSecret?.trim() ?? "";

const describeIfSupabase =
    supabaseUrl && supabaseSecretKey && programmaticTokenSecret ? describe : describe.skip;

/**
 * Settings → Developers → Access: rotate workspace programmatic token (`opo_…`)
 * using the workspace OAuth app (Settings → Developers → Apps).
 */
describeIfSupabase("Settings programmatic access token (integration)", () => {
    const adminSupabase = createClient(supabaseUrl!, supabaseSecretKey!) as SupabaseClient;
    const userHelper = new UserTestHelper();

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
    });

    afterAll(async () => {
        await userHelper.cleanAll();
        getVerificationTokenSpy?.mockRestore();
        emailSendSpy?.mockRestore();
    });

    beforeEach(() => {
        soloWorkspaceSpies = prepareSoloWorkspace();
    });

    afterEach(async () => {
        restoreSoloWorkspaceSpies(soloWorkspaceSpies);
        soloWorkspaceSpies = undefined;
        await cleanupIntegrationTestUsers(userHelper);
    });

    async function signupVerifyAndGetWorkspace(): Promise<{ accessToken: string; orgId: string }> {
        const payload = userHelper.setupTestUser1();
        const { accessToken } = await sharedSignupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken,
            payload
        );

        const listRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();
        userHelper.trackOrganization(orgId);

        return { accessToken, orgId };
    }

    async function createWorkspaceOauthApp(accessToken: string, orgId: string): Promise<void> {
        const createRes = await supertest(app)
            .post(oauthAppsPath)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                organizationId: orgId,
                name: `Workspace access ${faker.string.alphanumeric(6)}`,
                description: "Programmatic token integration test",
                redirectUrl: "https://example.com/oauth/callback",
            });
        expect(createRes.status).toBe(201);
    }

    it("returns 400 on rotate when workspace has no OAuth app", async () => {
        const { accessToken, orgId } = await signupVerifyAndGetWorkspace();

        const rotateRes = await supertest(app)
            .post(`${settingsPath}/${orgId}/rotate-api-key`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(rotateRes.status).toBe(400);
        expect(rotateRes.body?.message).toMatch(/OAuth application/i);
    });

    it("GET programmatic-token is false before rotate, true after; rotate returns opo_ without updating organizations.api_key", async () => {
        const { accessToken, orgId } = await signupVerifyAndGetWorkspace();
        await createWorkspaceOauthApp(accessToken, orgId);

        const statusBefore = await supertest(app)
            .get(`${settingsPath}/${orgId}/programmatic-token`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(statusBefore.status).toBe(200);
        expect(statusBefore.body?.data).toEqual({ configured: false });

        const { data: orgBeforeRotate, error: orgBeforeError } = await adminSupabase
            .from("organizations")
            .select("api_key")
            .eq("id", orgId)
            .single();
        expect(orgBeforeError).toBeNull();

        const rotateRes = await supertest(app)
            .post(`${settingsPath}/${orgId}/rotate-api-key`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(rotateRes.status).toBe(200);
        const programmaticAccessToken = rotateRes.body?.data?.programmaticAccessToken as string;
        expect(programmaticAccessToken).toMatch(/^opo_/);
        expect(rotateRes.body?.data?.apiKey).toBeNull();

        const { data: orgAfterRotate, error: orgAfterError } = await adminSupabase
            .from("organizations")
            .select("api_key")
            .eq("id", orgId)
            .single();
        expect(orgAfterError).toBeNull();
        expect(orgAfterRotate?.api_key).toBe(orgBeforeRotate?.api_key ?? null);

        const statusAfter = await supertest(app)
            .get(`${settingsPath}/${orgId}/programmatic-token`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(statusAfter.status).toBe(200);
        expect(statusAfter.body?.data).toEqual({ configured: true });

        const connected = await supertest(app)
            .get(`${publicProgrammaticBase}/is-connected`)
            .set(programmaticBearerAuth(programmaticAccessToken));
        expect(connected.status).toBe(200);
        expect(connected.body).toEqual({ connected: true });

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .query({ organizationId: orgId })
            .set("Authorization", `Bearer ${accessToken}`);
        expect(meRes.status).toBe(200);
        expect(meRes.body?.data?.publicApi).toBe("");
    });
});
