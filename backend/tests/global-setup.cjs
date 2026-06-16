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

    const cleanupTimeoutMs = Number(process.env.OPENQUOK_TEST_DB_CLEANUP_TIMEOUT_MS ?? 60_000);

    try {
        const result = await Promise.race([
            runTestDatabaseCleanupBeforeAllTests(),
            new Promise((_, reject) => {
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                `[jest globalSetup] Test database cleanup timed out after ${cleanupTimeoutMs}ms. ` +
                                    "Ensure Supabase is running (backend/: supabase start) or set OPENQUOK_SKIP_TEST_DB_CLEANUP=true."
                            )
                        ),
                    cleanupTimeoutMs
                );
            }),
        ]);
        if (result && (result.organizationIds.length > 0 || result.testUserIds.length > 0)) {
            // eslint-disable-next-line no-console -- intentional test harness logging
            console.info(
                `[jest globalSetup] Cleaned test DB: ${result.organizationIds.length} organization(s), ${result.testUserIds.length} test user(s).`
            );
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const looksLikeUnreachable =
            /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(msg) ||
            (err instanceof Error && err.cause instanceof Error && /fetch failed/i.test(err.cause.message));
        if (looksLikeUnreachable) {
            throw new Error(
                "[jest globalSetup] Cannot reach Supabase for pre-test cleanup.\n" +
                    "  1. Ensure Docker is running.\n" +
                    "  2. From backend/: supabase start   (API at http://127.0.0.1:54321)\n" +
                    "  3. Match PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env.development.local (supabase status -o env)\n" +
                    "Optional: OPENQUOK_SKIP_TEST_DB_CLEANUP=true skips cleanup only; integration tests still need a live DB.\n" +
                    `Original: ${msg}`
            );
        }
        throw err;
    }
};
