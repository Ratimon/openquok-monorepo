/**
 * Environment variable helpers for local and deployed environments.
 */

export function getEnv(key: string, defaultValue?: string): string {
    return process.env[key] ?? defaultValue ?? "";
}

/**
 * Like {@link getEnv} but trims ASCII whitespace (including newlines) and a leading UTF-8 BOM.
 * Use for origins, OAuth client IDs/secrets, and other values often pasted from dashboards or synced
 * to hosts (e.g. Vercel) where an accidental trailing newline breaks URLs or API auth.
 */
export function getEnvTrimmed(key: string, defaultValue = ""): string {
    const raw = process.env[key] ?? defaultValue;
    return String(raw).replace(/^\uFEFF/, "").trim();
}

export function getEnvNumber(key: string, defaultValue: number): number {
    const value = getEnv(key);
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = getEnv(key);
    if (!value) return defaultValue;
    return value.toLowerCase() === "true";
}