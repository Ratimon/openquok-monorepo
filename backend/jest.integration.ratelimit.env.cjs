/**
 * Force rate limiting on for RateLimit.integration.test.ts.
 * Must run before the test file (and app) is loaded so config reads RATE_LIMIT_ENABLED=true.
 */
process.env.RATE_LIMIT_ENABLED = "true";
