import path from "path";
import { fileURLToPath } from "url";

import swaggerJSDoc from "swagger-jsdoc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const swaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: "OpenQuok API",
        version: "1.0.0",
        description: "REST API. Extend by adding `@openapi` YAML blocks in `backend/swagger/jsdoc/*.doc.ts` (swagger-jsdoc merges them at startup).",
    },
    tags: [{ name: "Integrations", description: "Channels and providers" }],
    servers: [{ url: "/api/v1", description: "API v1 (same origin as this spec when using the Vite dev proxy)" }],
    components: {
        securitySchemes: {
            ApiKeyAuth: {
                type: "apiKey",
                in: "header",
                name: "Authorization",
                description: "Organization API key (same value you use in the OpenAPI playground).",
            },
        },
    },
    /** Default for operations that omit `security` (protected). Public routes set `security: []` in their `@openapi` block. */
    security: [{ ApiKeyAuth: [] }],
};

/** `tsx` loads `.ts` docs; Node loads emitted `.js` from `dist/swagger/jsdoc/`. */
const jsdocExt = import.meta.url.endsWith(".ts") ? "ts" : "js";
const jsdocGlobs = [path.join(__dirname, "jsdoc", `*.${jsdocExt}`)];

const options = {
    definition: swaggerDefinition,
    apis: jsdocGlobs,
};

let cached: ReturnType<typeof swaggerJSDoc> | undefined;

export function getOpenApiSpec(): ReturnType<typeof swaggerJSDoc> {
    cached ??= swaggerJSDoc(options);
    return cached;
}
