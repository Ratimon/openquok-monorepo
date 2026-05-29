import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import { EmailService } from "../../services/EmailService";
import { hashProgrammaticToken } from "../../utils/auth/tokenHash";
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
    userHelper.trackOrganization(orgId);

    return { accessToken: accessToken as string, orgId };
}

/**
 * Writes a legacy `organizations.api_key` (`opk_…`) directly for tests that assert rejection.
 * Programmatic `/public/*` routes accept `opo_` only; use {@link provisionOAuthAppAccessToken} for valid auth.
 */
export async function provisionLegacyOrgApiKey(
    adminSupabase: SupabaseClient,
    userHelper: UserTestHelper,
    payload: SignupPayload
): Promise<ProgrammaticAuthFixture> {
    const { orgId } = await signupVerifyAndGetWorkspace(adminSupabase, userHelper, payload);
    const legacyKey = `opk_${faker.string.alphanumeric(48)}`;
    const { error } = await adminSupabase
        .from("organizations")
        .update({ api_key: legacyKey, updated_at: new Date().toISOString() })
        .eq("id", orgId);
    expect(error).toBeNull();

    return { orgId, bearerToken: legacyKey };
}

/**
 * OAuth app token from code exchange (`opo_…`) for programmatic `/public/*` routes.
 * @see guards/programmatic/programmaticAuth.ts, tests/integration/OauthApps.integration.test.ts
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

/** Exchange an OAuth app authorization code for a programmatic bearer token (`opo_…`). */
export async function exchangeOAuthProgrammaticToken(
    accessToken: string,
    orgId: string,
    options?: { appName?: string }
): Promise<string> {
    const appName = options?.appName ?? `Programmatic ${faker.string.alphanumeric(6)}`;

    const createApp = await supertest(app)
        .post(oauthAppsPath)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            organizationId: orgId,
            name: appName,
            description: "Programmatic integration test",
            redirectUrl: "https://example.com/oauth/callback",
        });
    expect(createApp.status).toBe(201);
    const clientId = createApp.body?.data?.clientId as string;
    const clientSecret = createApp.body?.data?.clientSecret as string;

    const approve = await supertest(app)
        .post(oauthAuthorizePath)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ client_id: clientId, organizationId: orgId, state: "integration", action: "approve" });
    expect(approve.status).toBe(200);
    const code = new URL(approve.body?.redirect as string).searchParams.get("code");
    expect(typeof code).toBe("string");

    const tokenRes = await supertest(app).post(oauthTokenPath).send({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
    });
    expect(tokenRes.status).toBe(200);
    const bearerToken = tokenRes.body?.access_token as string;
    expect(bearerToken).toMatch(/^opo_/);
    return bearerToken;
}

export function programmaticBearerAuth(bearerToken: string): { Authorization: string } {
    return { Authorization: `Bearer ${bearerToken}` };
}

/**
 * Ensures the first-party OAuth app row exists for workspace programmatic token rotate tests.
 * Requires `SECURITY_SECRET` on the backend process.
 */
export async function ensureFirstPartyOauthApp(
    adminSupabase: SupabaseClient,
    params: { clientId: string; organizationId: string; userId: string }
): Promise<void> {
    const { data: existing, error: lookupError } = await adminSupabase
        .from("oauth_apps")
        .select("id")
        .eq("client_id", params.clientId)
        .is("deleted_at", null)
        .maybeSingle();
    expect(lookupError).toBeNull();
    if (existing?.id) return;

    const secretKey =
        (config.auth as { programmaticTokenSecret?: string }).programmaticTokenSecret?.trim() ?? "";
    expect(secretKey.length).toBeGreaterThan(0);

    const now = new Date().toISOString();
    const { error } = await adminSupabase.from("oauth_apps").insert({
        organization_id: params.organizationId,
        created_by_user_id: params.userId,
        name: "Integration first-party CLI app",
        description: "Fixture for workspace programmatic token rotate integration tests",
        redirect_url: "https://example.com/oauth/callback",
        client_id: params.clientId,
        client_secret_hash: hashProgrammaticToken("oqs_integration_first_party_secret", secretKey),
        deleted_at: null,
        created_at: now,
        updated_at: now,
    });
    expect(error).toBeNull();
}

/** Resolves public.users id from a session JWT (same as auth user id when ids are aligned). */
export async function resolveUserIdFromAccessToken(
    adminSupabase: SupabaseClient,
    accessToken: string
): Promise<string> {
    const { data, error } = await adminSupabase.auth.getUser(accessToken);
    expect(error).toBeNull();
    const userId = data?.user?.id;
    expect(userId).toBeDefined();
    return userId as string;
}
