import { Router, type Router as ExpressRouter } from "express";
import { billingController, stripeWebhookController } from "../controllers/index";
import {
    requireFullAuthWithRoles,
    requirePlatformAdmin,
} from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import {
    validateBillingOrganizationQuery,
    validateBillingSubscribeBody,
    validateBillingPlanChangeBody,
    validateBillingCancelBody,
    validateBillingAdminAddSubscriptionBody,
    validateBillingRefundChargesBody,
} from "../data/schemas/billingSchemas";

const authWithRoles = requireFullAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);

const billingRouter: ExpressRouter = Router();

billingRouter.get("/plans", billingController.getPlans);
/** Tier and workspace cap for organizations the user owns (ignores active workspace / invites). */
billingRouter.get("/account-owned", authWithRoles, billingController.getOwnedAccount);
/** Active workspace from `showorg` cookie or `organizationId` query (aligned with legacy GET /billing). */
billingRouter.get("/", authWithRoles, validateBillingOrganizationQuery, billingController.getCurrent);
billingRouter.get("/subscription", authWithRoles, validateBillingOrganizationQuery, billingController.getCurrent);
billingRouter.get("/current", authWithRoles, validateBillingOrganizationQuery, billingController.getCurrent);
billingRouter.post(
    "/subscribe",
    authWithRoles,
    validateBillingSubscribeBody,
    billingController.subscribe
);
billingRouter.post(
    "/embedded",
    authWithRoles,
    validateBillingSubscribeBody,
    billingController.embedded
);
billingRouter.get("/portal", authWithRoles, validateBillingOrganizationQuery, billingController.portal);
billingRouter.get(
    "/check/:id",
    authWithRoles,
    validateBillingOrganizationQuery,
    billingController.checkCheckout
);
billingRouter.get(
    "/check-discount",
    authWithRoles,
    validateBillingOrganizationQuery,
    billingController.checkDiscount
);
billingRouter.post(
    "/apply-discount",
    authWithRoles,
    validateBillingOrganizationQuery,
    billingController.applyDiscount
);
billingRouter.post(
    "/finish-trial",
    authWithRoles,
    validateBillingOrganizationQuery,
    billingController.finishTrial
);
billingRouter.get(
    "/is-trial-finished",
    authWithRoles,
    validateBillingOrganizationQuery,
    billingController.isTrialFinished
);
billingRouter.post(
    "/prorate",
    authWithRoles,
    validateBillingPlanChangeBody,
    billingController.prorate
);
billingRouter.post(
    "/cancel",
    authWithRoles,
    validateBillingCancelBody,
    billingController.cancel
);

billingRouter.get(
    "/charges",
    authWithRoles,
    requirePlatformAdmin,
    validateBillingOrganizationQuery,
    billingController.getCharges
);
billingRouter.post(
    "/refund-charges",
    authWithRoles,
    requirePlatformAdmin,
    validateBillingRefundChargesBody,
    billingController.refundCharges
);
billingRouter.post(
    "/cancel-subscription",
    authWithRoles,
    requirePlatformAdmin,
    validateBillingOrganizationQuery,
    billingController.cancelSubscriptionAdmin
);
billingRouter.post(
    "/add-subscription",
    authWithRoles,
    requirePlatformAdmin,
    validateBillingAdminAddSubscriptionBody,
    billingController.addSubscriptionAdmin
);

export { billingRouter };

/** Stripe webhook — mounted separately in app.ts with raw body parser. */
export const stripeWebhookRouter: ExpressRouter = Router();
stripeWebhookRouter.post("/stripe", stripeWebhookController.handle);
