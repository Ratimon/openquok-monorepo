import { Router } from "express";
import { analyticsController } from "../controllers/index";
import { requireFullAuth } from "../guards";
import { supabaseAnonClient } from "../connections/index";
import { validateIntegrationAnalyticsRequest, validatePostAnalyticsRequest } from "../data/schemas/analyticsSchemas";

type AnalyticsRouter = ReturnType<typeof Router>;

const analyticsRouter: AnalyticsRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

analyticsRouter.use(auth);
analyticsRouter.get("/post/:postId", validatePostAnalyticsRequest, analyticsController.getPostAnalytics);
analyticsRouter.get("/:integrationId", validateIntegrationAnalyticsRequest, analyticsController.getIntegrationAnalytics);

export { analyticsRouter };

