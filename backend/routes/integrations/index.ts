import { Router } from "express";
import { integrationNoAuthRouter } from "./noAuthRoutes.js";
import { integrationSessionRouter } from "./sessionRoutes.js";

type IntegrationsRouter = ReturnType<typeof Router>;

/**
 * Session + catalog under `{api.prefix}/integrations` (mounted as `/integrations`):
 * - GET `/` — provider catalog (no JWT; also whitelisted in `core.ts`).
 * - Other routes — JWT; org from query/body.
 *
 * Programmatic org API key routes live under `{api.prefix}/public` — see `routes/publicApi/integrationRoutes.ts`.
 */
const integrationsRouter: IntegrationsRouter = Router();

integrationsRouter.use("/", integrationNoAuthRouter);
integrationsRouter.use("/", integrationSessionRouter);

export { integrationsRouter };
