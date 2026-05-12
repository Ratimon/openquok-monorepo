import { Router } from "express";
import { publicAnalyticsRouter } from "./AnalyticsRoutes.js";
import { publicIntegrationRouter } from "./IntegrationRoutes.js";
import { publicMediaUploadRouter } from "./MediaUploadRoutes.js";
import { publicNotificationRouter } from "./NotificationRoutes.js";
import { publicPostRouter } from "./PostRoutes.js";

/**
 * `{api.prefix}/public` composite router.
 * - **`IntegrationRoutes`** — org API key (programmatic integrations); not the same as session `routes/integrationApi/*`.
 * - **`MediaUploadRoutes`** — org API key uploads (`POST /upload`, `POST /upload-from-url`).
 * - **`PostRoutes`** — anonymous and org API key post endpoints (mounted at `/posts`).
 * - **`AnalyticsRoutes`** — org API key platform and per-post analytics (mounted at `/analytics`).
 * - **`NotificationRoutes`** — org API key paginated in-app notifications.
 */
type PublicApiRouter = ReturnType<typeof Router>;

const publicApiRouter: PublicApiRouter = Router();

publicApiRouter.use("/", publicIntegrationRouter);
publicApiRouter.use("/", publicMediaUploadRouter);
publicApiRouter.use("/", publicNotificationRouter);
publicApiRouter.use("/posts", publicPostRouter);
publicApiRouter.use("/analytics", publicAnalyticsRouter);

export { publicApiRouter };
