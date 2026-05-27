import type { NextFunction, Request, Response } from "express";
import type { ProgrammaticAuthRequest } from "../guards";
import type { NotificationService } from "../services/NotificationService";

import { countPublicApiRequest } from "../connections/index";

/**
 * Programmatic notifications API: organization resolved from API key
 * (`{api.prefix}/public/notifications`). Session-scoped handlers live on
 * {@link NotificationController} under `/api/v1/notifications/*`.
 */
export class PublicNotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    /** GET /public/notifications?page=N — paginated in-app history (does not advance the read cursor). */
    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("notifications-list");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const rawPage = (req.query as { page?: string }).page;
            const page = Number.isFinite(Number(rawPage)) ? Math.max(0, Math.trunc(Number(rawPage))) : 0;
            const data = await this.notificationService.getNotificationsPaginatedProgrammatic(organizationId, page);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
