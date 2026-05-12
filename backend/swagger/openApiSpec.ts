import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import swaggerJSDoc from "swagger-jsdoc";

/**
 * Returns this module's `import.meta.url` at runtime without exposing `import.meta` to a CommonJS
 * TypeScript compile pass (e.g. ts-jest), which rejects the syntax with TS1343. In the tsc-emitted
 * ESM build, direct `eval` runs in this module's scope, so `import.meta.url` resolves; under CJS
 * test transpilation `eval` throws a SyntaxError and we fall back to a path derived from
 * `process.cwd()` so the spec still loads against the source tree.
 *
 * The tsup-bundled Vercel handler has neither `import.meta.url` nor the on-disk `swagger/jsdoc`
 * tree, so we short-circuit to `null` via a bundler-substituted sentinel. esbuild dead-code-
 * eliminates the `eval` branch in that build, which also silences its direct-eval warning.
 */
function readImportMetaUrl(): string | null {
    if (process.env.__TSUP_BUNDLE__) {
        return null;
    }
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
    tags: [
        { name: "Integrations", description: "Channels and providers" },
        { name: "Posts", description: "Post groups and per-channel post rows" },
        { name: "Analytics", description: "Platform and per-post provider insights" },
        { name: "Notifications", description: "Paginated in-app notification history" },
        { name: "Uploads", description: "Media uploads consumed by the Posts API" },
    ],
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

/**
 * `tsx` loads `.ts` docs from source; Node loads emitted `.js` from `dist/swagger/jsdoc/`.
 *
 * Prefer the module URL hint when available, otherwise (e.g. tsx ≥ 4.x running under
 * the CJS loader, where `eval("import.meta.url")` throws and we fall through to
 * `process.cwd()`) probe the resolved `jsdoc/` directory: TS source if any `.ts` exists,
 * otherwise JS. Falls back to `["ts", "js"]` if neither lookup succeeds so we still
 * try both shapes before giving up.
 */
function resolveJsdocExt(): "ts" | "js" | Array<"ts" | "js"> {
    const fromUrl = (moduleUrl ?? "").toLowerCase();
    if (fromUrl.endsWith(".ts")) return "ts";
    if (fromUrl.endsWith(".js") || fromUrl.endsWith(".mjs") || fromUrl.endsWith(".cjs")) return "js";

    const jsdocDir = path.join(swaggerDir, "jsdoc");
    try {
        const entries = fs.readdirSync(jsdocDir);
        const hasTs = entries.some((e) => e.endsWith(".ts") && !e.endsWith(".d.ts"));
        const hasJs = entries.some((e) => e.endsWith(".js"));
        if (hasTs && !hasJs) return "ts";
        if (hasJs && !hasTs) return "js";
        if (hasTs && hasJs) return "ts";
    } catch {
        // ignore — fall through to dual-glob below
    }
    return ["ts", "js"];
}

const jsdocExt = resolveJsdocExt();
const jsdocGlobs = (Array.isArray(jsdocExt) ? jsdocExt : [jsdocExt]).map((ext) =>
    path.join(swaggerDir, "jsdoc", `*.${ext}`),
);

const options = {
    definition: swaggerDefinition,
    apis: jsdocGlobs,
};

let cached: ReturnType<typeof swaggerJSDoc> | undefined;

export function getOpenApiSpec(): ReturnType<typeof swaggerJSDoc> {
    cached ??= swaggerJSDoc(options);
    return cached;
}
