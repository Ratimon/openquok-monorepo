import type { Request, Response } from "express";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/table-types";
import {
    createBrowserClient,
    createServerClient,
    type CookieMethodsServer,
    parseCookieHeader,
    serializeCookieHeader,
} from "@supabase/ssr";
import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";

const supabaseConfig = config.supabase as {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey?: string;
};

const serverConfig = config.server as {
    nodeEnv?: string;
    frontendDomainUrl?: string;
    backendDomainUrl?: string;
};

/**
 * Keep in sync with AuthController's SameSite decision logic.
 * If frontend/backend are cross-site (e.g. openquok.com -> *.vercel.app), we must use SameSite=None.
 */
function getSiteKey(hostname: string): string {
    const h = hostname.toLowerCase();
    const parts = h.split(".").filter(Boolean);
    if (parts.length <= 1) return h;
    const threeLabelPublicSuffixes = new Set([
        "vercel.app",
        "netlify.app",
        "onrender.com",
        "fly.dev",
        "pages.dev",
        "web.app",
        "firebaseapp.com",
        "github.io",
    ]);
    const last2 = parts.slice(-2).join(".");
    if (threeLabelPublicSuffixes.has(last2) && parts.length >= 3) return parts.slice(-3).join(".");
    return last2;
}

function getSameSiteValue(): "lax" | "none" {
    if (serverConfig.nodeEnv !== "production") return "lax";
    try {
        const frontUrl = new URL(serverConfig.frontendDomainUrl ?? "");
        const backUrl = new URL(serverConfig.backendDomainUrl ?? "");
        return getSiteKey(frontUrl.hostname) === getSiteKey(backUrl.hostname) ? "lax" : "none";
    } catch {
        return "none";
    }
}

let supabaseAnonSingleton: SupabaseClient<Database> | undefined;

function getSupabaseAnonClient(): SupabaseClient<Database> {
    if (!supabaseAnonSingleton) {
        const url = (supabaseConfig.supabaseUrl ?? "").trim();
        const key = (supabaseConfig.supabaseAnonKey ?? "").trim();
        if (!url) {
            throw new Error("PUBLIC_SUPABASE_URL (or config.supabase.supabaseUrl) is required");
        }
        if (!key) {
            throw new Error("PUBLIC_SUPABASE_ANON_KEY (or config.supabase.supabaseAnonKey) is required");
        }
        supabaseAnonSingleton = createClient<Database>(url, key);
    }
    return supabaseAnonSingleton;
}

/** Lazily created anon client so missing env does not crash module load (e.g. serverless cold start). */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
    get(_target, prop, receiver) {
        const client = getSupabaseAnonClient();
        const value = Reflect.get(client, prop, receiver);
        if (typeof value === "function") {
            return (value as (...a: unknown[]) => unknown).bind(client);
        }
        return value;
    },
});

export const createSupabaseBrowserClient = () => {
    return createBrowserClient<Database>(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey
    );
};

export function createSupabaseServiceClient(): SupabaseClient<Database> {
    try {
        const supabaseUrl = supabaseConfig.supabaseUrl;
        const fromConfig = supabaseConfig.supabaseServiceRoleKey?.trim() ?? "";
        const fromEnv = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
        let supabaseKey = fromConfig || fromEnv;

        if (!supabaseKey) {
            if ((config.server as { nodeEnv?: string }).nodeEnv === "production") {
                throw new Error(
                    "SUPABASE_SERVICE_ROLE_KEY (or config.supabase.supabaseServiceRoleKey) is required in production"
                );
            }
            const isJest = process.env.JEST_WORKER_ID !== undefined;
            // jest.env-setup sets NODE_ENV=test; unit scripts may use NODE_ENV=development but Jest always sets JEST_WORKER_ID.
            if (isJest || process.env.NODE_ENV === "test") {
                supabaseKey = supabaseConfig.supabaseAnonKey;
                logger.warn({
                    msg: "Using anon key for Supabase under Jest or NODE_ENV=test (set SUPABASE_SERVICE_ROLE_KEY for integration tests against a real DB).",
                });
            } else if (process.env.NODE_ENV === "development") {
                throw new Error(
                    "SUPABASE_SERVICE_ROLE_KEY is required for the API process. The anon key cannot access server-side tables (for example notifications and memberships)."
                );
            } else {
                supabaseKey = supabaseConfig.supabaseAnonKey;
                logger.warn({
                    msg: "Using anon key for Supabase service client: many repository queries will fail. Set SUPABASE_SERVICE_ROLE_KEY.",
                });
            }
        }

        if (!supabaseUrl) {
            throw new Error("PUBLIC_SUPABASE_URL (or config.supabase.supabaseUrl) is required");
        }

        const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        return supabaseClient;
    } catch (error) {
        logger.error({
            msg: "CRITICAL: Failed to initialize Supabase client",
            error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(
            `Supabase client initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/** Options for createServerClient using getAll/setAll (non-deprecated). */
type ServerClientOptions = Extract<
    Parameters<typeof createServerClient<Database>>[2],
    { cookies: CookieMethodsServer }
>;

/** For server-side auth with cookies (sign-in, sign-up, sign-out). */
export const createSupabaseRLSClient = ({ req, res }: { req: Request; res: Response }) => {
    const cookies: CookieMethodsServer = {
        getAll() {
            return parseCookieHeader(req.headers.cookie ?? "").map(({ name, value }) => ({
                name,
                value: value ?? "",
            }));
        },
        setAll(cookiesToSet) {
            if (res.headersSent) return;
            const isProduction = serverConfig.nodeEnv === "production";
            const sameSite = getSameSiteValue();
            cookiesToSet.forEach(({ name, value, options }) => {
                // SECURITY: Always enforce safe cookie defaults for Supabase session cookies.
                // These cookies can carry refresh tokens, so they must not be readable by JS.
                const mergedOptions = {
                    path: "/",
                    httpOnly: true,
                    secure: isProduction,
                    sameSite,
                    ...(options ?? {}),
                    // Never allow downstream options to weaken these in production.
                    ...(isProduction ? { httpOnly: true, secure: true, sameSite } : {}),
                };

                res.appendHeader("Set-Cookie", serializeCookieHeader(name, value, mergedOptions));
            });
        },
    };
    const options: ServerClientOptions = { cookies };
    return createServerClient<Database>(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey,
        options
    );
};
