/**
 * Jest mock for middlewares/rateLimit.
 * Used by E2E and other tests so rate limiting is disabled (no 429s).
 * The real middleware is used when running tests/integration/RateLimit.integration.test.ts
 * via jest.integration.ratelimit.config.js (no mock).
 */
const noopMiddleware = (_req, _res, next) => next();

const applyRateLimiting = () => {};

module.exports = {
    applyRateLimiting,
    globalLimiter: noopMiddleware,
    authLimiter: noopMiddleware,
};
