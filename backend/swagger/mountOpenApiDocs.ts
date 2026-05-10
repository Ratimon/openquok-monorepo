import type { Router } from "express";

import swaggerUi from "swagger-ui-express";

import { logger } from "../utils/Logger.js";
import { getOpenApiSpec } from "./openApiSpec.js";

/**
 * OpenAPI 3 document + Swagger UI under the API prefix (default `/api/v1`):
 * - `GET …/openapi.json` — machine-readable spec for docs playground / codegen / CI
 * - `GET …/docs` — interactive Swagger UI
 */
export function mountOpenApiDocs(apiRouter: Router): void {
    const spec = getOpenApiSpec();

    apiRouter.get("/openapi.json", (_req, res) => {
        res.status(200).type("application/json").send(spec);
    });

    apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "OpenQuok API — Swagger UI" }));

    logger.info({
        msg: "[Routes] OpenAPI",
        openapiJson: "/openapi.json",
        swaggerUi: "/docs",
    });
}
