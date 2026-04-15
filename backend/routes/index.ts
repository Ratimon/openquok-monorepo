import type { Express } from "express";
import express from "express";
import type { ConfigObject } from "../config/GlobalConfig";
import { authRouter } from "./AuthRoute.js";
import { userRouter } from "./UserRoute.js";
import { adminRouter } from "./AdminRoute.js";
import { companyRouter } from "./CompanyRoute.js";
import { settingsRouter } from "./SettingsRoute.js";
import { rbacRouter } from "./RbacRoute.js";
import { feedbackRouter } from "./FeedbackRoute.js";
import { blogRouter } from "./BlogRoute.js";
import { imageRouter } from "./ImageRoute.js";
import { sessionIntegrationsRouter } from "./integrations/sessionRoutes.js";
import { publicIntegrationRouter } from "./publicApi/integrationRoutes.js";
import { notificationRouter } from "./NotificationRoute.js";
import { postRouter } from "./postRoutes.js";
import { logger } from "../utils/Logger";

/**
 * API route mounting and auth surfaces (under `config.api.prefix`, default `/api/v1`):
 *
 * 1. **No user JWT** — paths listed in `middlewares/core.ts` `shouldSkipApiAuth` (e.g. auth, company,
 *    blog read paths, GET `/integrations` catalog only).
 * 2. **User JWT** — most of `/integrations/*` (see `routes/integrations/sessionRoutes.ts`), `/settings`, etc.
 * 3. **Organization API key** — `{prefix}/public/*` (e.g. `/api/v1/public/*`); `core.ts` lists `/public` in `publicPaths`
 *    so JWT is skipped; each route uses `requireOrganizationApiKey` (`routes/publicApi/integrationRoutes.ts`).
 */
export async function mountAllRoutes(app: Express, config: ConfigObject): Promise<boolean> {
    const api = config.api as { prefix?: string } | undefined;
    const prefix = api?.prefix ?? "/api/v1";
    const apiRouter = express.Router();

    apiRouter.use("/auth", authRouter);
    apiRouter.use("/users", userRouter);
    apiRouter.use("/admin", adminRouter);
    apiRouter.use("/company", companyRouter);
    apiRouter.use("/settings", settingsRouter);
    apiRouter.use("/roles", rbacRouter);
    apiRouter.use("/feedback", feedbackRouter);
    apiRouter.use("/blog-system", blogRouter);
    apiRouter.use("/image", imageRouter);
    apiRouter.use("/integrations", sessionIntegrationsRouter);
    apiRouter.use("/public", publicIntegrationRouter);
    apiRouter.use("/notifications", notificationRouter);
    apiRouter.use("/posts", postRouter);
    app.use(prefix, apiRouter);

    logger.info({
        msg: "[Routes] Mounted",
        prefix,
        auth: `${prefix}/auth`,
        users: `${prefix}/users`,
        admin: `${prefix}/admin`,
        company: `${prefix}/company`,
        settings: `${prefix}/settings`,
        roles: `${prefix}/roles`,
        feedback: `${prefix}/feedback`,
        blog: `${prefix}/blog-system`,
        image: `${prefix}/image`,
        integrationsSession: `${prefix}/integrations`,
        integrationsProgrammatic: `${prefix}/public`,
        notifications: `${prefix}/notifications`,
        posts: `${prefix}/posts`,
    });
    return true;
}
