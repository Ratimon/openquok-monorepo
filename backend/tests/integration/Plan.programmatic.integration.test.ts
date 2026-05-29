import supertest from "supertest";
import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { subscriptionGuard } from "../../services/index";
import { UserTestHelper } from "../helpers/userTestHelper";
import {
    cleanupIntegrationTestUsers,
    signupVerifyAndSignIn as sharedSignupVerifyAndSignIn,
} from "../helpers/integrationAuthTestHelper";
import {
    exchangeOAuthProgrammaticToken,
    programmaticBearerAuth,
} from "../helpers/programmaticAuthTestHelper";
import {
    prepareSoloWorkspace,
    restoreSoloWorkspaceSpies,
    type SoloWorkspaceSpies,
} from "../helpers/workspaceTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";
import { planLimitsForTier } from "openquok-common";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;
const publicPostsPath = `${apiPrefix}/public/posts`;

const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
const supabaseSecretKey = (config.supabase as { supabaseSecretKey?: string }).supabaseSecretKey;
const describeIfSupabase =
    supabaseUrl && supabaseSecretKey ? describe : describe.skip;

/**
 * Programmatic `/public/*` auth: OAuth tokens (`opo_…`) only, with `public_api` enforced
 * at request time (including downgrade / over-cap workspaces resolving to FREE).
 */
describeIfSupabase("Programmatic API plan enforcement (integration)", () => {
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

    async function signupVerifyAndSignIn(payload: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<{ accessToken: string; orgId: string }> {
        const { accessToken } = await sharedSignupVerifyAndSignIn(
            app,
            userHelper,
            authPath,
            verificationToken,
            payload
        );

        const meRes = await supertest(app)
            .get(`${usersPath}/me`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(meRes.status).toBe(200);

        const listRes = await supertest(app)
            .get(settingsPath)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(listRes.status).toBe(200);
        const orgId = listRes.body?.data?.[0]?.id as string;
        expect(orgId).toBeDefined();

        return { accessToken, orgId };
    }

    it("allows SOLO workspace OAuth token on programmatic post routes", async () => {
        const payload = userHelper.setupTestUser1();
        const { accessToken, orgId } = await signupVerifyAndSignIn(payload);
        const bearerToken = await exchangeOAuthProgrammaticToken(accessToken, orgId);

        const res = await supertest(app)
            .get(`${publicPostsPath}/list`)
            .query({
                start: new Date(Date.now() - 60_000).toISOString(),
                end: new Date(Date.now() + 60_000).toISOString(),
            })
            .set(programmaticBearerAuth(bearerToken));

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body?.data?.posts)).toBe(true);
    });

    it("returns 402 PUBLIC_API when workspace tier resolves to FREE", async () => {
        const payload = userHelper.setupTestUser1();
        const { accessToken, orgId } = await signupVerifyAndSignIn(payload);
        const bearerToken = await exchangeOAuthProgrammaticToken(accessToken, orgId);

        const freeLimits = planLimitsForTier("FREE");
        const tierSpy = jest.spyOn(subscriptionGuard, "getTierAndLimits").mockResolvedValue({
            tier: "FREE",
            limits: freeLimits,
            subscription: null,
        });

        try {
            const res = await supertest(app)
                .get(`${publicPostsPath}/list`)
                .query({
                    start: new Date(Date.now() - 60_000).toISOString(),
                    end: new Date(Date.now() + 60_000).toISOString(),
                })
                .set(programmaticBearerAuth(bearerToken));

            expect(res.status).toBe(402);
            expect(res.body?.success).toBe(false);
            expect(res.body?.error?.section).toBe("public_api");
        } finally {
            tierSpy.mockRestore();
        }
    });

    it("rejects unknown bearer tokens with 401", async () => {
        const res = await supertest(app)
            .get(`${publicPostsPath}/list`)
            .query({
                start: new Date(Date.now() - 60_000).toISOString(),
                end: new Date(Date.now() + 60_000).toISOString(),
            })
            .set(programmaticBearerAuth("not_a_valid_programmatic_token_000000000000"));

        expect(res.status).toBe(401);
        expect(res.body?.msg).toBe("Invalid API key");
    });
});
