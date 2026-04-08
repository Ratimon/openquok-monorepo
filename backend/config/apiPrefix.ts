/** Default API path segment (matches `GlobalConfig` / `API_PREFIX`). */
export const DEFAULT_API_PREFIX = "/api/v1";

/**
 * If `API_PREFIX` is set to a version-only segment (e.g. `/v1`), routes mount at `/v1/...`
 * while clients and proxies call `/api/v1/...`, and Express responds with
 * "Cannot POST /api/v1/...". Normalize by prefixing `/api` when the value is a bare
 * version segment under the functions directory convention.
 */
export function normalizeApiPrefix(raw: string): string {
	let p = raw.trim().replace(/\/+$/, "");
	if (!p) {
		return DEFAULT_API_PREFIX;
	}
	if (!p.startsWith("/")) {
		p = `/${p}`;
	}
	if (!p.startsWith("/api") && /^\/v\d+(\/|$)/.test(p)) {
		return `/api${p}`;
	}
	return p;
}

/** Path after `/api` for Vercel serverless URL normalization (see `handler/index.ts`). */
export function apiPathAfterFunctionsDirectory(apiPrefix: string): string {
	const raw = normalizeApiPrefix(apiPrefix).replace(/\/+$/, "") || DEFAULT_API_PREFIX;
	if (!raw.startsWith("/api")) {
		return "";
	}
	const rest = raw.slice("/api".length);
	return rest || "/";
}
