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
import { logger } from "../utils/Logger";

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
    });
    return true;
}
