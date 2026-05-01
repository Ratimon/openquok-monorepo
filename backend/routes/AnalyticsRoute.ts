import { Router } from "express";
import { analyticsController } from "../controllers/index";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { validateIntegrationAnalyticsRequest } from "../data/schemas/analyticsSchemas";

type AnalyticsRouter = ReturnType<typeof Router>;

const analyticsRouter: AnalyticsRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

analyticsRouter.use(auth);
analyticsRouter.get("/:integrationId", validateIntegrationAnalyticsRequest, analyticsController.getIntegrationAnalytics);

export { analyticsRouter };

