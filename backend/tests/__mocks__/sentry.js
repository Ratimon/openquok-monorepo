/**
 * Jest mock for connections/sentry so the real ESM index.js is not loaded
 * (Jest runs as CJS and fails on that file's import/export).
 */
const noop = () => {};
const Sentry = {
    init: noop,
    isInitialized: () => false,
    captureException: noop,
    captureMessage: noop,
    setupExpressErrorHandler: () => (_err, _req, _res, next) => next(),
    flush: () => Promise.resolve(true),
};
module.exports = { Sentry };
