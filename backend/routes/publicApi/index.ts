import { Router } from "express";
import { publicAnalyticsRouter } from "./AnalyticsRoutes.js";
import { publicIntegrationRouter } from "./IntegrationRoutes.js";
import { publicMediaUploadRouter } from "./MediaUploadRoutes.js";
import { publicNotificationRouter } from "./NotificationRoutes.js";
import { publicPostRouter } from "./PostRoutes.js";
import { publicDirectoryLaunchRouter } from "./DirectoryLaunchRoutes.js";
import { publicDirectorySeoRouter } from "./DirectorySeoRoutes.js";

/**
 * `{api.prefix}/public` composite router.
 * - **`IntegrationRoutes`** — org API key (programmatic integrations); not the same as session `routes/integrationApi/*`.
 * - **`MediaUploadRoutes`** — org API key uploads (`POST /upload`, multipart helpers, `POST /upload-from-url`).
 * - **`PostRoutes`** — anonymous and org API key post endpoints (mounted at `/posts`).
 * - **`AnalyticsRoutes`** — org API key platform and per-post analytics (mounted at `/analytics`).
 * - **`NotificationRoutes`** — org API key paginated in-app notifications.
 * - **`DirectoryLaunchRoutes`** — org API key directory launch profiles and listing summary.
 * - **`DirectorySeoRoutes`** — org API key directory SEO overview, history, refresh, and competitors.
 */
type PublicApiRouter = ReturnType<typeof Router>;

const publicApiRouter: PublicApiRouter = Router();

publicApiRouter.use("/", publicIntegrationRouter);
publicApiRouter.use("/", publicMediaUploadRouter);
publicApiRouter.use("/", publicNotificationRouter);
publicApiRouter.use("/posts", publicPostRouter);
publicApiRouter.use("/analytics", publicAnalyticsRouter);
publicApiRouter.use("/directory-launch", publicDirectoryLaunchRouter);
publicApiRouter.use("/directory-seo", publicDirectorySeoRouter);

export { publicApiRouter };
