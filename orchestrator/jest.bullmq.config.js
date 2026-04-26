import baseConfig from "./jest.config.js";

/**
 * Run only `*.bullmq.unit.test.ts` with env left intact so ORCHESTRATOR_*_TRANSPORT can be bullmq.
 * Default orchestrator jest.config clears those vars after dotenv (see jest.orchestrator-default-transport.cjs).
 */
/** @type {import('jest').Config} */
export default {
    ...baseConfig,
    setupFiles: ["<rootDir>/../backend/jest.env-setup.cjs"],
    testMatch: ["**/*.bullmq.unit.test.{js,ts}"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
