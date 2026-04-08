import { Router } from "express";
import { notificationController } from "../controllers/index";
import {
    validateNotificationOrganizationQuery,
    validateNotificationPaginatedQuery,
} from "../data/schemas/notificationSchemas";
import { requireFullAuth } from "../middlewares/authenticateUser";
import {
    createNotificationOrganizationQueryParser,
    createNotificationPaginatedQueryParser,
} from "../middlewares/queryParsers";
import { supabaseAnonClient } from "../connections/index";

type NotificationRouter = ReturnType<typeof Router>;

const notificationRouter: NotificationRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);
const parseNotificationOrganizationQuery = createNotificationOrganizationQueryParser();
const parseNotificationPaginatedQuery = createNotificationPaginatedQueryParser();

notificationRouter.get(
    "/",
    auth,
    validateNotificationOrganizationQuery,
    parseNotificationOrganizationQuery,
    notificationController.mainPageCount
);
notificationRouter.get(
    "/list",
    auth,
    validateNotificationOrganizationQuery,
    parseNotificationOrganizationQuery,
    notificationController.list
);
notificationRouter.get(
    "/paginated",
    auth,
    validateNotificationPaginatedQuery,
    parseNotificationPaginatedQuery,
    notificationController.paginated
);

export { notificationRouter };
