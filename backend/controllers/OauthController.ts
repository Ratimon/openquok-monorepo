import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { OauthService } from "../services/OauthService";
import { UserAuthorizationError } from "../errors/UserError";

export class OauthController {
    constructor(private readonly oauthService: OauthService) {}

    /**
     * OAuth2 authorize (public): validate client_id and return app metadata.
     */
    authorize = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const q = req.query as {
                client_id: string;
                state?: string;
            };
            const app = await this.oauthService.validateAuthorizationRequest(q.client_id);
            res.status(200).json({
                app: {
                    name: app.name,
                    description: app.description,
                    pictureId: app.picture_id,
                    clientId: app.client_id,
                    redirectUrl: app.redirect_url,
                },
                state: q.state,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * OAuth2 approve/deny (requires user JWT).
     */
    approve = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));

            const b = req.body as {
                client_id: string;
                organizationId: string;
                state?: string;
                action: "approve" | "deny";
            };
            const out = await this.oauthService.approveOrDeny({
                authUserId,
                clientId: b.client_id,
                organizationId: b.organizationId,
                state: b.state,
                action: b.action,
            });
            res.status(200).json(out);
        } catch (error) {
            next(error);
        }
    };

    /**
     * OAuth2 token endpoint (public).
     */
    token = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const b = req.body as { grant_type: string; client_id: string; client_secret: string; code: string };
            if (b.grant_type !== "authorization_code") {
                return res.status(400).json({ error: "unsupported_grant_type" });
            }
            const out = await this.oauthService.exchangeCodeForToken({
                code: b.code,
                clientId: b.client_id,
                clientSecret: b.client_secret,
            });
            res.status(200).json(out);
        } catch (error) {
            next(error);
        }
    };

    // to do : move to Approved-apps controller
    /** GET /oauth/approved-apps (requires user JWT) */
    approvedApps = async (req: Request, res: Response, next: NextFunction) => {
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

    /** POST /oauth/revoke (requires user JWT) */
    revoke = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const b = req.body as { authorizationId: string };
            const out = await this.oauthService.revokeApp(authUserId, b.authorizationId);
            res.status(200).json(out);
        } catch (error) {
            next(error);
        }
    };
}

