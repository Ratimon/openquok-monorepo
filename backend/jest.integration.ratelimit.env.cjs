/**
 * Force rate limiting on for RateLimit.integration.test.ts.
 * Must run after jest.env-setup.cjs so these values win over .env.*.local
 * (otherwise high RATE_LIMIT_MAX from local env makes the suite flood hundreds of requests).
 */
process.env.RATE_LIMIT_ENABLED = "true";
process.env.RATE_LIMIT_WINDOW_MS = "3600000";
process.env.RATE_LIMIT_MAX = "3";
process.env.AUTH_RATE_LIMIT_WINDOW_MS = "900000";
process.env.AUTH_RATE_LIMIT_MAX = "3";
process.env.PUBLIC_API_RATE_LIMIT_WINDOW_MS = "3600000";
process.env.PUBLIC_API_RATE_LIMIT_MAX = "3";
process.env.UPLOAD_RATE_LIMIT_WINDOW_MS = "3600000";
process.env.UPLOAD_RATE_LIMIT_MAX = "3";
process.env.FEEDBACK_RATE_LIMIT_WINDOW_MS = "3600000";
process.env.FEEDBACK_RATE_LIMIT_MAX = "3";
process.env.INTEGRATION_CONNECT_RATE_LIMIT_WINDOW_MS = "900000";
process.env.INTEGRATION_CONNECT_RATE_LIMIT_MAX = "3";
process.env.OAUTH_TOKEN_RATE_LIMIT_WINDOW_MS = "900000";
process.env.OAUTH_TOKEN_RATE_LIMIT_MAX = "3";
process.env.PUBLIC_WRITE_RATE_LIMIT_WINDOW_MS = "3600000";
process.env.PUBLIC_WRITE_RATE_LIMIT_MAX = "3";

// Skip expensive app side-channels during this suite.
process.env.SENTRY_ENABLED = "false";
process.env.SENTRY_DSN = "";
process.env.BULL_BOARD_ENABLED = "false";
process.env.MCP_ENABLED = "false";
