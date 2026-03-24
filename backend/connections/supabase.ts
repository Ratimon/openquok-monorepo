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

export const supabase = createClient<Database>(
    supabaseConfig.supabaseUrl,
    supabaseConfig.supabaseAnonKey
);

export const createSupabaseBrowserClient = () => {
    return createBrowserClient<Database>(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey
    );
};

export function createSupabaseServiceClient(): SupabaseClient<Database> {
    try {
        const supabaseUrl = supabaseConfig.supabaseUrl;
        let supabaseKey = supabaseConfig.supabaseServiceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseKey) {
            if ((config.server as { nodeEnv?: string }).nodeEnv === "production") {
                throw new Error(
                    "SUPABASE_SERVICE_ROLE_KEY (or config.supabase.supabaseServiceRoleKey) is required in production"
                );
            }
            supabaseKey = supabaseConfig.supabaseAnonKey;
            logger.warn({ msg: "Using anon key for Supabase (bypasses RLS)." });
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
            cookiesToSet.forEach(({ name, value, options }) => {
                res.appendHeader("Set-Cookie", serializeCookieHeader(name, value, options ?? {}));
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
