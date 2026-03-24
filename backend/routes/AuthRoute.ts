import { Router } from "express";
import { authController } from "../controllers/index";
import authSchemas from "../data/schemas/authSchemas";

type AuthRouter = ReturnType<typeof Router>;
const authRouter: AuthRouter = Router();

authRouter.post("/sign-up", authSchemas.validateSignUpRequest, authController.signUp);
authRouter.post("/sign-in", authSchemas.validateSignInRequest, authController.signIn);
authRouter.post("/sign-out", authController.signOut);
authRouter.post("/refresh", authSchemas.validateRefreshTokenRequest, authController.refreshToken);

// OAuth: list configured providers
authRouter.get("/oauth/providers", authController.getOAuthProviders);
// OAuth: get redirect URL for a provider (frontend uses this to redirect user)
authRouter.get("/oauth/:provider", authController.getOAuthRedirectUrl);
// OAuth: callback from provider (redirect_uri) – exchange code, redirect to magic link
authRouter.get("/oauth/:provider/callback", authController.getOAuthCallback);

// Signup verification endpoints
authRouter.get(
    "/request-verify-signup",
    authSchemas.validateTokenAndEmailRequest,
    authController.requestSignupVerification
);
authRouter.get("/check-signup-verification", authController.checkSignupVerification);
authRouter.get(
    "/verify-signup",
    authSchemas.validateEmailVerificationRequest,
    authController.verifySignup
);
authRouter.post(
    "/send-verification-email",
    authSchemas.validateEmailRequest,
    authController.sendVerificationEmail
);

// Forgot & reset password endpoints
authRouter.post("/ask-reset", authSchemas.validateResetPasswordRequest, authController.askPasswordReset);
authRouter.get("/verify-reset", authSchemas.validateVerifyResetRequest, authController.verifyReset);

authRouter.get("/status", authController.status);

export { authRouter };
