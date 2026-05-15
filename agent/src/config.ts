import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

export type OpenquokConfig = {
  apiUrl: string;
  apiKey: string | null;
  authServerUrl: string;
};

export type StoredCredentials = {
  apiKey: string;
  apiUrl?: string;
};

/** Public device-flow auth server (hosted). Override with `OPENQUOK_AUTH_SERVER` for local or self-hosted. */
export const OPENQUOK_DEFAULT_AUTH_SERVER = "https://cli-auth.openquok.com";

/** Public API origin (hosted). Override with `OPENQUOK_API_URL` for local or self-hosted. */
export const OPENQUOK_DEFAULT_API_URL = "https://api.openquok.com";

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Exposed for `config:show` (which API URL source wins). */
export function readOpenquokApiUrlEnv(): string | undefined {
  return getEnv("OPENQUOK_API_URL");
}

/** Exposed for `config:show` (which auth server URL source wins). */
export function readOpenquokAuthServerEnv(): string | undefined {
  return getEnv("OPENQUOK_AUTH_SERVER");
}

export function getConfig(): OpenquokConfig {
  // Prefer explicit env vars, but fall back to an on-disk credentials file for local convenience.
  const apiUrl = getEnv("OPENQUOK_API_URL") ?? OPENQUOK_DEFAULT_API_URL;
  const apiKey = getEnv("OPENQUOK_API_KEY") ?? null;
  const authServerUrl = getEnv("OPENQUOK_AUTH_SERVER") ?? OPENQUOK_DEFAULT_AUTH_SERVER;
  return { apiUrl, apiKey, authServerUrl };
}

export function credentialsPath(): string {
  return path.join(os.homedir(), ".openquok", "credentials.json");
}

export async function readCredentialsFile(): Promise<StoredCredentials | null> {
  try {
    const raw = await fs.readFile(credentialsPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const apiKey = (parsed as { apiKey?: unknown }).apiKey;
    if (typeof apiKey !== "string" || !apiKey.trim()) return null;
    const apiUrl = (parsed as { apiUrl?: unknown }).apiUrl;
    return {
      apiKey: apiKey.trim(),
      ...(typeof apiUrl === "string" && apiUrl.trim() ? { apiUrl: apiUrl.trim() } : {}),
    };
  } catch {
    return null;
  }
}

export async function writeCredentialsFile(creds: StoredCredentials): Promise<void> {
  const p = credentialsPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  const payload: StoredCredentials = { apiKey: creds.apiKey };
  if (creds.apiUrl?.trim()) payload.apiUrl = creds.apiUrl.trim();
  await fs.writeFile(p, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

/** Merges on-disk credentials from `auth:login` with env overrides (`OPENQUOK_API_*`). */
export function mergeConfigWithCredentials(
  base: OpenquokConfig,
  creds: StoredCredentials | null
): OpenquokConfig {
  const envApiUrl = getEnv("OPENQUOK_API_URL");
  return {
    ...base,
    apiKey: creds?.apiKey ?? base.apiKey,
    apiUrl: envApiUrl ?? creds?.apiUrl ?? base.apiUrl,
  };
}

export async function resolveOpenquokConfig(): Promise<OpenquokConfig> {
  return mergeConfigWithCredentials(getConfig(), await readCredentialsFile());
}

export async function deleteCredentialsFile(): Promise<void> {
  try {
    await fs.unlink(credentialsPath());
  } catch {
    // ignore
  }
}

