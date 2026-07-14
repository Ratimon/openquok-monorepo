/**
 * Jest config for RateLimit.integration.test.ts only.
 * Does NOT use the rateLimit mock so the real middleware runs and 429s can be asserted.
 */
/** @type {import('jest').Config} */
export default {
    testTimeout: 20000,
    testMatch: ["**/tests/integration/RateLimit.integration.test.ts"],
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                diagnostics: false,
                // Skip type-checking during transform (suite only asserts runtime 429s).
                tsconfig: {
                    target: "ES2022",
                    module: "commonjs",
                    moduleResolution: "node",
                    esModuleInterop: true,
                    allowJs: true,
                    skipLibCheck: true,
                    isolatedModules: true,
                    types: ["node", "jest"],
                },
            },
        ],
        "\\.js$": ["babel-jest", { configFile: "./babel.config.jest.cjs" }],
    },
    transformIgnorePatterns: ["/node_modules/(?!feed|xml-js)/"],
    moduleNameMapper: {
        // Real `@sentry/node` init is slow and noisy; use lightweight mock.
        "^@sentry/node$": "<rootDir>/tests/__mocks__/sentry.js",
        "^(.*/)?connections/sentry/index(\\.js)?$": "<rootDir>/tests/__mocks__/sentry.js",
        "^(\\./sentry/index)(\\.js)?$": "<rootDir>/tests/__mocks__/sentry.js",
        // MCP SDK / server graph is unused by rate-limit assertions.
        "^(.*/)?mcp/startMcp(\\.js)?$": "<rootDir>/tests/__mocks__/mcp/startMcp.js",
        "^(\\.{1,2}/.*)\\.js$": "$1",
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
