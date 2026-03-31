import { Router } from "express";
import { configController, emailController, userController } from "../controllers/index";
import { requireFullAuthWithRoles, requireSuperAdmin } from "../middlewares/authenticateUser";
import { createListReceivedEmailsParser } from "../middlewares/queryParsers";
import { supabaseServiceClientConnection } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import configSchemas from "../data/schemas/configSchemas";
import emailSchemas from "../data/schemas/emailSchemas";

type AdminRouter = ReturnType<typeof Router>;

const adminRouter: AdminRouter = Router();
const parseListReceivedEmailsQuery = createListReceivedEmailsParser();
const authWithRoles = requireFullAuthWithRoles(
    supabaseServiceClientConnection,
    userRepository,
    rbacRepository
);

// --- Super-admin only: list users with roles (for role manager)
// REST: GET collection resource "admin's users" (with roles)
adminRouter.get("/users", authWithRoles, requireSuperAdmin, userController.getFullUsersWithRoles);

// --- Super-admin only: read/update module configs
adminRouter.get(
    "/config",
    authWithRoles,
    requireSuperAdmin,
    configSchemas.validateGetModuleConfigQuery,
    configController.getModuleConfig
);

adminRouter.put(
    "/config",
    authWithRoles,
    requireSuperAdmin,
    configSchemas.validateUpdateModuleConfigRequest,
    configController.updateModuleConfig
);

// Super-admin: Resend — send email (https://resend.com/docs/api-reference/emails/send-email)
adminRouter.post(
    "/emails/send",
    authWithRoles,
    requireSuperAdmin,
    emailSchemas.validateSendEmailBody,
    emailController.sendEmail
);

// Super-admin: Resend received emails (REST API — see https://resend.com/docs/api-reference/emails/list-received-emails)
adminRouter.get(
    "/emails/receiving",
    authWithRoles,
    requireSuperAdmin,
    emailSchemas.validateListReceivedEmailsQuery,
    parseListReceivedEmailsQuery,
    emailController.listReceivedEmails
);
adminRouter.get(
    "/emails/receiving/:id",
    authWithRoles,
    requireSuperAdmin,
    emailSchemas.validateGetReceivedEmailParams,
    emailController.getReceivedEmail
);

// Role assign/remove live under the user resource: POST/DELETE /api/v1/users/:userId/roles/:role (see UserRoute)

export { adminRouter };
