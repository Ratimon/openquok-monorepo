import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

export type OpenquokConfig = {
  apiUrl: string;
  apiKey: string | null;
  authServerUrl: string;
};

const DEFAULT_API_URL = "https://api.openquok.com";
const DEFAULT_AUTH_SERVER_URL = "http://localhost:3111";

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function getConfig(): OpenquokConfig {
  // Prefer explicit env vars, but fall back to an on-disk credentials file for local convenience.
  const apiUrl = getEnv("OPENQUOK_API_URL") ?? DEFAULT_API_URL;
  const apiKey = getEnv("OPENQUOK_API_KEY") ?? null;
  const authServerUrl = getEnv("OPENQUOK_AUTH_SERVER") ?? DEFAULT_AUTH_SERVER_URL;
  return { apiUrl, apiKey, authServerUrl };
}

export function credentialsPath(): string {
  return path.join(os.homedir(), ".openquok", "credentials.json");
}

export async function readCredentialsFile(): Promise<{ apiKey?: string } | null> {
  try {
    const raw = await fs.readFile(credentialsPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const apiKey = (parsed as any).apiKey;
    return typeof apiKey === "string" && apiKey.trim() ? { apiKey: apiKey.trim() } : null;
  } catch {
    return null;
  }
}

export async function writeCredentialsFile(creds: { apiKey: string }): Promise<void> {
  const p = credentialsPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify({ apiKey: creds.apiKey }, null, 2) + "\n", "utf8");
}

export async function deleteCredentialsFile(): Promise<void> {
  try {
    await fs.unlink(credentialsPath());
  } catch {
    // ignore
  }
}

