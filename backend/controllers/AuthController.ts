import type { Request, Response, NextFunction } from "express";
import type { AuthenticationService } from "../services/AuthenticationService";
import type { UserRepository } from "../repositories/UserRepository";
import type { EmailService } from "../services/EmailService";
import type { OAuthService } from "../services/OAuthService";
import type { OrganizationService } from "../services/OrganizationService";

import type {
    validateSignUpRequestHandler,
    validateSignInRequestHandler,
    validateResetPasswordRequestHandler,
    validateVerifyResetRequestHandler,
    validateRefreshTokenRequestHandler,
} from "../data/schemas/authSchemas";

import {
    TokenError,
    UserConflictError,
    AuthError,
} from "../errors/AuthError";
import { InfraError, ValidationError, DatabaseEntityNotFoundError } from "../errors/InfraError";
import { VerifyEmailTemplate } from "../emails/VerifyEmailTemplate";
import { WelcomeEmailTemplate } from "../emails/WelcomeEmailTemplate";
import { ResetPasswordEmailTemplate } from "../emails/ResetPasswordEmailTemplate";
import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";
import { normalizeEmail } from "../utils/helper";
import { AuthUserDTOMapper } from "../utils/dtos/AuthUserDTO";

const serverConfig = config.server as {
    nodeEnv?: string;
    frontendDomainUrl?: string;
    backendDomainUrl?: string;
};

export class AuthController {
    private userRepository: UserRepository;
    private authenticationService: AuthenticationService;
    private emailService: EmailService;
    private oauthService: OAuthService;
    private organizationService: OrganizationService;

    /**
     * Get appropriate sameSite value for refresh token cookie.
     * - 'lax' for development or when frontend/backend are on same registrable domain
     * - 'none' when frontend/backend are on different domains (requires secure: true)
     */
    private getSameSiteValue(): "lax" | "none" {
        if (serverConfig.nodeEnv !== "production") return "lax";
        try {
            const frontUrl = new URL(serverConfig.frontendDomainUrl ?? "");
            const backUrl = new URL(serverConfig.backendDomainUrl ?? "");
            const frontDomain = frontUrl.hostname.split(".").slice(-2).join(".");
            const backDomain = backUrl.hostname.split(".").slice(-2).join(".");
            return frontDomain === backDomain ? "lax" : "none";
        } catch {
            return "none";
        }
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string): void {
        const isProduction = serverConfig.nodeEnv === "production";
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: this.getSameSiteValue(),
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
            path: "/",
        });
    }

    constructor(
        authenticationService: AuthenticationService,
        userRepository: UserRepository,
        emailService: EmailService,
        oauthService: OAuthService,
        organizationService: OrganizationService
    ) {
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.oauthService = oauthService;
        this.organizationService = organizationService;
    }

    public signUp: validateSignUpRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email: rawEmail, password, fullName } = req.body;
            const email = normalizeEmail(rawEmail);

            const isEmailVerified = await this.userRepository.checkIfEmailVerified(email);
            if (isEmailVerified) {
                throw new UserConflictError("This email is already registered. Please sign in.");
            }

            const { newUser, session } = await this.authenticationService.signUp(
                email,
                password,
                fullName ?? email,
                { req, res }
            );

            if (session?.refresh_token && newUser?.id) {
                const clientInfo = {
                    ipAddress: req.ip ?? req.socket?.remoteAddress,
                    userAgent: req.headers["user-agent"],
                };
                try {
                    await this.authenticationService.generateRefreshToken({
                        userId: newUser.id,
                        token: session.refresh_token,
                        ipAddress: clientInfo.ipAddress,
                        userAgent: clientInfo.userAgent,
                    });
                } catch (err) {
                    logger.warn({
                        msg: "Failed to store refresh token",
                        userId: newUser.id,
                        error: (err as Error).message,
                    });
                }
                this.setRefreshTokenCookie(res, session.refresh_token);
            }

            // Ensure public.users row exists (covers envs where DB trigger is not present, e.g. some test Supabase)
            if (newUser?.id && email) {
                await this.userRepository.upsertUserFromAuth({
                    id: newUser.id,
                    authId: newUser.id,
                    email: newUser.email ?? email,
                    fullName: fullName ?? email,
                });
            }

            // Create default organization for new user (createOrgAndUser-style); keep multi-org create/update/delete in settings
            if (newUser?.id) {
                const defaultOrg = await this.organizationService.createDefaultOrganizationForNewUser(newUser.id, {
                    name: fullName ?? "My Organization",
                });
                if (!defaultOrg) {
                    logger.warn({ msg: "Default organization creation failed at signup", userId: newUser.id });
                }
            }

            if (newUser?.id && newUser?.email) {
                try {
                    const token = this.emailService.generateVerificationToken();
                    const hashedToken = this.emailService.hashToken(token);
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 24);
                    const { updateError } = await this.userRepository.updateVerificationTokenByEmail(
                        newUser.email ?? email,
                        hashedToken,
                        expiresAt
                    );
                    if (!updateError && this.emailService.isEnabled) {
                        await this.emailService.send(
                            new VerifyEmailTemplate(
                                serverConfig.backendDomainUrl ?? "",
                                fullName ?? "User",
                                email,
                                token
                            ),
                            email
                        );
                        logger.info({ msg: "Verification email sent after signup", email });
                    } else if (updateError) {
                        logger.warn({ msg: "Failed to store verification token", email });
                    }
                } catch (emailErr) {
                    logger.warn({
                        msg: "Failed to send verification email after signup",
                        email,
                        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
                    });
                }
            }

            const { userData: dbUser } = await this.userRepository.findFullUserByEmail(email);
            const userDto = AuthUserDTOMapper.toDTO(
                dbUser ?? null,
                newUser ? { id: newUser.id, email: newUser.email ?? email, user_metadata: { full_name: fullName ?? email } } : null,
                { roles: [] }
            );

            logger.info({ msg: "User signup successful", email });
            res.status(201).json({
                success: true,
                data: {
                    user: userDto,
                    session: session
                        ? { accessToken: session.access_token, refreshToken: session.refresh_token }
                        : undefined,
                },
                message: "Sign up successful!!",
            });
        } catch (error) {
            next(error);
        }
    };

    public signIn: validateSignInRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email: rawEmail, password } = req.body;
            const email = normalizeEmail(rawEmail);

            const { signedInUser, userDBdata, session } = await this.authenticationService.signIn(
                email,
                password,
                { req, res }
            );

            const refreshToken = session.refresh_token;
            const clientInfo = {
                ipAddress: req.ip ?? req.socket?.remoteAddress,
                userAgent: req.headers["user-agent"],
            };
            try {
                await this.authenticationService.generateRefreshToken({
                    userId: signedInUser.id,
                    token: refreshToken,
                    ipAddress: clientInfo.ipAddress,
                    userAgent: clientInfo.userAgent,
                });
            } catch (err) {
                logger.warn({
                    msg: "Failed to store refresh token",
                    userId: signedInUser.id,
                    error: (err as Error).message,
                });
            }
            this.setRefreshTokenCookie(res, refreshToken);

            const userDto = AuthUserDTOMapper.toDTO(
                userDBdata,
                signedInUser as { id: string; email?: string; user_metadata?: { full_name?: string } },
                // Roles are empty here: sign-in does not run role-loading middleware. They are set by requireFullAuthWithRoles on subsequent authenticated requests.
                { roles: [] }
            );

            logger.info({ msg: "User authenticated successfully", email });
            res.status(200).json({
                success: true,
                data: {
                    user: userDto,
                    accessToken: session.access_token,
                    refreshToken,
                },
                message: "Sign in successful",
            });
        } catch (error) {
            next(error);
        }
    };

    public signOut = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
            if (refreshToken) {
                try {
                    await this.authenticationService.revokeRefreshToken(refreshToken);
                } catch (err) {
                    logger.warn({ msg: "Failed to revoke refresh token", error: (err as Error).message });
                }
            }
            res.clearCookie("refreshToken");
            await this.authenticationService.signOut({ req, res });
            logger.info({ msg: "User signed out" });
            res.status(200).json({ success: true, message: "Signed out successfully" });
        } catch (error) {
            next(error);
        }
    };

    public refreshToken: validateRefreshTokenRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
            if (!refreshToken) {
                throw new TokenError("Missing refresh token");
            }

            const clientInfo = {
                ipAddress: req.ip ?? req.socket?.remoteAddress,
                userAgent: req.headers["user-agent"],
            };
            const data = await this.authenticationService.refreshToken(refreshToken, clientInfo);

            if (req.cookies?.refreshToken) {
                this.setRefreshTokenCookie(res, data.session.refresh_token);
            }

            logger.info({ msg: "Token refreshed successfully" });
            res.status(200).json({
                success: true,
                data: {
                    accessToken: data.session.access_token,
                    refreshToken: req.cookies?.refreshToken ? undefined : data.session.refresh_token,
                    expiresIn: 3600,
                    tokenType: "Bearer",
                },
                message: "Token refreshed successfully",
            });
        } catch (error) {
            if (req.cookies?.refreshToken) res.clearCookie("refreshToken");
            // Invalid/missing/revoked/expired refresh token → 401 so client treats as unauthenticated; do not send to Sentry
            if (error instanceof DatabaseEntityNotFoundError || error instanceof ValidationError) {
                logger.debug({ msg: "Refresh token invalid or not found", reason: (error as Error).message });
                res.status(401).json({
                    success: false,
                    message: "Session expired or invalid. Please sign in again.",
                    error: { type: "Unauthorized", message: (error as Error).message },
                });
                return;
            }
            next(error);
        }
    };


    public askPasswordReset: validateResetPasswordRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = normalizeEmail(req.body?.email);
            const frontendUrl = serverConfig.frontendDomainUrl ?? "";

            const { token, error: genError } = await this.authenticationService.generateRecoveryLink(email, {
                redirectTo: `${frontendUrl}/forgot-password`,
            });

            if (genError) {
                logger.warn({ msg: "Password reset request failed", email, error: genError.message });
            }

            if (token && this.emailService.isEnabled) {
                try {
                    const { userData } = await this.userRepository.findFullUserByEmail(email);
                    const fullName = userData?.full_name ?? "User";
                    await this.emailService.send(
                        new ResetPasswordEmailTemplate(frontendUrl, fullName, email, token),
                        email
                    );
                    logger.info({ msg: "Password reset email sent", email });
                } catch (emailErr) {
                    logger.warn({
                        msg: "Failed to send password reset email",
                        email,
                        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
                    });
                }
            }

            res.status(200).json({
                success: true,
                message: "If an account exists for this email, you will receive password reset instructions.",
            });
        } catch (error) {
            next(error);
        }
    };

    public verifyReset: validateVerifyResetRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email: rawEmail, code, type } = req.query as { email: string; code: string; type: string };
            const email = normalizeEmail(rawEmail);
            const { signedInUser, session } = await this.authenticationService.verifyOtp(
                email,
                code,
                type as "recovery" | "signup"
            );
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        email: signedInUser?.email,
                        fullName:
                            (signedInUser as { user_metadata?: { full_name?: string } })?.user_metadata
                                ?.full_name ?? "User",
                    },
                    accessToken: session.access_token,
                    refreshToken: session.refresh_token,
                },
                message: "Code verified successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    public status = async (_req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Auth service is running",
            authenticated: false,
        });
    };

    /**
     * Request verify signup: user clicks link in email (token + email in query).
     * Redirects to frontend verify-signup page with token and email, or to auth-error on failure.
     */
    public requestSignupVerification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, email: rawEmail } = req.query as { token: string; email: string };
            const email = normalizeEmail(rawEmail);
            const hashedToken = this.emailService.hashToken(token);
            const { userData } = await this.userRepository.findUserByTokenHash(hashedToken);

            if (!userData || userData.length === 0) {
                if (email) {
                    const { userData: userByEmail } = await this.userRepository.findFullUserByEmail(email);
                    if (userByEmail?.is_email_verified) {
                        res.redirect(`${serverConfig.frontendDomainUrl ?? ""}/sign-up`);
                        return;
                    }
                    throw new TokenError(
                        "This verification link has expired. Please use the most recent verification email, or request a new one."
                    );
                }
                throw new TokenError("Expired or invalid verification token");
            }

            const user = userData[0];
            if (!user) {
                throw new TokenError("Invalid or expired verification token");
            }
            if (!user.is_email_verified) {
                const frontendUrl = serverConfig.frontendDomainUrl ?? "";
                res.redirect(`${frontendUrl}/verify-signup?token=${token}&email=${encodeURIComponent(email ?? user.email ?? "")}`);
                return;
            }
            res.redirect(`${serverConfig.frontendDomainUrl ?? ""}/sign-up`);
        } catch (error) {
            const frontendUrl = serverConfig.frontendDomainUrl ?? "";
            const message =
                error instanceof AuthError
                    ? (error as Error).message
                    : error instanceof Error
                      ? error.message
                      : "An error occurred. Please contact support.";
            res.redirect(`${frontendUrl}/auth-error?message=${encodeURIComponent(message)}`);
        }
    };

    /**
     * Check signup verification: validate token and email (e.g. before showing verify button), or check by email only whether the account is verified (e.g. for reactive sign-up page).
     * - With token + email: returns success when token is valid and not yet verified; returns success: false when already verified.
     * - With email only: returns success: true and verified: true/false for that email (for polling from sign-up page).
     */
    public checkSignupVerification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, email: rawEmail } = req.query as { token?: string; email?: string };
            const email = rawEmail ? normalizeEmail(rawEmail) : undefined;

            // Email-only check: is this email verified?
            if (email && !token) {
                const { userData } = await this.userRepository.findFullUserByEmail(email);
                const verified = userData?.is_email_verified === true;
                res.status(200).json({ success: true, verified });
                return;
            }

            if (!token || !email) {
                res.status(200).json({ success: false, message: "Missing token or email" });
                return;
            }
            const hashedToken = this.emailService.hashToken(token);
            const { userData } = await this.userRepository.findUserByTokenHash(hashedToken);
            if (!userData || userData.length === 0 || !userData[0]) {
                res.status(200).json({ success: false, message: "Token not found or expired" });
                return;
            }
            const user = userData[0];
            if (email && user.email?.toLowerCase() !== email) {
                res.status(200).json({ success: false, message: "Token does not belong to this email" });
                return;
            }
            if (user.is_email_verified) {
                res.status(200).json({ success: false, message: "User is already verified", verified: true });
                return;
            }
            res.status(200).json({ success: true, message: "Token is valid and not expired", verified: false });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Send (resend) verification email for an email address.
     */
    public sendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = normalizeEmail(req.body?.email);
            const { userData } = await this.userRepository.findFullUserByEmail(email);
            if (!userData) {
                res.status(200).json({
                    success: true,
                    message: "If an account exists with this email, a verification link has been sent",
                });
                return;
            }
            if (userData.is_email_verified) {
                res.status(200).json({
                    success: true,
                    message: "If an account exists with this email, a verification link has been sent",
                });
                return;
            }
            const token = this.emailService.generateVerificationToken();
            const hashedToken = this.emailService.hashToken(token);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            const { updateError } = await this.userRepository.updateVerificationToken(
                userData.id,
                hashedToken,
                expiresAt
            );
            if (!updateError && this.emailService.isEnabled) {
                await this.emailService.send(
                    new VerifyEmailTemplate(
                        serverConfig.backendDomainUrl ?? "",
                        userData.full_name ?? "User",
                        userData.email ?? email,
                        token
                    ),
                    userData.email ?? email
                );
                logger.info({ msg: "Verification email sent", email });
            }
            res.status(200).json({
                success: true,
                message: "If an account exists with this email, a verification link has been sent",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Verify signup: token in query, find user by hashed token, mark verified, clear token, send welcome email.
     */
    public verifySignup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.query.token as string | undefined;
            if (!token) {
                res.status(400).json({ success: false, message: "Missing verification token" });
                return;
            }
            const hashedToken = this.emailService.hashToken(token);
            const { userData } = await this.userRepository.findUserByTokenHash(hashedToken);
            if (!userData || userData.length === 0) {
                res.status(400).json({ success: false, message: "Invalid or expired verification token" });
                return;
            }
            const user = userData[0];
            if (user.is_email_verified) {
                res.status(200).json({ success: true, message: "Email already verified" });
                return;
            }
            await this.userRepository.updateEmailVerification(user.id, true);
            await this.userRepository.updateVerificationToken(user.id, null, null);
            if (this.emailService.isEnabled && user.email) {
                try {
                    await this.emailService.send(
                        new WelcomeEmailTemplate(user.full_name ?? "User"),
                        user.email
                    );
                    logger.info({ msg: "Welcome email sent after verification", email: user.email });
                } catch (emailErr) {
                    logger.warn({
                        msg: "Failed to send welcome email",
                        email: user.email,
                        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
                    });
                }
            }
            res.status(200).json({ success: true, message: "Email successfully verified" });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /oauth/providers – return list of configured OAuth provider names for the frontend.
     */
    public getOAuthProviders = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { getConfiguredOAuthProviders } = await import("../connections/oauth/providers");
            const providers = getConfiguredOAuthProviders();
            res.status(200).json({ success: true, data: { providers } });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /oauth/:provider – return redirect URL for the given OAuth provider (sign-in/sign-up).
     */
    public getOAuthRedirectUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const provider = req.params.provider?.toLowerCase() as "google" | "github" | "generic";
            if (!provider || !["google", "github", "generic"].includes(provider)) {
                res.status(400).json({ success: false, message: "Invalid or missing provider" });
                return;
            }
            const url = this.oauthService.getRedirectUrl(provider, req.query.state as string | undefined);
            res.status(200).json({ success: true, data: { url } });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /oauth/:provider/callback – OAuth callback: exchange code, find/create user, redirect to magic link.
     */
    public getOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
        const frontendUrl = (config.server as { frontendDomainUrl?: string }).frontendDomainUrl ?? "";
        const authErrorUrl = (msg: string) =>
            `${frontendUrl}/auth-error?message=${encodeURIComponent(msg)}`;
        try {
            const provider = req.params.provider?.toLowerCase() as "google" | "github" | "generic";
            const code = (req.query.code as string)?.trim();
            if (!provider || !["google", "github", "generic"].includes(provider)) {
                res.redirect(authErrorUrl("Invalid provider"));
                return;
            }
            if (!code) {
                res.redirect(authErrorUrl("Missing code"));
                return;
            }
            const { redirectTo } = await this.oauthService.handleCallback(provider, code);
            res.redirect(redirectTo);
        } catch (error) {
            const message = error instanceof Error ? error.message : "OAuth failed";
            const statusCode = error && typeof (error as { statusCode?: number }).statusCode === "number"
                ? (error as { statusCode: number }).statusCode
                : 500;
            if (res.headersSent) return next(error);
            res.redirect(authErrorUrl(`${message} (${statusCode})`));
        }
    };
}
