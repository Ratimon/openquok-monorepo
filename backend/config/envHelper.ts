/**
 * Environment variable helpers for local and deployed environments.
 */

export function getEnv(key: string, defaultValue?: string): string {
    return process.env[key] ?? defaultValue ?? "";
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