import { Router } from "express";

import { publicAnalyticsController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireProgrammaticAuth } from "../../middlewares/programmaticAuth";
import { oauthAppService } from "../../services/index";
import {
    validatePublicIntegrationAnalyticsRequest,
    validatePublicPostAnalyticsRequest,
} from "../../data/schemas/publicAnalyticsSchemas";

type PublicAnalyticsRouter = ReturnType<typeof Router>;

/**
 * Programmatic analytics API under `/public/analytics/*`.
 * Same auth as other `/public/*` routes (`requireProgrammaticAuth`).
 *
 * NOTE: order matters — `/post/:postId` is registered **before** `/:integrationId`
 * so the static `post` segment is not captured as an integration id.
 */
const publicAnalyticsRouter: PublicAnalyticsRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository });

publicAnalyticsRouter.get(
    "/post/:postId",
    apiKeyAuth,
    validatePublicPostAnalyticsRequest,
    publicAnalyticsController.getPostAnalytics
);
publicAnalyticsRouter.get(
    "/:integrationId",
    apiKeyAuth,
    validatePublicIntegrationAnalyticsRequest,
    publicAnalyticsController.getIntegrationAnalytics
);

export { publicAnalyticsRouter };
