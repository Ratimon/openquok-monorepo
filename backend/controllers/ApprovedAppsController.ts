import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../guards";
import type { OauthService } from "../services/OauthService";
import { UserAuthorizationError } from "../errors/UserError";

/**
 * User-scoped OAuth client authorizations (apps the user has approved for their workspace).
 * Aligns with listing + revoking connected third-party apps for the current account.
 */
export class ApprovedAppsController {
    constructor(private readonly oauthService: OauthService) {}

    /** GET /users/me/approved-apps (requires user JWT) */
    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const data = await this.oauthService.getApprovedApps(authUserId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /users/me/approved-apps/:id (requires user JWT) */
    revoke = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const out = await this.oauthService.revokeApp(authUserId, id);
            res.status(200).json(out);
        } catch (error) {
            next(error);
        }
    };
}
