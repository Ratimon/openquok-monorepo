/**
 * Skip noisy info/debug during tests. Checked on each call (not at module load) so it still works if env
 * is set after this file is first imported.
 */
function quietVerboseLogsNow(): boolean {
    if (typeof process === "undefined" || process.env.BACKEND_TEST_VERBOSE_LOGS === "true") {
        return false;
    }
    return (
        process.env.NODE_ENV === "test" ||
        (process.env.JEST_WORKER_ID !== undefined && process.env.JEST_WORKER_ID !== "")
    );
}

const log = (level: "error" | "warn" | "info" | "debug") => (msg: string | object, ...args: unknown[]) => {
    if (quietVerboseLogsNow() && (level === "info" || level === "debug")) {
        return;
    }
    const out = typeof msg === "object" ? { ...msg } : { msg, ...(args[0] as object) };
    (console[level] as (a: string) => void)(JSON.stringify(out));
};

export const logger = {
    error: log("error"),
    warn: log("warn"),
    info: log("info"),
    debug: log("debug"),
    trace: log("debug"),
};
