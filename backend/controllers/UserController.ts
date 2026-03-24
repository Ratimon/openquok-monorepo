import type { Request, Response, NextFunction } from "express";
import type { AuthenticationService } from "../services/AuthenticationService";
import type { UserService } from "../services/UserService";
import type { EmailService } from "../services/EmailService";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type {
    ValidateUpdateProfileRequestHandler,
    ValidateUpdatePasswordMeRequestHandler
} from "../data/schemas/userSchemas";
import { UserNotFoundError, UserAuthorizationError } from "../errors/UserError";
import { ValidationError, InfraError } from "../errors/InfraError";
import { logger } from "../utils/Logger";
import { ChangePasswordEmailTemplate } from "../emails/ChangePasswordEmailTemplate";
import { config } from "../config/GlobalConfig";
import { toUserDTO } from "../utils/dtos/UserDTO";

const serverConfig = config.server as { frontendDomainUrl?: string };

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authenticationService: AuthenticationService,
        private readonly emailService: EmailService
    ) {}

    /**
     * GET /users/me - return the authenticated user's profile.
     */
    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }

            const profile = await this.userService.getProfile(authUserId);
            if (!profile) {
                return next(new UserNotFoundError(authUserId));
            }

            const dto = toUserDTO(profile);
            res.status(200).json({
                success: true,
                data: {
                    ...dto,
                    roles: authReq.user?.roles ?? [],
                    isSuperAdmin: authReq.user?.isSuperAdmin ?? false,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /users/me - update the authenticated user's profile (e.g. fullName).
     */
    updateProfile: ValidateUpdateProfileRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }

            const { fullName, avatarUrl, websiteUrl } = req.body as {
                fullName?: string;
                avatarUrl?: string | null;
                websiteUrl?: string | null | "";
            };
            await this.userService.updateProfile(authUserId, { fullName, avatarUrl, websiteUrl });

            logger.info({ msg: "Profile updated successfully", userId: authUserId });
            res.status(200).json({ success: true, message: "Profile updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /users/me/password - update password for the authenticated user (no userId in URL).
     */
    updatePasswordMe: ValidateUpdatePasswordMeRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            const { password } = req.body as { password?: string };

            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }

            const { error } = await this.authenticationService.updatePassword(password ?? "", {
                req: authReq,
                res,
            });
            if (error) {
                if (error.code === "same_password") {
                    return next(new ValidationError("You cannot use the same password as before."));
                }
                return next(
                    new InfraError("Failed to update password", {
                        cause: error as Error,
                        component: "supabase",
                        operation: "updateUser",
                    })
                );
            }

            logger.info({ msg: "Password updated successfully", userId: authUserId });
            res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /users/me/request-change-password - send "change your password" email to the authenticated user.
     * Link in email points to the protected frontend route where they can set a new password.
     */
    requestChangePasswordEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }

            const profile = await this.userService.getProfile(authUserId);
            if (!profile?.email) {
                return next(new UserNotFoundError(authUserId));
            }

            const frontendUrl = serverConfig.frontendDomainUrl ?? "";
            const { token, error: genError } = await this.authenticationService.generateRecoveryLink(
                profile.email,
                { redirectTo: `${frontendUrl}/account/settings/password` }
            );

            if (genError || !token) {
                logger.warn({
                    msg: "Change password: failed to generate recovery link",
                    userId: authUserId,
                    error: genError?.message,
                });
                return next(
                    new InfraError("Failed to generate secure link. Please try again later.", {
                        cause: genError as Error,
                        component: "auth",
                        operation: "generateRecoveryLink",
                    })
                );
            }

            if (this.emailService.isEnabled) {
                try {
                    await this.emailService.send(
                        new ChangePasswordEmailTemplate(frontendUrl, token, profile.email),
                        profile.email
                    );
                    logger.info({ msg: "Change password email sent", userId: authUserId, email: profile.email });
                } catch (emailErr) {
                    logger.warn({
                        msg: "Failed to send change password email",
                        userId: authUserId,
                        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
                    });
                    return next(
                        new InfraError("Failed to send email. Please try again later.", {
                            cause: emailErr as Error,
                            component: "email",
                            operation: "send",
                        })
                    );
                }
            }

            res.status(200).json({
                success: true,
                message: "If an account exists for this email, you will receive a link to change your password.",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /admin/users - full users with roles (super-admin only).
     */
    getFullUsersWithRoles = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getFullUsersWithRoles();
            res.status(200).json({
                success: true,
                data: { users },
                message: "Full users with roles retrieved successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}
