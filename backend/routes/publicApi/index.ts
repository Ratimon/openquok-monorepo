import { Router } from "express";
import { publicIntegrationRouter } from "./integrationRoutes.js";
import { publicPostRouter } from "./PostRoutes.js";

/**
 * `{api.prefix}/public` composite router.
 * - **`integrationRoutes`** — org API key (programmatic integrations); not the same as session `routes/integrationRoutes.ts`.
 * - **`PostRoutes`** — anonymous post-adjacent handlers (e.g. comments).
 */
type PublicApiRouter = ReturnType<typeof Router>;

const publicApiRouter: PublicApiRouter = Router();

publicApiRouter.use("/", publicIntegrationRouter);
publicApiRouter.use("/posts", publicPostRouter);

export { publicApiRouter };
