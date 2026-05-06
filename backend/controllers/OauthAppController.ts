import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { OauthAppService } from "../services/OauthAppService";
import { UserAuthorizationError } from "../errors/UserError";

export class OauthAppController {
    constructor(private readonly oauthAppService: OauthAppService) {}

    /** GET /oauth-apps?organizationId=... */
    listApps = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const data = await this.oauthAppService.listApps(authUserId, organizationId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /oauth-apps/app?organizationId=... */
    getApp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const organizationId = (req.query as { organizationId: string }).organizationId;
            const data = await this.oauthAppService.getApp(authUserId, organizationId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** POST /oauth-apps */
    createApp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const b = req.body as { organizationId: string; name: string; description?: string; pictureId?: string; redirectUrl: string };
            const created = await this.oauthAppService.createApp(authUserId, {
                organizationId: b.organizationId,
                name: b.name,
                description: b.description ?? null,
                pictureId: b.pictureId ?? null,
                redirectUrl: b.redirectUrl,
            });
            // Return client secret once.
            res.status(201).json({ success: true, data: { ...created.app, clientId: created.clientId, clientSecret: created.clientSecret } });
        } catch (error) {
            next(error);
        }
    };

    /** PUT /oauth-apps */
    updateApp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const b = req.body as {
                organizationId: string;
                oauthAppId: string;
                name?: string;
                description?: string | null;
                pictureId?: string | null;
                redirectUrl?: string;
            };
            const data = await this.oauthAppService.updateApp(authUserId, {
                organizationId: b.organizationId,
                oauthAppId: b.oauthAppId,
                name: b.name,
                description: b.description,
                pictureId: b.pictureId,
                redirectUrl: b.redirectUrl,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /oauth-apps/:oauthAppId?organizationId=... */
    deleteApp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const oauthAppId = (req.params as { oauthAppId: string }).oauthAppId;
            const organizationId = (req.query as { organizationId: string }).organizationId;
            await this.oauthAppService.deleteApp(authUserId, { organizationId, oauthAppId });
            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };

    /** POST /oauth-apps/rotate-secret */
    rotateSecret = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const b = req.body as { organizationId: string; oauthAppId: string };
            const data = await this.oauthAppService.rotateSecret(authUserId, b);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}

