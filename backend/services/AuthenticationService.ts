import type { Request, Response } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { UserRow } from "../repositories/UserRepository";
import type { UserService } from "./UserService";

import { createSupabaseRLSClient } from "../connections/supabase";
import {
    AuthError,
    AuthValidationError,
    InvalidCredentialsError,
    MissingUserIdError,
    NotVerifiedUserError,
    AuthNotFoundError,
    UserConflictError,
} from "../errors/AuthError";

import { UserAuthorizationError } from "../errors/UserError";
import { UserNotFoundError } from "../errors/UserError";
import { ValidationError, DatabaseEntityNotFoundError } from "../errors/InfraError";
import { normalizeEmail } from "../utils/helper";
import { logger } from "../utils/Logger";

export type AuthenticatedRequest = Request & { user?: { id: string } };

export class AuthenticationService {
    constructor(
        private readonly supabaseServiceClient: SupabaseClient,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService
    ) {}

    createRLSClient = (context: { req: Request; res: Response }) =>
        createSupabaseRLSClient(context);

    async signIn(
        email: string,
        password: string,
        context: { req: Request; res: Response }
    ): Promise<{
        signedInUser: { id: string; email?: string; user_metadata?: Record<string, unknown> };
        userDBdata: UserRow | null;
        session: { access_token: string; refresh_token: string };
    }> {
        const normalizedEmail = normalizeEmail(email);
        const supabaseRLSClient = this.createRLSClient(context);

        const { data: signedInUser, error } = await supabaseRLSClient.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });

        if (error) {
            throw new InvalidCredentialsError("Invalid credentials");
        }

        const { userData: dbUser } = await this.userRepository.findFullUserByEmail(normalizedEmail);
        if (!dbUser) {
            logger.error({ msg: "Authenticated user not found in DB", email: normalizedEmail });
            throw new UserNotFoundError(normalizedEmail);
        }

        const isEmailVerified = dbUser.is_email_verified !== false;
        if (!isEmailVerified) {
            throw new NotVerifiedUserError("User is not verified");
        }

        return {
            signedInUser: signedInUser.user as { id: string; email?: string; user_metadata?: Record<string, unknown> },
            userDBdata: dbUser,
            session: signedInUser.session as { access_token: string; refresh_token: string },
        };
    }

    async signUp(
        email: string,
        password: string,
        fullName: string,
        context: { req: Request; res: Response }
    ): Promise<{
        newUser: { id: string; email?: string } | null;
        session: { access_token?: string; refresh_token?: string } | null;
    }> {
        const normalizedEmail = normalizeEmail(email);
        const supabaseRLSClient = this.createRLSClient(context);

        const allowSignups = await this.userService.isUserSignUpAllowed();
        if (!allowSignups || allowSignups !== "true") {
            throw new UserAuthorizationError("User signups are not allowed");
        }

        const { data, error } = await supabaseRLSClient.auth.signUp({
            email: normalizedEmail,
            password,
            options: { data: { full_name: fullName || "User" } },
        });

        if (error) {
            const msg = error.message?.toLowerCase() ?? "";
            if (msg.includes("already registered") || msg.includes("user already exists") || msg.includes("already been registered")) {
                throw new UserConflictError("This email is already registered. Please sign in.");
            }
            throw new InvalidCredentialsError("Invalid credentials");
        }

        return {
            newUser: data.user as { id: string; email?: string } | null,
            session: data.session,
        };
    }

    async signOut(context: { req: Request; res: Response }): Promise<void> {
        const supabaseRLSClient = this.createRLSClient(context);
        await supabaseRLSClient.auth.signOut();
    }

    async refreshToken(
        refreshToken: string,
        options: { ipAddress?: string | null; userAgent?: string | null } = {}
    ): Promise<{ session: { access_token: string; refresh_token: string }; user?: { id: string } }> {
        logger.debug({ msg: "Refreshing access token" });

        if (!refreshToken) {
            throw new AuthValidationError("Refresh token is required");
        }

        await this.refreshTokenRepository.validateToken(refreshToken);

        const { data, error } = await this.supabaseServiceClient.auth.refreshSession({
            refresh_token: refreshToken,
        });

        // refreshSession() caches the user session in memory on the client,
        // which would cause all subsequent queries to run as "authenticated"
        // instead of "service_role". Clear it immediately.
        await this.supabaseServiceClient.auth.signOut({ scope: "local" });

        if (error) {
            logger.error({ msg: "Refresh token rejected by Supabase", errorMessage: error.message });
            await this.refreshTokenRepository.revokeToken(refreshToken);
            throw new AuthError(`Failed to refresh session: ${error.message}`, error.status ?? 401, { cause: error as Error });
        }

        const newToken = data.session?.refresh_token;
        if (newToken && data.user?.id) {
            await this.rotateRefreshToken(refreshToken, newToken, {
                userId: data.user.id,
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
            });
        }

        return {
            session: data.session as { access_token: string; refresh_token: string },
            user: data.user ? { id: data.user.id } : undefined,
        };
    }

    async generateRefreshToken({
        userId,
        token = null,
        expiresIn = 7 * 24 * 60 * 60,
        ipAddress = null,
        userAgent = null,
    }: {
        userId: string;
        token?: string | null;
        expiresIn?: number;
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        if (!userId) throw new MissingUserIdError("Missing user ID");
        return this.refreshTokenRepository.createToken({
            userId,
            token,
            expiresIn,
            ipAddress,
            userAgent,
        });
    }

    async validateRefreshToken(token: string) {
        if (!token) throw new AuthValidationError("Refresh token is required for validation");
        try {
            return await this.refreshTokenRepository.validateToken(token);
        } catch (err) {
            if (err instanceof ValidationError) {
                throw new AuthValidationError(`Invalid refresh token: ${err.message}`, { cause: err });
            }
            if (err instanceof DatabaseEntityNotFoundError) {
                throw new AuthNotFoundError("Refresh token", { cause: err });
            }
            throw new AuthError(`Error validating refresh token: ${(err as Error).message}`, 401, { cause: err as Error });
        }
    }

    async revokeRefreshToken(token: string) {
        if (!token) throw new AuthValidationError("Refresh token is required for revocation");
        try {
            return await this.refreshTokenRepository.revokeToken(token);
        } catch (err) {
            if (err instanceof DatabaseEntityNotFoundError) {
                logger.warn({ msg: "Attempted to revoke non-existent token" });
                return { revoked: true };
            }
            throw new AuthError(`Failed to revoke refresh token: ${(err as Error).message}`, 500, { cause: err as Error });
        }
    }

    async rotateRefreshToken(
        oldToken: string,
        newToken: string,
        options: { userId: string | undefined; ipAddress?: string | null; userAgent?: string | null }
    ) {
        if (!oldToken || !newToken || !options.userId) {
            throw new AuthValidationError("Old token, new token, and user ID are required for token rotation");
        }
        try {
            await this.refreshTokenRepository.revokeToken(oldToken, newToken);
            return await this.refreshTokenRepository.createToken({
                userId: options.userId,
                token: newToken,
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
            });
        } catch (err) {
            logger.error({ msg: "Failed to rotate refresh token", error: (err as Error).message });
            throw new AuthError(`Failed to rotate refresh token: ${(err as Error).message}`, 401, { cause: err as Error });
        }
    }
    

    /**
     * Generate a recovery link/OTP for password reset without sending Supabase's built-in email.
     * Use the returned token in your own email template; the same token is used with verifyOtp(email, token, 'recovery').
     */
    async generateRecoveryLink(
        email: string,
        options: { redirectTo?: string } = {}
    ): Promise<{ token: string; error: { message: string; code?: string } | null }> {
        const normalizedEmail = normalizeEmail(email);
        const { data, error } = await this.supabaseServiceClient.auth.admin.generateLink({
            type: "recovery",
            email: normalizedEmail,
            options: { redirectTo: options.redirectTo },
        });

        if (error) {
            return { token: "", error: { message: error.message, code: error.code ?? undefined } };
        }

        // Supabase generateLink returns different shapes; token may be in properties (email_otp or token)
        const props = (data as { properties?: { token?: string; email_otp?: string } })?.properties;
        const token = props?.email_otp ?? props?.token ?? (data as { token?: string })?.token ?? "";
        return { token, error: null };
    }


    async verifyOtp(
        email: string,
        code: string,
        type: "recovery" | "signup"
    ): Promise<{ signedInUser: { id: string; email?: string }; session: { access_token: string; refresh_token: string } }> {
        const normalizedEmail = normalizeEmail(email);
        const { data, error } = await this.supabaseServiceClient.auth.verifyOtp({
            email: normalizedEmail,
            token: code,
            type,
        });

        if (error || !data.session) {
            throw new AuthError(`Failed to verify OTP: ${error?.message ?? "Unknown"}`, 401, { cause: error as Error });
        }

        return {
            signedInUser: data.user as { id: string; email?: string },
            session: data.session as { access_token: string; refresh_token: string },
        };
    }

    async updatePassword(password: string, context: { req: Request; res: Response }): Promise<{ error: { message: string; code?: string } | null }> {
        const req = context.req as AuthenticatedRequest;
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthError("User ID not found in authenticated request", 401);
        }
        const { error } = await this.supabaseServiceClient.auth.admin.updateUserById(userId, {
            password,
        });
        return { error };
    }
}
