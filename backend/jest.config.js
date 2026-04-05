/** @type {import('jest').Config} */
export default {
    testTimeout: 20000,
    testMatch: ["**/*.e2e.test.{js,ts}", "**/e2e/**/*.test.{js,ts}", "**/*.test.{js,ts}"],
    // Transform ESM-only packages (feed, xml-js) to CJS so Jest can load them; blog/RSS tests use real feed.
    transform: {
        "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: [151002] } }],
        "\\.js$": ["babel-jest", { configFile: "./babel.config.jest.cjs" }],
        "\\.mjs$": ["babel-jest", { configFile: "./babel.config.jest.cjs" }],
    },
    transformIgnorePatterns: ["/node_modules/(?!feed|xml-js|flowcraft)/"],
    moduleNameMapper: {
        "^(\\./sentry/index)(\\.js)?$": "<rootDir>/tests/__mocks__/sentry.js",
        "^\\.\\./middlewares/rateLimit$": "<rootDir>/tests/__mocks__/middlewares/rateLimit.js",
        "^(\\.{1,2}/.*)\\.js$": "$1",
        // ESM-only package: point resolver at real entry so babel-jest can transform it
        "^feed$": "<rootDir>/node_modules/feed/lib/feed.js",
        "^flowcraft$": "<rootDir>/node_modules/flowcraft/dist/index.mjs",
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
    setupFiles: ["<rootDir>/jest.env-setup.cjs"],
    testEnvironment: "node",
    clearMocks: true,
    collectCoverage: false,
    testPathIgnorePatterns: ["/node_modules/"],
    forceExit: true,
};
