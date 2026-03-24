const log = (level: "error" | "warn" | "info" | "debug") => (msg: string | object, ...args: unknown[]) => {
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
