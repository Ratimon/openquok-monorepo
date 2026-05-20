import { Router, type Router as ExpressRouter } from "express";
import { billingController, stripeWebhookController } from "../controllers/index";
import { requireFullAuthWithRoles } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import {
    validateBillingOrganizationQuery,
    validateBillingSubscribeBody,
} from "../data/schemas/billingSchemas";

const authWithRoles = requireFullAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);

const billingRouter: ExpressRouter = Router();

billingRouter.get("/plans", billingController.getPlans);
billingRouter.get("/current", authWithRoles, validateBillingOrganizationQuery, billingController.getCurrent);
billingRouter.post(
    "/subscribe",
    authWithRoles,
    validateBillingSubscribeBody,
    billingController.subscribe
);
billingRouter.get("/portal", authWithRoles, validateBillingOrganizationQuery, billingController.portal);
billingRouter.get(
    "/check/:id",
    authWithRoles,
    validateBillingOrganizationQuery,
    billingController.checkCheckout
);

export { billingRouter };

/** Stripe webhook — mounted separately in app.ts with raw body parser. */
export const stripeWebhookRouter: ExpressRouter = Router();
stripeWebhookRouter.post("/stripe", stripeWebhookController.handle);
