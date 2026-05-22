import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import type { UserTestHelper } from "./userTestHelper";
import { generateRandomVerificationToken } from "../utils/getVerificationTokenStub";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const authPath = `${apiPrefix}/auth`;
const settingsPath = `${apiPrefix}/settings`;
const oauthAppsPath = `${apiPrefix}/oauth-apps`;
const oauthAuthorizePath = `${apiPrefix}/oauth/authorize`;
const oauthTokenPath = `${apiPrefix}/oauth/token`;

export type ProgrammaticAuthFixture = {
    orgId: string;
    /** Bearer value for `Authorization` on `{apiPrefix}/public/*` routes. */
    bearerToken: string;
};

export type SignupPayload = {
    email: string;
    password: string;
    fullName: string;
};

/**
 * Session fixture: verified user + first workspace id (JWT not used on `/public/*`).
 * Uses a one-off verification token per signup so `verify-signup` cannot verify the wrong row when
 * multiple test users share the suite (token lookup is by hash only).
 */
export async function signupVerifyAndGetWorkspace(
    _adminSupabase: SupabaseClient,
    userHelper: UserTestHelper,
    payload: SignupPayload
): Promise<{ accessToken: string; orgId: string }> {
    const signupVerificationToken = generateRandomVerificationToken();
    jest.spyOn(EmailService.prototype, "generateVerificationToken").mockImplementationOnce(
        () => signupVerificationToken
    );

    const signupRes = await supertest(app).post(`${authPath}/sign-up`).send(payload);
    expect(signupRes.status).toBe(201);
    await userHelper.trackUserAfterSignUp(signupRes, payload.email);

    const verifyRes = await supertest(app).get(
        `${authPath}/verify-signup?token=${signupVerificationToken}&email=${encodeURIComponent(payload.email)}`
    );
    expect(verifyRes.status).toBe(200);
    await userHelper.trackUserByEmail(payload.email);

    const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
        email: payload.email,
        password: payload.password,
    });
    expect(signInRes.status).toBe(200);
    const accessToken = signInRes.body.data?.accessToken ?? signInRes.body.data?.session?.accessToken;
    expect(accessToken).toBeDefined();

    const listRes = await supertest(app)
        .get(settingsPath)
        .set("Authorization", `Bearer ${accessToken as string}`);
    expect(listRes.status).toBe(200);
    const orgId = listRes.body?.data?.[0]?.id as string;
    expect(orgId).toBeDefined();

    return { accessToken: accessToken as string, orgId };
}

/**
 * `requireProgrammaticAuth` fallback: `organizations.api_key` (`opk_…`).
 * @see middlewares/programmaticAuth.ts
 */
export async function provisionLegacyOrgApiKey(
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper,
    payload: SignupPayload
): Promise<ProgrammaticAuthFixture> {
    const { accessToken, orgId } = await signupVerifyAndGetWorkspace(
        adminSupabase,
        userHelper,
        payload
    );

    const listRes = await supertest(app)
        .get(settingsPath)
        .set("Authorization", `Bearer ${accessToken}`);
    let apiKey = listRes.body?.data?.[0]?.apiKey as string | null;
    if (!apiKey) {
        const rotate = await supertest(app)
            .post(`${settingsPath}/${orgId}/rotate-api-key`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(rotate.status).toBe(200);
        apiKey = rotate.body?.data?.apiKey as string | null;
    }
    expect(typeof apiKey).toBe("string");
    expect(apiKey).toMatch(/^opk_/);

    return { orgId, bearerToken: apiKey as string };
}

/**
 * `requireProgrammaticAuth` primary path: OAuth app token from code exchange (`opo_…`).
 * @see middlewares/programmaticAuth.ts, tests/integration/OauthApps.integration.test.ts
 */
export async function provisionOAuthAppAccessToken(
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper,
    payload: SignupPayload
): Promise<ProgrammaticAuthFixture> {
    const { accessToken, orgId } = await signupVerifyAndGetWorkspace(
        adminSupabase,
        userHelper,
        payload
    );

    const createApp = await supertest(app)
        .post(oauthAppsPath)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            organizationId: orgId,
            name: `E2E Posts ${faker.string.alphanumeric(6)}`,
            description: "Programmatic posts e2e",
            redirectUrl: "https://example.com/oauth/callback",
        });
    expect(createApp.status).toBe(201);
    const clientId = createApp.body?.data?.clientId as string;
    const clientSecret = createApp.body?.data?.clientSecret as string;
    expect(typeof clientId).toBe("string");
    expect(typeof clientSecret).toBe("string");

    const approve = await supertest(app)
        .post(oauthAuthorizePath)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ client_id: clientId, organizationId: orgId, state: "e2e-posts", action: "approve" });
    expect(approve.status).toBe(200);
    const redirect = approve.body?.redirect as string;
    const code = new URL(redirect).searchParams.get("code");
    expect(typeof code).toBe("string");

    const tokenRes = await supertest(app).post(oauthTokenPath).send({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
    });
    expect(tokenRes.status).toBe(200);
    const bearerToken = tokenRes.body?.access_token as string;
    expect(typeof bearerToken).toBe("string");
    expect(bearerToken).toMatch(/^opo_/);

    return { orgId, bearerToken };
}

export function programmaticBearerAuth(bearerToken: string): { Authorization: string } {
    return { Authorization: `Bearer ${bearerToken}` };
}
