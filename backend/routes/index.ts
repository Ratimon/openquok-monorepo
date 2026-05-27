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
import { mediaRouter } from "./MediaRoute.js";
import { integrationsRouter } from "./integrationApi/index.js";
import { publicApiRouter } from "./publicApi/index.js";
import { notificationRouter } from "./NotificationRoute.js";
import { postRouter } from "./PostRoutes.js";
import { thirdPartyRouter } from "./ThirdPartyRoute.js";
import { signatureRouter } from "./SignatureRoute.js";
import { setsRouter } from "./SetsRoute.js";
import { analyticsRouter } from "./AnalyticsRoute.js";
import { billingRouter } from "./BillingRoute.js";
import { oauthAppRouter } from "./OauthAppRoute.js";
import { oauthRouter } from "./OauthRoute.js";
import { registerBullBoardRoutes, registerBullBoardSessionRoutes } from "./BullBoardRoute.js";
import { mountOpenApiDocs } from "../swagger/mountOpenApiDocs.js";
import { logger } from "../utils/Logger";

/**
 * API route mounting and auth surfaces (under `config.api.prefix`, default `/api/v1`):
 *
 * 1. **No user JWT** — paths listed in `middlewares/core.ts` `shouldSkipApiAuth` (e.g. auth, company,
 *    blog read paths, GET `/integrations` catalog only, GET `/settings/invite/validate`).
 * 2. **User JWT** — most of `/integrations/*` (see `routes/integrationApi`), `/settings`, etc.
 * 3. **Organization API key** — `{prefix}/public/*` (e.g. `/api/v1/public/*`); `core.ts` lists `/public` in `publicPaths`
 *    so JWT is skipped. Programmatic routes use `requireProgrammaticAuth` (e.g. `routes/publicApi/IntegrationRoutes.ts`,
 *    `MediaUploadRoutes.ts`, `PostRoutes.ts`); `GET {prefix}/public/posts/:postId/comments` is anonymous.
 */
export async function mountAllRoutes(app: Express, config: ConfigObject): Promise<boolean> {
    const api = config.api as { prefix?: string } | undefined;
    const prefix = api?.prefix ?? "/api/v1";
    const apiRouter = express.Router();

    mountOpenApiDocs(apiRouter);

    apiRouter.use("/auth", authRouter);
    apiRouter.use("/users", userRouter);
    // Bull Board must mount before the generic `/admin` router, otherwise a path like `/admin/queues`
    // is handled only by `AdminRoute` (as `/queues` on the admin router) and the dashboard is never hit.
    //
    // Setup is wrapped so it can never break the API: if Bull Board fails (e.g. `@bull-board/ui`
    // missing on Vercel due to its eval'd `require.resolve`), `createApp()` would otherwise throw and
    // every request — including OPTIONS preflight — would 500 without CORS headers, surfacing in the
    // browser as a CORS error rather than the real cause.
    try {
        registerBullBoardSessionRoutes(apiRouter, config);
        await registerBullBoardRoutes(apiRouter, config);
    } catch (error) {
        logger.error({
            msg: "[Routes] Bull Board setup failed (non-fatal); dashboard will not be available",
            error: error instanceof Error ? error.message : String(error),
        });
    }
    apiRouter.use("/admin", adminRouter);
    apiRouter.use("/company", companyRouter);
    apiRouter.use("/settings", settingsRouter);
    apiRouter.use("/roles", rbacRouter);
    apiRouter.use("/feedback", feedbackRouter);
    apiRouter.use("/blog-system", blogRouter);
    apiRouter.use("/image", imageRouter);
    apiRouter.use("/media", mediaRouter);
    apiRouter.use("/integrations", integrationsRouter);
    apiRouter.use("/public", publicApiRouter);
    apiRouter.use("/notifications", notificationRouter);
    apiRouter.use("/posts", postRouter);
    apiRouter.use("/third-parties", thirdPartyRouter);
    apiRouter.use("/signatures", signatureRouter);
    apiRouter.use("/sets", setsRouter);
    apiRouter.use("/analytics", analyticsRouter);
    apiRouter.use("/billing", billingRouter);
    apiRouter.use("/oauth-apps", oauthAppRouter);
    apiRouter.use("/oauth", oauthRouter);
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
        media: `${prefix}/media`,
        integrationsSession: `${prefix}/integrations`,
        integrationsProgrammatic: `${prefix}/public`,
        notifications: `${prefix}/notifications`,
        posts: `${prefix}/posts`,
        thirdParties: `${prefix}/third-parties`,
        signatures: `${prefix}/signatures`,
        sets: `${prefix}/sets`,
        analytics: `${prefix}/analytics`,
        billing: `${prefix}/billing`,
        oauthApps: `${prefix}/oauth-apps`,
        oauth: `${prefix}/oauth`,
    });
    return true;
}
