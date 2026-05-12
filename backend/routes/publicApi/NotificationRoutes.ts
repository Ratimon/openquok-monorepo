import { Router } from "express";

import { publicNotificationController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireProgrammaticAuth } from "../../middlewares/programmaticAuth";
import { oauthAppService } from "../../services/index";
import { validatePublicListNotificationsQuery } from "../../data/schemas/publicNotificationsSchemas";

type PublicNotificationRouter = ReturnType<typeof Router>;

/**
 * Programmatic notifications API under `/public/notifications`.
 * Same auth as other `/public/*` routes (`requireProgrammaticAuth`).
 */
const publicNotificationRouter: PublicNotificationRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository });

publicNotificationRouter.get(
    "/notifications",
    apiKeyAuth,
    validatePublicListNotificationsQuery,
    publicNotificationController.list
);

export { publicNotificationRouter };
