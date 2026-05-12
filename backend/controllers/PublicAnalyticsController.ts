import type { NextFunction, Request, Response } from "express";
import type { ProgrammaticAuthRequest } from "../middlewares/programmaticAuth";
import type { AnalyticsService } from "../services/AnalyticsService";
import type { PostsService } from "../services/PostsService";

import { countPublicApiRequest } from "../connections/index";

/**
 * Programmatic analytics API: organization resolved from API key
 * (`{api.prefix}/public/analytics/*`). Session-scoped handlers live on
 * {@link AnalyticsController} under `/api/v1/analytics/*`.
 */
export class PublicAnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly postsService: PostsService
    ) {}

    /** GET /public/analytics/:integrationId?date=7|30|90 — platform-wide insights for a channel. */
    getIntegrationAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("analytics-integration");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const integrationId = (req.params as { integrationId: string }).integrationId;
            const date = Number((req.query as { date: string }).date);
            const data = await this.analyticsService.getIntegrationAnalyticsProgrammatic({
                organizationId,
                integrationId,
                date,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/analytics/post/:postId?date=7|30|90 — provider-native insights for one published post row. */
    getPostAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("analytics-post");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const postId = (req.params as { postId: string }).postId;
            const date = Number((req.query as { date: string }).date);
            const data = await this.postsService.checkPostAnalyticsProgrammatic({
                organizationId,
                postId,
                dateWindowDays: date,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
