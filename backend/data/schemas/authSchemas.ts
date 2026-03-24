import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

const emailRequirements = z
    .string()
    .email({ message: "Please enter a valid email." })
    .trim();

const passwordRequirements = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(72, { message: "Password must be at most 72 characters long." })
    .trim();

const fullNameRequirements = z
    .string()
    .min(2, { message: "Full name must be at least 2 characters long." })
    .max(100, { message: "Full name must be at most 100 characters long." })
    .trim();

const codeRequirements = z
    .string()
    .min(6, { message: "Code must be at least 6 characters long." })
    .max(6, { message: "Code must be at most 6 characters long." })
    .trim();

// Token (32-byte hex, e.g. from EmailService.generateVerificationToken)
const tokenRequirements = z
    .string()
    .regex(/^[a-f0-9]{64}$/i, { message: "Token must be a 32-byte hex string." });

// Sign up
const SignUpFormSchema = z.object({
    email: emailRequirements,
    password: passwordRequirements,
    fullName: fullNameRequirements.optional(),
});
const validateSignUpRequest: RequestHandler = validateRequest({ body: SignUpFormSchema });
export type validateSignUpRequestHandler = typeof validateSignUpRequest;

// Sign in
const SignInFormSchema = z.object({
    email: emailRequirements,
    password: passwordRequirements,
});
const validateSignInRequest: RequestHandler = validateRequest({ body: SignInFormSchema });
export type validateSignInRequestHandler = typeof validateSignInRequest;

// Reset password (ask-reset)
const ResetPasswordSchema = z.object({
    email: emailRequirements,
});
const validateResetPasswordRequest: RequestHandler = validateRequest({ body: ResetPasswordSchema });
export type validateResetPasswordRequestHandler = typeof validateResetPasswordRequest;

// Verify reset (query: email, code, type)
const VerifyResetSchema = z.object({
    email: emailRequirements,
    code: codeRequirements,
    type: z.string(),
});
const validateVerifyResetRequest: RequestHandler = validateRequest({ query: VerifyResetSchema });
export type validateVerifyResetRequestHandler = typeof validateVerifyResetRequest;

// Request verify signup (link from email): query token + email
const TokenAndEmailSchema = z.object({
    token: tokenRequirements,
    email: emailRequirements,
});
const validateTokenAndEmailRequest: RequestHandler = validateRequest({ query: TokenAndEmailSchema });
export type validateTokenAndEmailRequestHandler = typeof validateTokenAndEmailRequest;

// Verify signup (confirm token): query token
const EmailVerificationSchema = z.object({
    token: tokenRequirements,
});
const validateEmailVerificationRequest: RequestHandler = validateRequest({ query: EmailVerificationSchema });
export type validateEmailVerificationRequestHandler = typeof validateEmailVerificationRequest;

// Send verification email: body email
const EmailOnlySchema = z.object({
    email: emailRequirements,
});
const validateEmailRequest: RequestHandler = validateRequest({ body: EmailOnlySchema });
export type validateEmailRequestHandler = typeof validateEmailRequest;

// Refresh token: can come from cookie or body, so body is optional
const RefreshTokenSchema = z
    .object({
        refreshToken: z.string().trim().min(1).optional(),
    })
    .passthrough();
const validateRefreshTokenRequest: RequestHandler = validateRequest({ body: RefreshTokenSchema });
export type validateRefreshTokenRequestHandler = typeof validateRefreshTokenRequest;

interface AuthSchemas {
    validateSignUpRequest: RequestHandler;
    validateSignInRequest: RequestHandler;
    validateResetPasswordRequest: RequestHandler;
    validateVerifyResetRequest: RequestHandler;
    validateRefreshTokenRequest: RequestHandler;
    validateTokenAndEmailRequest: RequestHandler;
    validateEmailVerificationRequest: RequestHandler;
    validateEmailRequest: RequestHandler;
}

const authSchemas: AuthSchemas = {
    validateSignUpRequest,
    validateSignInRequest,
    validateResetPasswordRequest,
    validateVerifyResetRequest,
    validateRefreshTokenRequest,
    validateTokenAndEmailRequest,
    validateEmailVerificationRequest,
    validateEmailRequest,
};

export default authSchemas;
