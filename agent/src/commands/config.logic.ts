import { OPENQUOK_DEFAULT_API_URL, OPENQUOK_DEFAULT_AUTH_SERVER } from "../config";

export type OpenquokDeploymentKind = "openquok_cloud" | "custom";

/** Origin only (scheme + host + optional port), lowercased host, no trailing slash on path. */
export function openquokOrigin(url: string): string | null {
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    const host = u.hostname.toLowerCase();
    const port = u.port ? `:${u.port}` : "";
    return `${u.protocol}//${host}${port}`;
  } catch {
    return null;
  }
}

export function classifyOpenquokDeployment(apiUrl: string, authServerUrl: string): OpenquokDeploymentKind {
  const api = openquokOrigin(apiUrl);
  const auth = openquokOrigin(authServerUrl);
  const defApi = openquokOrigin(OPENQUOK_DEFAULT_API_URL);
  const defAuth = openquokOrigin(OPENQUOK_DEFAULT_AUTH_SERVER);
  if (api && auth && defApi && defAuth && api === defApi && auth === defAuth) {
    return "openquok_cloud";
  }
  return "custom";
}

export type ApiUrlResolutionSource = "environment" | "credentials_file" | "default";

export function resolveApiUrlSource(
  envApiUrl: string | undefined,
  storedApiUrl: string | undefined
): ApiUrlResolutionSource {
  if (envApiUrl?.trim()) return "environment";
  if (storedApiUrl?.trim()) return "credentials_file";
  return "default";
}

export type AuthServerResolutionSource = "environment" | "default";

export function resolveAuthServerSource(envAuthServer: string | undefined): AuthServerResolutionSource {
  return envAuthServer?.trim() ? "environment" : "default";
}
