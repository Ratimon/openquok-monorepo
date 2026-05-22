import type { Express } from "express";
import supertest from "supertest";

import type { UserTestHelper } from "./userTestHelper";

export type SignUpPayload = {
    email: string;
    password: string;
    fullName: string;
};

/**
 * Sign up, verify email, sign in — and track the user for {@link UserTestHelper.cleanAll}.
 * Shared by integration suites that exercise session auth against a real Supabase project.
 */
export async function signupVerifyAndSignIn(
    app: Express,
    userHelper: UserTestHelper,
    authPath: string,
    verificationToken: string,
    payload?: SignUpPayload
): Promise<{ accessToken: string; payload: SignUpPayload }> {
    const signUpPayload = payload ?? userHelper.setupTestUser1();

    const signupRes = await supertest(app).post(`${authPath}/sign-up`).send(signUpPayload);
    expect(signupRes.status).toBe(201);
    await userHelper.trackUserAfterSignUp(signupRes, signUpPayload.email);

    const verifyRes = await supertest(app).get(
        `${authPath}/verify-signup?token=${verificationToken}&email=${encodeURIComponent(signUpPayload.email)}`
    );
    expect(verifyRes.status).toBe(200);
    await userHelper.trackUserByEmail(signUpPayload.email);

    const signInRes = await supertest(app).post(`${authPath}/sign-in`).send({
        email: signUpPayload.email,
        password: signUpPayload.password,
    });
    expect(signInRes.status).toBe(200);
    const accessToken =
        signInRes.body.data?.accessToken ?? signInRes.body.data?.session?.accessToken;
    expect(accessToken).toBeDefined();

    return { accessToken: accessToken as string, payload: signUpPayload };
}

/** POST /auth/sign-up and track the created user for cleanup. */
export async function requestSignupAndTrack(
    app: Express,
    userHelper: UserTestHelper,
    authPath: string,
    payload: SignUpPayload
) {
    const res = await supertest(app).post(`${authPath}/sign-up`).send(payload);
    if (res.status === 201) {
        await userHelper.trackUserAfterSignUp(res, payload.email);
    }
    return res;
}

/** Run after each integration test that creates @test.com users. */
export async function cleanupIntegrationTestUsers(userHelper: UserTestHelper): Promise<void> {
    await userHelper.cleanAll();
}
