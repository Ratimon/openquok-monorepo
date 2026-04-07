/** @type {import('jest').Config} */
export default {
    testTimeout: 20000,
    testMatch: ["**/*.unit.test.{js,ts}"],
    transform: {
        "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: [151002] } }],
        "\\.js$": ["babel-jest", { configFile: "./babel.config.jest.cjs" }],
        "\\.mjs$": ["babel-jest", { configFile: "./babel.config.jest.cjs" }],
    },
    transformIgnorePatterns: [
        "/node_modules/(?!feed|xml-js|flowcraft|@flowcraft/bullmq-adapter|bullmq|ioredis|msgpackr|@faker-js/faker)/",
    ],
    moduleNameMapper: {
        "^backend/(.*)\\.js$": "<rootDir>/../backend/$1.ts",
        "^openquok-common$": "<rootDir>/../common/src/index.ts",
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^flowcraft$": "<rootDir>/node_modules/flowcraft/dist/index.mjs",
        "^flowcraft/testing$": "<rootDir>/node_modules/flowcraft/dist/testing/index.mjs",
        "^@flowcraft/bullmq-adapter$": "<rootDir>/node_modules/@flowcraft/bullmq-adapter/dist/index.mjs",
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
    setupFiles: [
        "<rootDir>/../backend/jest.env-setup.cjs",
        "<rootDir>/jest.orchestrator-default-transport.cjs",
    ],
    testEnvironment: "node",
    clearMocks: true,
    collectCoverage: false,
    testPathIgnorePatterns: ["/node_modules/", String.raw`bullmq\.unit\.test\.`],
};
