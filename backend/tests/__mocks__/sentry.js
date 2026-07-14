/**
 * Jest mock for Sentry (`@sentry/node` and `connections/sentry/index`).
 * Avoids real SDK init (slow + noisy) in integration/e2e suites.
 */
const noop = () => {};

const Sentry = {
    init: noop,
    isInitialized: () => false,
    captureException: noop,
    captureMessage: noop,
    makeNodeTransport: () => ({
        send: () => Promise.resolve({ statusCode: 200 }),
        flush: () => Promise.resolve(true),
    }),
    expressIntegration: () => ({}),
    setupExpressErrorHandler: () => (_err, _req, _res, next) => next(),
    flush: () => Promise.resolve(true),
    metrics: {
        increment: noop,
    },
};

module.exports = { Sentry, ...Sentry, default: Sentry };
