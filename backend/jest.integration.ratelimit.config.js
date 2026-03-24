/**
 * Jest config for RateLimit.integration.test.ts only.
 * Does NOT use the rateLimit mock so the real middleware runs and 429s can be asserted.
 */
/** @type {import('jest').Config} */
export default {
    testTimeout: 20000,
    testMatch: ["**/tests/integration/RateLimit.integration.test.ts"],
    transform: {
        "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: [151002] } }],
        "\\.js$": ["babel-jest", { configFile: "./babel.config.jest.cjs" }],
    },
    transformIgnorePatterns: ["/node_modules/(?!feed|xml-js)/"],
    moduleNameMapper: {
        "^(\\./sentry/index)(\\.js)?$": "<rootDir>/tests/__mocks__/sentry.js",
        // No rateLimit mock – use real middleware for this suite
        "^(\\.{1,2}/.*)\\.js$": "$1",
        // ESM-only package: point resolver at real entry so babel-jest can transform it
        "^feed$": "<rootDir>/node_modules/feed/lib/feed.js",
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
    setupFiles: [
        "<rootDir>/jest.env-setup.cjs",
        "<rootDir>/jest.integration.ratelimit.env.cjs",
    ],
    testEnvironment: "node",
    clearMocks: true,
    collectCoverage: false,
    testPathIgnorePatterns: ["/node_modules/"],
    forceExit: true,
};
