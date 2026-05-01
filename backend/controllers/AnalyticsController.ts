import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { AnalyticsService } from "../services/AnalyticsService";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";

import { UserAuthorizationError } from "../errors/UserError";

export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly integrationConnectionService: IntegrationConnectionService
    ) {}

    /** GET /analytics/:integrationId?organizationId=&date= */
    getIntegrationAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }

            const integrationId = (req.params as { integrationId: string }).integrationId;
            const q = req.query as { organizationId: string; date: string };
            const date = Number(q.date);

            const data = await this.analyticsService.getIntegrationAnalytics({
                authUserId,
                organizationId: q.organizationId,
                integrationId,
                date,
                assertOrganizationMember: this.integrationConnectionService.assertOrganizationMember.bind(
                    this.integrationConnectionService
                ),
            });

            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}

