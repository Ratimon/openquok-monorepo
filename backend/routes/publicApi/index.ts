import { Router } from "express";
import { publicIntegrationRouter } from "./IntegrationRoutes.js";
import { publicMediaUploadRouter } from "./MediaUploadRoutes.js";
import { publicPostRouter } from "./PostRoutes.js";

/**
 * `{api.prefix}/public` composite router.
 * - **`IntegrationRoutes`** — org API key (programmatic integrations); not the same as session `routes/integrationApi/*`.
 * - **`MediaUploadRoutes`** — org API key multipart upload (`POST /upload`).
 * - **`PostRoutes`** — anonymous and org API key post endpoints.
 */
type PublicApiRouter = ReturnType<typeof Router>;

const publicApiRouter: PublicApiRouter = Router();

publicApiRouter.use("/", publicIntegrationRouter);
publicApiRouter.use("/", publicMediaUploadRouter);
publicApiRouter.use("/posts", publicPostRouter);

export { publicApiRouter };
