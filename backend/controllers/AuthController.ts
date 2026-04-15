import type { Request, Response, NextFunction } from "express";
import type { AuthenticationService } from "../services/AuthenticationService";
import type { UserRepository } from "../repositories/UserRepository";
import type { EmailService } from "../services/EmailService";
import type { OrganizationService } from "../services/OrganizationService";
import type { UserService } from "../services/UserService";

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
    private userService: UserService;
    private authenticationService: AuthenticationService;
    private emailService: EmailService;
    private organizationService: OrganizationService;

    /**
     * Best-effort "site" key for SameSite decisions (eTLD+1-ish).
     *
     * Why this exists:
     * - Browsers decide SameSite based on "site" (scheme + registrable domain / eTLD+1)
     * - A naïve "last two labels" approach breaks on multi-tenant public suffixes like:
     *   - foo.vercel.app vs bar.vercel.app (NOT same-site; "vercel.app" is a public suffix)
     *   - foo.netlify.app vs bar.netlify.app
     *   In those cases, choosing SameSite='lax' prevents the refresh cookie from being sent on XHR/fetch,
     *   so refresh fails in production after the 1-hour access token expiry.
     *
     * We can't rely on a PSL parser here without adding deps, so we use a small allowlist.
     * If in doubt, we intentionally fall back to treating domains as different → SameSite='none'.
     */
    private getSiteKey(hostname: string): string {
        const h = hostname.toLowerCase();
        const parts = h.split(".").filter(Boolean);
        if (parts.length <= 1) return h;

        // Known multi-tenant public suffixes where registrable domain is 3 labels.
        // (e.g. <project>.vercel.app). Add more here if you deploy on other platforms.
        const threeLabelPublicSuffixes = new Set([
            "vercel.app",
            "netlify.app",
            "onrender.com",
            "fly.dev",
            "pages.dev",
            "web.app",
            "firebaseapp.com",
            "github.io",
        ]);

        const last2 = parts.slice(-2).join(".");
        if (threeLabelPublicSuffixes.has(last2) && parts.length >= 3) {
            return parts.slice(-3).join(".");
        }

        // Default heuristic: last 2 labels (works for typical apex domains like example.com).
        return last2;
    }

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
            const frontSite = this.getSiteKey(frontUrl.hostname);
            const backSite = this.getSiteKey(backUrl.hostname);
            return frontSite === backSite ? "lax" : "none";
        } catch {
            // If URL parsing fails in production, prefer 'none' so refresh continues to work cross-origin.
            return "none";
        }
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string): void {
        const isProduction = serverConfig.nodeEnv === "production";
        const domain = (() => {
            if (!isProduction) return undefined;
            try {
                const backUrl = new URL(serverConfig.backendDomainUrl ?? "");
                const hostname = backUrl.hostname;
                // Don't set domain for IPs/localhost (invalid/pointless).
                if (hostname === "localhost") return undefined;
                if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return undefined;

                // If backend is a subdomain (e.g. api.example.com), set cookie domain to registrable site
                // (example.com) so requests to other subdomains or the apex can include the refresh cookie.
                const site = this.getSiteKey(hostname);
                if (hostname !== site && hostname.endsWith(`.${site}`)) return site;
                return undefined;
            } catch {
                return undefined;
            }
        })();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: this.getSameSiteValue(),
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
            path: "/",
            ...(domain ? { domain } : {}),
        });
    }

    /**
     * Mitigate CSRF for endpoints that rely on the refreshToken cookie (SameSite=None in cross-site deployments).
     *
     * CORS alone is NOT sufficient against CSRF because the request can still be sent by the browser;
     * the attacker just can't read the response. So for cookie-auth endpoints with side effects
     * (refresh rotates tokens, signout revokes tokens), we enforce an Origin allowlist check.
     */
    private assertCookieAuthOriginAllowed(req: Request): void {
        // Non-browser clients may omit Origin; allow those (they won't have cookies anyway).
        const origin = req.headers.origin;
        if (!origin) return;

        const corsConfig = config.cors as { allowedOrigins?: string[] | string };
        const allowed = corsConfig.allowedOrigins;
        if (allowed === "*" || (Array.isArray(allowed) && allowed.includes("*"))) return;
        if (Array.isArray(allowed) && allowed.includes(origin)) return;

        throw new AuthError(`Origin ${origin} not allowed`, 403);
    }

    constructor(
        authenticationService: AuthenticationService,
        userRepository: UserRepository,
        userService: UserService,
        emailService: EmailService,
        organizationService: OrganizationService
    ) {
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.emailService = emailService;
        this.organizationService = organizationService;
    }

    /**
     * Start Google OAuth (Supabase PKCE).
     * Redirects the browser to Google via Supabase, with callback back to this backend.
     */
    public startGoogleOAuth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const nextPath = typeof req.query.next === "string" ? req.query.next : undefined;
            // Store intended post-login path on the backend origin so Supabase redirect_to stays stable.
            // This avoids Supabase falling back to Site URL when query params cause allow-list mismatches.
            const safeNext = nextPath && nextPath.startsWith("/") ? nextPath : "/account";
            res.cookie("oauthNext", safeNext, {
                httpOnly: true,
                secure: serverConfig.nodeEnv === "production",
                sameSite: this.getSameSiteValue(),
                maxAge: 10 * 60 * 1000, // 10 minutes
                path: "/",
            });
            const url = await this.authenticationService.getOAuthSignInUrl("google", { req, res }, { next: nextPath });
            res.redirect(url);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Google OAuth callback.
     * Exchanges `code` for a Supabase session (sets Supabase cookies) and also sets our refreshToken cookie
     * + stores the refresh token in DB (best-effort) for parity with password sign-in flows.
     */
    public googleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const code = typeof req.query.code === "string" ? req.query.code : undefined;
            const nextFromQuery = typeof req.query.next === "string" ? req.query.next : undefined;
            const nextFromCookie = typeof req.cookies?.oauthNext === "string" ? req.cookies.oauthNext : undefined;
            const nextPath = nextFromQuery ?? nextFromCookie ?? "/account";

            const frontendUrl = serverConfig.frontendDomainUrl ?? "";
            const safeNext = nextPath.startsWith("/") ? nextPath : "/";
            const authErrorUrl = `${frontendUrl}/auth-error?message=${encodeURIComponent("Google sign-in failed. Please try again.")}`;

            if (!code) {
                res.redirect(authErrorUrl);
                return;
            }

            const { session, user: authUser } = await this.authenticationService.exchangeOAuthCodeForSession(
                { req, res },
                code
            );

            const emailRaw = authUser.email?.trim();
            if (!emailRaw) {
                logger.warn({ msg: "OAuth user has no email; cannot sync public.users", userId: authUser.id });
                res.redirect(
                    `${frontendUrl}/auth-error?message=${encodeURIComponent("Google sign-in failed: missing email on account.")}`
                );
                return;
            }
            const email = normalizeEmail(emailRaw);
            const meta = authUser.user_metadata as Record<string, unknown> | undefined;
            const fullName =
                (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
                (typeof meta?.name === "string" && meta.name.trim()) ||
                email;
            const googleIdentity = authUser.identities?.find((i) => i.provider === "google");
            const idData = googleIdentity?.identity_data as Record<string, unknown> | undefined;
            const providerId =
                (typeof idData?.sub === "string" && idData.sub) ||
                (googleIdentity?.id != null ? String(googleIdentity.id) : authUser.id);

            const { error: upsertOAuthError } = await this.userRepository.upsertUserFromOAuth({
                id: authUser.id,
                authId: authUser.id,
                email,
                fullName,
                provider: "google",
                providerId,
            });
            if (upsertOAuthError) {
                logger.error({
                    msg: "OAuth: failed to upsert public.users (required before refresh_tokens)",
                    userId: authUser.id,
                    error: upsertOAuthError,
                });
                res.redirect(
                    `${frontendUrl}/auth-error?message=${encodeURIComponent("Could not finish sign-in. Please try again.")}`
                );
                return;
            }

            const clientInfo = {
                ipAddress: req.ip ?? req.socket?.remoteAddress,
                userAgent: req.headers["user-agent"],
            };
            try {
                await this.authenticationService.generateRefreshToken({
                    userId: authUser.id,
                    token: session.refresh_token,
                    ipAddress: clientInfo.ipAddress,
                    userAgent: clientInfo.userAgent,
                });
            } catch (err) {
                logger.warn({
                    msg: "Failed to store refresh token (oauth)",
                    userId: authUser.id,
                    error: (err as Error).message,
                });
            }

            // Google (and other OAuth) accounts have email_confirmed_at in auth; public.users defaulted to false from the old trigger.
            const { updateError: oauthVerifyErr } = await this.userRepository.updateEmailVerification(authUser.id, true);
            if (oauthVerifyErr) {
                logger.warn({
                    msg: "Failed to mark OAuth user email verified in public.users",
                    userId: authUser.id,
                    error: oauthVerifyErr,
                });
            }

            this.setRefreshTokenCookie(res, session.refresh_token);

            // Clear oauthNext so it doesn't affect future logins.
            res.clearCookie("oauthNext", { path: "/" });

            res.redirect(`${frontendUrl}${safeNext}`);
        } catch (error) {
            const frontendUrl = serverConfig.frontendDomainUrl ?? "";
            const message =
                error instanceof AuthError
                    ? (error as Error).message
                    : error instanceof Error
                      ? error.message
                      : "Google sign-in failed. Please try again.";
            res.redirect(`${frontendUrl}/auth-error?message=${encodeURIComponent(message)}`);
        }
    };

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

            // Ensure public.users exists before refresh_tokens (FK); covers envs where the auth trigger is not installed.
            if (newUser?.id && email) {
                const { error: upsertError } = await this.userRepository.upsertUserFromAuth({
                    id: newUser.id,
                    authId: newUser.id,
                    email,
                    fullName: fullName ?? email,
                });
                if (upsertError) {
                    logger.warn({ msg: "upsertUserFromAuth failed", userId: newUser.id, error: upsertError });
                }
            }

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

            // Create default organization for new user (createOrgAndUser-style); keep multi-org create/update/delete in settings
            if (newUser?.id) {
                const defaultOrg = await this.organizationService.createDefaultOrganizationForNewUser(newUser.id, {
                    name: fullName ?? "My Organization",
                });
                if (!defaultOrg) {
                    logger.warn({ msg: "Default organization creation failed at signup", userId: newUser.id });
                }
            }

            if (newUser?.id) {
                // Always generate + persist verification token so API endpoints (`verify-signup`, `check-signup-verification`,
                // `request-verify-signup`) work consistently in all environments (including tests).
                // Only sending the email depends on EMAIL_ENABLED.
                const token = this.emailService.generateVerificationToken();
                const hashedToken = this.emailService.hashToken(token);
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);
                try {
                    const { updateError, rowsAffected } = await this.userRepository.updateVerificationToken(
                        newUser.id,
                        hashedToken,
                        expiresAt
                    );
                    if (updateError) {
                        logger.warn({ msg: "Failed to store verification token", userId: newUser.id, email, error: updateError });
                    } else if (rowsAffected === 0) {
                        logger.warn({ msg: "Verification token update matched 0 rows", userId: newUser.id, email });
                    }
                    if (!updateError && rowsAffected > 0 && this.emailService.isEnabled) {
                        try {
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
                        } catch (sendErr) {
                            logger.warn({
                                msg: "Failed to send verification email after signup",
                                email,
                                error: sendErr instanceof Error ? sendErr.message : String(sendErr),
                            });
                        }
                    }
                } catch (persistErr) {
                    logger.warn({
                        msg: "Failed to persist verification token after signup",
                        email,
                        error: persistErr instanceof Error ? persistErr.message : String(persistErr),
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
            const isUsingCookie = Boolean(session?.refresh_token && (req.cookies?.refreshToken !== undefined || serverConfig.nodeEnv === "production"));
            res.status(201).json({
                success: true,
                data: {
                    user: userDto,
                    session: session
                        ? {
                              accessToken: session.access_token,
                              // If we set httpOnly cookie, don't also leak refresh token to JS.
                              refreshToken: isUsingCookie ? undefined : session.refresh_token,
                          }
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
            const isUsingCookie = serverConfig.nodeEnv === "production";
            res.status(200).json({
                success: true,
                data: {
                    user: userDto,
                    accessToken: session.access_token,
                    // If we set httpOnly cookie, don't also leak refresh token to JS.
                    refreshToken: isUsingCookie ? undefined : refreshToken,
                },
                message: "Sign in successful",
            });
        } catch (error) {
            next(error);
        }
    };

    public signOut = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.cookies?.refreshToken) {
                this.assertCookieAuthOriginAllowed(req);
            }
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
            const cookieRefreshToken = req.cookies?.refreshToken;
            // In production we rely on the httpOnly refresh cookie; dev/test may send it in the body.
            const refreshToken = cookieRefreshToken ?? req.body?.refreshToken;

            // If we're relying on cookie auth, enforce Origin allowlist.
            if (cookieRefreshToken) {
                this.assertCookieAuthOriginAllowed(req);
            }

            if (!refreshToken) throw new TokenError("Missing refresh token");

            const clientInfo = {
                ipAddress: req.ip ?? req.socket?.remoteAddress,
                userAgent: req.headers["user-agent"],
            };
            const data = await this.authenticationService.refreshToken(refreshToken, clientInfo);

            // Refresh tokens rotate (single-use). Always update our httpOnly refreshToken cookie after a successful refresh in production.
            if (serverConfig.nodeEnv === "production" || cookieRefreshToken) {
                this.setRefreshTokenCookie(res, data.session.refresh_token);
            }

            logger.info({ msg: "Token refreshed successfully" });
            res.status(200).json({
                success: true,
                data: {
                    accessToken: data.session.access_token,
                    refreshToken: cookieRefreshToken ? undefined : data.session.refresh_token,
                    expiresIn: 3600,
                    tokenType: "Bearer",
                },
                message: "Token refreshed successfully",
            });
        } catch (error) {
            // Clear custom refresh cookie on any refresh failure to avoid being stuck with a spent/invalid token.
            if (req.cookies?.refreshToken) res.clearCookie("refreshToken");

            // Normalize Supabase refresh token failures to 401 (Supabase sometimes reports them as 400).
            const message =
                error instanceof Error ? error.message : typeof error === "string" ? error : "";
            if (message.includes("Invalid Refresh Token") || message.includes("Refresh Token Not Found")) {
                res.status(401).json({
                    success: false,
                    message: "Session expired or invalid. Please sign in again.",
                    error: { type: "Unauthorized", message },
                });
                return;
            }
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
            if (user.auth_id) {
                await this.userService.invalidateCachesAfterEmailVerification(user.auth_id, user.email);
            }
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
}
