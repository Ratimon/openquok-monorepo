const path = require("path");

/**
 * Jest globalSetup runs in a separate process before setupFiles.
 * Load the same env as test workers so Supabase credentials are available.
 */
process.env.NODE_ENV = process.env.NODE_ENV || "test";
require(path.join(__dirname, "..", "jest.env-setup.cjs"));

module.exports = async function globalSetup() {
    const {
        canRunTestDatabaseCleanup,
        runTestDatabaseCleanupBeforeAllTests,
    } = require("./helpers/organizationTestCleanup");

    if (!canRunTestDatabaseCleanup()) {
        return;
    }

    const result = await runTestDatabaseCleanupBeforeAllTests();
    if (result && (result.organizationIds.length > 0 || result.testUserIds.length > 0)) {
        // eslint-disable-next-line no-console -- intentional test harness logging
        console.info(
            `[jest globalSetup] Cleaned test DB: ${result.organizationIds.length} organization(s), ${result.testUserIds.length} test user(s).`
        );
    }
};
