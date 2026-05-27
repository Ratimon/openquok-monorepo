import { Router } from "express";
import { configController, emailController, userController } from "../controllers/index";
import { requireFullAuthWithRoles, requirePlatformAdmin } from "../guards";
import { createListReceivedEmailsParser } from "../middlewares/queryParsers";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import configSchemas from "../data/schemas/configSchemas";
import emailSchemas from "../data/schemas/emailSchemas";

type AdminRouter = ReturnType<typeof Router>;

const adminRouter: AdminRouter = Router();
const parseListReceivedEmailsQuery = createListReceivedEmailsParser();
const authWithRoles = requireFullAuthWithRoles(
    supabaseAnonClient,
    userRepository,
    rbacRepository
);

// --- Super-admin only: list users with roles (for role manager)
// REST: GET collection resource "admin's users" (with roles)
adminRouter.get("/users", authWithRoles, requirePlatformAdmin, userController.getFullUsersWithRoles);

// --- Super-admin only: read/update module configs
adminRouter.get(
    "/config",
    authWithRoles,
    requirePlatformAdmin,
    configSchemas.validateGetModuleConfigQuery,
    configController.getModuleConfig
);

adminRouter.put(
    "/config",
    authWithRoles,
    requirePlatformAdmin,
    configSchemas.validateUpdateModuleConfigRequest,
    configController.updateModuleConfig
);

// Super-admin: Resend — send email (https://resend.com/docs/api-reference/emails/send-email)
adminRouter.post(
    "/emails/send",
    authWithRoles,
    requirePlatformAdmin,
    emailSchemas.validateSendEmailBody,
    emailController.sendEmail
);

// Super-admin: Resend received emails (REST API — see https://resend.com/docs/api-reference/emails/list-received-emails)
adminRouter.get(
    "/emails/receiving",
    authWithRoles,
    requirePlatformAdmin,
    emailSchemas.validateListReceivedEmailsQuery,
    parseListReceivedEmailsQuery,
    emailController.listReceivedEmails
);
adminRouter.get(
    "/emails/receiving/:id",
    authWithRoles,
    requirePlatformAdmin,
    emailSchemas.validateGetReceivedEmailParams,
    emailController.getReceivedEmail
);

// Role assign/remove live under the user resource: POST/DELETE /api/v1/users/:userId/roles/:role (see UserRoute)

export { adminRouter };
