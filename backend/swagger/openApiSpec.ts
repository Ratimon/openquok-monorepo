import path from "path";
import { fileURLToPath } from "url";

import swaggerJSDoc from "swagger-jsdoc";

/**
 * Returns this module's `import.meta.url` at runtime without exposing `import.meta` to a CommonJS
 * TypeScript compile pass (e.g. ts-jest), which rejects the syntax with TS1343. In production
 * the file is emitted as ESM and direct `eval` runs inside this module's scope, so `import.meta.url`
 * resolves; under CJS test transpilation `eval` throws a SyntaxError and we fall back to a path
 * derived from `process.cwd()` so the spec still loads against the source tree.
 */
function readImportMetaUrl(): string | null {
    try {
        return eval("import.meta.url") as string;
    } catch {
        return null;
    }
}

const moduleUrl = readImportMetaUrl();
/** Renamed from `__dirname` to avoid colliding with Node's CJS wrapper binding when ts-jest emits CommonJS. */
const swaggerDir = moduleUrl
    ? path.dirname(fileURLToPath(moduleUrl))
    : path.join(process.cwd(), "swagger");

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
const jsdocExt = (moduleUrl ?? "").endsWith(".ts") ? "ts" : "js";
const jsdocGlobs = [path.join(swaggerDir, "jsdoc", `*.${jsdocExt}`)];

const options = {
    definition: swaggerDefinition,
    apis: jsdocGlobs,
};

let cached: ReturnType<typeof swaggerJSDoc> | undefined;

export function getOpenApiSpec(): ReturnType<typeof swaggerJSDoc> {
    cached ??= swaggerJSDoc(options);
    return cached;
}
