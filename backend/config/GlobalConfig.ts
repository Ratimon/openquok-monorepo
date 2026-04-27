import { getEnv, getEnvTrimmed, getEnvNumber, getEnvBoolean } from "./envHelper";
import { DEFAULT_API_PREFIX, normalizeApiPrefix } from "./apiPrefix";
import { logger } from "../utils/Logger";
import * as loadBackendDotenvCjs from "./loadBackendDotenv.cjs";

const { loadBackendDotenv } = loadBackendDotenvCjs as { loadBackendDotenv: () => void };
import { flowcraftBullmqDefaults, orchestratorFlows, type OrchestrationTransport } from "./orchestratorFlows";

/** Strips BOM, quotes (bad dashboard paste), trailing slashes — browser `Origin` must match exactly. */
const normalizeOrigin = (origin: string): string => {
	let s = String(origin).replace(/^\uFEFF/, "").trim().replace(/\/+$/, "");
	if (
		(s.startsWith('"') && s.endsWith('"')) ||
		(s.startsWith("'") && s.endsWith("'"))
	) {
		s = s.slice(1, -1).replace(/^\uFEFF/, "").trim().replace(/\/+$/, "");
	}
	return s;
};

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

    admin: {
        bullBoard: {
            enabled: getEnvBoolean("BULL_BOARD_ENABLED", false),
            /**
             * Path relative to `API_PREFIX` (default `/api/v1`), e.g. `/admin-queues` → `/api/v1/admin-queues`.
             * Not nested under the REST `AdminRoute` at `/api/v1/admin/*` (e.g. avoid `/admin/queues` unless you
             * also mount this router before `use("/admin", adminRouter)` in `routes/index.ts`).
             * You may set an absolute public path that starts with `API_PREFIX`.
             */
            path: getEnvTrimmed("BULL_BOARD_PATH", "/admin-queues"),
        },
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
            const feRaw = getEnvTrimmed("FRONTEND_DOMAIN_URL");
            const frontendUrl = normalizeOrigin(feRaw || "http://localhost:5173");
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
            if (isProductionEnv) {
                logger.info({
                    msg: "[CORS] Allowed origins (check this matches the browser Origin if requests fail)",
                    count: unique.length,
                    origins: unique,
                });
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

    /**
     * S3-compatible object storage (Cloudflare R2) for `/api/v1/media/*` (user-owned composer objects).
     * When required keys are missing, media routes cannot talk to object storage until configured.
     */
    storage: {
        /** Storage provider for user media uploads. */
        provider: getEnv("STORAGE_PROVIDER", "r2"),
        r2: {
            accountId: getEnvTrimmed("STORAGE_R2_ACCOUNT_ID"),
            accessKeyId: getEnvTrimmed("STORAGE_R2_ACCESS_KEY_ID"),
            secretAccessKey: getEnvTrimmed("STORAGE_R2_SECRET_ACCESS_KEY"),
            bucket: getEnvTrimmed("STORAGE_R2_BUCKET"),
            region: getEnvTrimmed("STORAGE_R2_REGION", "APAC"),
            /** Public origin for browser `<img src>` (R2 custom domain or r2.dev); no trailing slash. */
            publicBaseUrl: getEnvTrimmed("STORAGE_R2_PUBLIC_BASE_URL"),
        },
        local: {
            /** Absolute path on disk where uploads are written (for STORAGE_PROVIDER=local). */
            uploadDirectory: getEnvTrimmed("UPLOAD_DIRECTORY", ""),
        },
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
            host: getEnvTrimmed("REDIS_HOST", "localhost"),
            port: getEnvNumber("REDIS_PORT", 6379),
            password: getEnvTrimmed("REDIS_PASSWORD", ""),
            db: getEnvNumber("REDIS_DB", 0),
            /**
             * Managed Redis providers frequently require TLS.
             * When enabled, `RedisCacheProvider` and BullMQ `ioredis` clients use TLS sockets.
             */
            tls: getEnv("REDIS_TLS", "false") === "true",
            /**
             * When `REDIS_TLS=true`, you may need to disable cert verification in some dev/test environments.
             * Production should keep the default (`true`) unless you know your provider requires otherwise.
             */
            tlsRejectUnauthorized: getEnv("REDIS_TLS_REJECT_UNAUTHORIZED", "true") !== "false",
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
        /**
         * [Flowcraft BullMQ reconciler](https://flowcraft.js.org/guide/adapters/bullmq#reconciliation): shared by all
         * `*BullMqWorker` processes. `reconcilerIntervalMs: 0` disables the timer.
         */
        flowcraft: {
            reconcilerStalledThresholdSeconds: flowcraftBullmqDefaults.reconcilerStalledThresholdSeconds,
            reconcilerIntervalMs: flowcraftBullmqDefaults.reconcilerIntervalMs,
            /** Override via `BULLMQ_WORKER_LOCK_DURATION_MS` (milliseconds). */
            workerLockDurationMs: getEnvNumber("BULLMQ_WORKER_LOCK_DURATION_MS", flowcraftBullmqDefaults.workerLockDurationMs),
        },
        /**
         * Long-running refresh supervisor for OAuth-connected integrations with refreshCron (not provider-specific secrets).
         * Enabled state from `config/orchestratorFlows.ts`; forced off under Jest (`JEST_WORKER_ID`) so tests do not sleep.
         */
        integrationRefresh: {
            queueName: orchestratorFlows.integrationRefresh.queueName,
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
        scheduledSocialPost: {
            queueName: orchestratorFlows.scheduledSocialPost.queueName,
            transport: orchestrationTransportFromEnv(
                "ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT",
                orchestratorFlows.scheduledSocialPost.transport
            ),
            missingPostRescanIntervalMs: orchestratorFlows.scheduledSocialPost.missingPostRescanIntervalMs,
            enabled: (() => {
                const underJest = getEnv("JEST_WORKER_ID", "") !== "";
                return underJest ? false : orchestratorFlows.scheduledSocialPost.enabled;
            })(),
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
