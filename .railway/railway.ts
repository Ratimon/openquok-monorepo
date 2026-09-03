import { defineRailway, preserve, project, service } from "railway/iac";
import type { DeployConfig } from "railway/iac";

/** Matches repo-root `railway.toml` / `railway.scheduled-social-post.toml` buildCommand. */
const WORKER_BUILD =
	"export NODE_OPTIONS=--max-old-space-size=8192 && pnpm install --prod=false && pnpm railway:orchestrator:build";

const WORKER_BASE = {
	build: WORKER_BUILD,
	healthcheck: "/health",
	healthcheckTimeout: 300,
	replicas: { "us-west2": 1 } as const,
};

const LIGHT_WORKER_DEPLOY: DeployConfig = {
	restartPolicyType: "ON_FAILURE",
	restartPolicyMaxRetries: 10,
	limitOverride: {
		containers: {
			cpu: 1,
			memoryBytes: 1_073_741_824, // 1 GiB — integration-refresh, notification-email
		},
	},
};

const SCHEDULED_SOCIAL_POST_DEPLOY: DeployConfig = {
	restartPolicyType: "ON_FAILURE",
	restartPolicyMaxRetries: 10,
	limitOverride: {
		containers: {
			cpu: 1,
			memoryBytes: 2_147_483_648, // 2 GiB — scheduled-social-post (media publish)
		},
	},
};

/** Keep existing Railway variable values; do not commit secrets. */
const workerEnv = {
	AWS_ACCESS_KEY_ID: preserve(),
	AWS_SECRET_ACCESS_KEY: preserve(),
	CACHE_PROVIDER: preserve(),
	DISABLE_X_ANALYTICS: preserve(),
	EMAIL_ENABLED: preserve(),
	FACEBOOK_APP_ID: preserve(),
	FACEBOOK_APP_SECRET: preserve(),
	INSTAGRAM_APP_ID: preserve(),
	INSTAGRAM_APP_SECRET: preserve(),
	INTEGRATIONS_TOKEN_ENCRYPTION_KEY: preserve(),
	LINKEDIN_CLIENT_ID: preserve(),
	LINKEDIN_CLIENT_SECRET: preserve(),
	NODE_ENV: preserve(),
	ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT: preserve(),
	ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT: preserve(),
	ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT: preserve(),
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: preserve(),
	PUBLIC_SUPABASE_URL: preserve(),
	RAILPACK_CONFIG_FILE: preserve(),
	REDIS_BULLMQ_DB: preserve(),
	REDIS_DB: preserve(),
	REDIS_ENABLE_OFFLINE_QUEUE: preserve(),
	REDIS_HOST: preserve(),
	REDIS_MAX_RECONNECT_ATTEMPTS: preserve(),
	REDIS_PASSWORD: preserve(),
	REDIS_PORT: preserve(),
	REDIS_PREFIX: preserve(),
	REDIS_TLS: preserve(),
	REDIS_TLS_REJECT_UNAUTHORIZED: preserve(),
	REDIS_USE_SCAN: preserve(),
	RESEND_SECRET_KEY: preserve(),
	SECURITY_SECRET: preserve(),
	SENDER_EMAIL_ADDRESS: preserve(),
	SENTRY_DSN: preserve(),
	SENTRY_ENABLED: preserve(),
	SITE_NAME: preserve(),
	STORAGE_PROVIDER: preserve(),
	STORAGE_R2_ACCESS_KEY_ID: preserve(),
	STORAGE_R2_ACCOUNT_ID: preserve(),
	STORAGE_R2_BUCKET: preserve(),
	STORAGE_R2_PUBLIC_BASE_URL: preserve(),
	STORAGE_R2_REGION: preserve(),
	STORAGE_R2_SECRET_ACCESS_KEY: preserve(),
	SUPABASE_SECRET_KEY: preserve(),
	SUPABASE_SERVICE_ROLE_KEY: preserve(),
	THREADS_APP_ID: preserve(),
	THREADS_APP_SECRET: preserve(),
	TIKTOK_CLIENT_ID: preserve(),
	TIKTOK_CLIENT_SECRET: preserve(),
	X_API_KEY: preserve(),
	X_API_SECRET: preserve(),
	YOUTUBE_CLIENT_ID: preserve(),
	YOUTUBE_CLIENT_SECRET: preserve(),
};

export default defineRailway(() => {
	const openquokWorkerScheduledSocialPost = service("openquok-worker-scheduled-social-post", {
		...WORKER_BASE,
		deploy: SCHEDULED_SOCIAL_POST_DEPLOY,
		env: workerEnv,
	});
	const openquokWorkerNotificationEmail = service("openquok-worker-notification-email", {
		...WORKER_BASE,
		deploy: LIGHT_WORKER_DEPLOY,
		env: workerEnv,
	});
	const openquokWorkerIntegrationRefresh = service("openquok-worker-integration-refresh", {
		...WORKER_BASE,
		deploy: LIGHT_WORKER_DEPLOY,
		env: workerEnv,
	});

	return project("openquok-worker", {
		resources: [
			openquokWorkerScheduledSocialPost,
			openquokWorkerNotificationEmail,
			openquokWorkerIntegrationRefresh,
		],
	});
});
