import { Router } from "express";
import { feedbackController } from "../controllers/index";
import {
    requireFullAuthWithRoles,
    requireSupport,
    optionalAuthWithRoles,
} from "../middlewares/authenticateUser";
import { supabaseServiceClientConnection } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import { validateRequest } from "../middlewares/validateRequest";
import { feedbackSchema } from "../data/schemas/feedbackSchemas";

type FeedbackRouter = ReturnType<typeof Router>;
const feedbackRouter: FeedbackRouter = Router();
const authWithRoles = requireFullAuthWithRoles(
    supabaseServiceClientConnection,
    userRepository,
    rbacRepository
);
const optionalAuth = optionalAuthWithRoles(
    supabaseServiceClientConnection,
    userRepository,
    rbacRepository
);

feedbackRouter.post(
    "/",
    optionalAuth,
    validateRequest({ body: feedbackSchema }),
    feedbackController.createFeedback
);

feedbackRouter.get("/", authWithRoles, requireSupport, feedbackController.getAllFeedbacks);
feedbackRouter.patch("/:feedbackId", authWithRoles, requireSupport, feedbackController.handleFeedback);

export { feedbackRouter };