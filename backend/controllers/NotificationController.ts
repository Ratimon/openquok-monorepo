import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type {
    ParsedNotificationOrganizationQuery,
    ParsedNotificationPaginatedQuery,
} from "../middlewares/queryParsers";
import { UserAuthorizationError } from "../errors/UserError";
import type { NotificationService } from "../services/NotificationService";

export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    /**
     * GET /notifications — unread-style count since last_read_notifications.
     * Expects `parsedQuery` from `createNotificationOrganizationQueryParser` after Zod query validation.
     */
    mainPageCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                next(new UserAuthorizationError("Not authenticated"));
                return;
            }
            const opts =
                (req as Request & { parsedQuery?: Partial<ParsedNotificationOrganizationQuery> }).parsedQuery ??
                {};
            const data = await this.notificationService.getMainPageCount(
                authUserId,
                opts.organizationId as string
            );
            res.status(200).json({ success: true, data, message: "Notification count loaded" });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /notifications/list — recent items and advance read cursor.
     * Expects `parsedQuery` from `createNotificationOrganizationQueryParser` after Zod query validation.
     */
    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                next(new UserAuthorizationError("Not authenticated"));
                return;
            }
            const opts =
                (req as Request & { parsedQuery?: Partial<ParsedNotificationOrganizationQuery> }).parsedQuery ??
                {};
            const data = await this.notificationService.getNotificationList(
                authUserId,
                opts.organizationId as string
            );
            res.status(200).json({ success: true, data, message: "Notifications loaded" });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /notifications/paginated — larger history (does not change read cursor).
     * Expects `parsedQuery` from `createNotificationPaginatedQueryParser` after Zod query validation.
     */
    paginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                next(new UserAuthorizationError("Not authenticated"));
                return;
            }
            const opts =
                (req as Request & { parsedQuery?: Partial<ParsedNotificationPaginatedQuery> }).parsedQuery ?? {};
            const data = await this.notificationService.getNotificationsPaginated(
                authUserId,
                opts.organizationId as string,
                opts.page ?? 0
            );
            res.status(200).json({ success: true, data, message: "Notifications page loaded" });
        } catch (error) {
            next(error);
        }
    };
}
