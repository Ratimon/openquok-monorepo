import { getEnv, getEnvTrimmed, getEnvNumber, getEnvBoolean } from "./envHelper";
import { DEFAULT_API_PREFIX, normalizeApiPrefix } from "./apiPrefix";
import { logger } from "../utils/Logger";
import * as loadBackendDotenvCjs from "./loadBackendDotenv.cjs";

const { loadBackendDotenv } = loadBackendDotenvCjs as { loadBackendDotenv: () => void };
import { orchestratorFlows, type OrchestrationTransport } from "./orchestratorFlows";

const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/+$/, "");

const deriveWwwVariants = (origin: string): string[] => {
    try {
        const url = new URL(origin);
        if (url.hostname.startsWith("www.")) {
            const apex = url.hostname.replace(/^www\./, "");
            return [`${url.protocol}//${apex}`];
        }
        return [`${url.protocol}//www.${url.hostname}`];
    } catch {
        return [];
    }
};

loadBackendDotenv();
const isProductionEnv = (process.env.NODE_ENV ?? "development") === "production";

const rawApiPrefix = getEnv("API_PREFIX", DEFAULT_API_PREFIX);
const resolvedApiPrefix = normalizeApiPrefix(rawApiPrefix);
if (rawApiPrefix.trim() && resolvedApiPrefix !== rawApiPrefix.trim().replace(/\/+$/, "")) {
	logger.warn({
		msg: "[Config] API_PREFIX normalized so mounted routes match /api/v1-style URLs",
		from: rawApiPrefix,
		to: resolvedApiPrefix,
	});
}

/**
 * Optional env override for `config.bullmq.*.transport` (see `orchestratorFlows.ts`).
 * Invalid non-empty values log a warning and fall back to `orchestratorFlows` defaults.
 */
function orchestrationTransportFromEnv(envKey: string, fallback: OrchestrationTransport): OrchestrationTransport {
    const raw = getEnv(envKey, "").trim().toLowerCase();
    if (raw === "in_process" || raw === "bullmq") {
        return raw;
    }
    if (raw !== "") {
        logger.warn({
            msg: "[Config] Invalid orchestrator transport env; using orchestratorFlows default",
            envKey,
            value: getEnv(envKey, ""),
            fallback,
        });
    }
    return fallback;
}

export type ConfigObject = { [key: string]: unknown };

export const config: ConfigObject = {

    /** Sender identity for transactional email (Resend/SES). */
    basic: {
        siteName: getEnv("SITE_NAME", "Openquok"),
        senderEmailAddress: getEnv("SENDER_EMAIL_ADDRESS", "noreply@example.com"),
    },

    server: {
        nodeEnv: getEnv("NODE_ENV", "development"),
        frontendDomainUrl: getEnvTrimmed("FRONTEND_DOMAIN_URL", "http://localhost:5173"),
        backendDomainUrl: getEnvTrimmed("BACKEND_DOMAIN_URL", "http://localhost:3000"),
        port: getEnvNumber("PORT", 3000),
    },

    api: {
        prefix: resolvedApiPrefix,
    },

    cors: {
        allowedOrigins: (() => {
            const frontendUrl = normalizeOrigin(getEnv("FRONTEND_DOMAIN_URL", "http://localhost:5173"));
            const origins: string[] = [frontendUrl, ...deriveWwwVariants(frontendUrl)];
            const extra = getEnv("ALLOWED_FRONTEND_ORIGINS", "");
            if (extra) {
                for (const origin of extra.split(",").map((o) => normalizeOrigin(o)).filter(Boolean)) {
                    origins.push(origin, ...deriveWwwVariants(origin));
                }
            }
            if (!isProductionEnv) {
                origins.push(
                    "http://localhost:5173",
                    "https://localhost:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:5173",
                    "https://127.0.0.1:5173",
                    "http://127.0.0.1:3000"
                );
            }
            const unique = [...new Set(origins.map(normalizeOrigin))];
            if (isProductionEnv && unique.some((origin) => origin.includes("*"))) {
                throw new Error("CORS wildcard origins are not allowed in production");
            }
            return unique;
        })(),
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"],
        credentials: true,
        maxAge: 86400,
    },

    auth: {
    /** When true, registration is disabled (unless DISABLE_REGISTRATION is not set). */
        disableRegistration: getEnvBoolean("DISABLE_REGISTRATION", false),
        /** When true, allow cookie in header for dev (NOT_SECURED). */
        notSecured: getEnvBoolean("NOT_SECURED", false),
        /** Secret for signing organization invite tokens. Required for invite-by-email. */
        inviteTokenSecret: getEnv("INVITE_TOKEN_SECRET", getEnv("JWT_SECRET", "")),
    },

    /** Email (verification, welcome). When enabled, verification emails are sent. */
    email: {
        enabled: getEnvBoolean("EMAIL_ENABLED", false),
        /** When true, use local SES mock (e.g. aws-ses-v2-local) for email. */
        isEmailServerOffline: getEnvBoolean("IS_EMAIL_SERVER_OFFLINE", false),
        // fromName: getEnv("EMAIL_FROM_NAME", "Openquok"),
        // fromAddress: getEnv("EMAIL_FROM_ADDRESS", "noreply@example.com"),
    },

    supabase: {
        supabaseUrl: getEnv("PUBLIC_SUPABASE_URL", ""),
        supabaseAnonKey: getEnv("PUBLIC_SUPABASE_ANON_KEY", ""),
        supabaseServiceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
    },


    /** AWS (SES) for local/dev email. */
    aws: {
        accessKeyId: getEnv("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
    },

    /** Resend (production) email. */
    resend: {
        secretKey: getEnv("RESEND_SECRET_KEY", ""),
    },

    /** Sentry error monitoring. When SENTRY_DSN is set and enabled, errors are reported to Sentry. */
    sentry: {
        dsn: getEnv("SENTRY_DSN", ""),
        enabled: getEnvBoolean("SENTRY_ENABLED", true),
    },

    /** Cache (memory or redis). Used by CompanyService / MarketingService for module_configs. */
    cache: {
        provider: getEnv("CACHE_PROVIDER", "memory"),
        defaultTTL: getEnvNumber("CACHE_DEFAULT_TTL", 300),
        logHits: getEnvBoolean("CACHE_LOG_HITS", true),
        logMisses: getEnvBoolean("CACHE_LOG_MISSES", true),
        checkPeriod: getEnvNumber("CACHE_CHECK_PERIOD", 60),
        useClones: getEnvBoolean("CACHE_USE_CLONES", false),
        enabled: getEnv("CACHE_ENABLED", "true") !== "false",
        enablePatterns: getEnv("CACHE_ENABLE_PATTERNS", "true") !== "false",
        redis: {
            host: getEnv("REDIS_HOST", "localhost"),
            port: getEnvNumber("REDIS_PORT", 6379),
            password: getEnv("REDIS_PASSWORD", ""),
            db: getEnvNumber("REDIS_DB", 0),
            /** Logical Redis DB for BullMQ / Flowcraft queues (defaults to REDIS_DB). */
            bullmqDb: getEnvNumber("REDIS_BULLMQ_DB", getEnvNumber("REDIS_DB", 0)),
            prefix: getEnv("REDIS_PREFIX", "app:cache:"),
            maxReconnectAttempts: getEnvNumber("REDIS_MAX_RECONNECT_ATTEMPTS", 10),
            enableOfflineQueue: getEnv("REDIS_ENABLE_OFFLINE_QUEUE", "true") !== "false",
            useScan: getEnv("REDIS_USE_SCAN", "true") !== "false",
        },
    },

    /**
     * BullMQ + integration token refresh orchestration (Flowcraft).
     * Queue connection uses `cache.redis` / `REDIS_*` and optional `REDIS_BULLMQ_DB`.
     */
    bullmq: {
        queueName: orchestratorFlows.integrationRefresh.queueName,
        /**
         * Long-running refresh supervisor for OAuth-connected integrations with refreshCron (not provider-specific secrets).
         * Enabled state from `config/orchestratorFlows.ts`; forced off under Jest (`JEST_WORKER_ID`) so tests do not sleep.
         */
        integrationRefresh: {
            enabled: (() => {
                const underJest = getEnv("JEST_WORKER_ID", "") !== "";
                return underJest ? false : orchestratorFlows.integrationRefresh.enabled;
            })(),
            transport: orchestrationTransportFromEnv(
                "ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT",
                orchestratorFlows.integrationRefresh.transport
            ),
        },
        notificationEmail: {
            queueName: orchestratorFlows.notificationEmail.queueName,
            transport: orchestrationTransportFromEnv(
                "ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT",
                orchestratorFlows.notificationEmail.transport
            ),
            digestFlushIntervalMs: orchestratorFlows.notificationEmail.digestFlushIntervalMs,
            sendPlainMinIntervalMs: orchestratorFlows.notificationEmail.sendPlainMinIntervalMs,
        },
    },

    /** Rate limiting. When enabled, applies global and auth-specific limits. */
    rateLimit: {
        enabled: getEnv("RATE_LIMIT_ENABLED", "true") !== "false",
        global: {
            windowMs: getEnvNumber("RATE_LIMIT_WINDOW_MS", 3600000), // 1 hour
            max: getEnvNumber("RATE_LIMIT_MAX", 30), // 30 requests per hour
            standardHeaders: true,
            legacyHeaders: false,
            message: "Too many requests from this IP, please try again later",
        },
        auth: {
            windowMs: getEnvNumber("AUTH_RATE_LIMIT_WINDOW_MS", 900000),
            max: getEnvNumber("AUTH_RATE_LIMIT_MAX", 50),
            standardHeaders: true,
            legacyHeaders: false,
            message: "Too many authentication attempts, please try again later",
        },
        oauth: {
            windowMs: getEnvNumber("OAUTH_RATE_LIMIT_WINDOW_MS", 300000), // 5 minutes
            max: getEnvNumber("OAUTH_RATE_LIMIT_MAX", 20),
            standardHeaders: true,
            legacyHeaders: false,
            message: "Too many OAuth requests, please try again later",
        },
    },

    /** Social integration OAuth (per-provider secrets). */
    integrations: {
        threads: {
            appId: getEnvTrimmed("THREADS_APP_ID"),
            appSecret: getEnvTrimmed("THREADS_APP_SECRET"),
        },
        /** Facebook Login — used for Instagram (Business) / Marketing API OAuth in the same Meta app. */
        facebook: {
            appId: getEnvTrimmed("FACEBOOK_APP_ID"),
            appSecret: getEnvTrimmed("FACEBOOK_APP_SECRET"),
        },
        /** Instagram Login (standalone professional accounts). */
        instagramStandalone: {
            appId: getEnv("INSTAGRAM_APP_ID", ""),
            appSecret: getEnv("INSTAGRAM_APP_SECRET", ""),
        },
    },


};

const server = config.server as { nodeEnv?: string };
logger.info({ msg: "[Config] Loaded", env: server?.nodeEnv });
