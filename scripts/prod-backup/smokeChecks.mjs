/**
 * Pure helpers for Phase B4 cutover smoke checks (no I/O).
 */

export const SENSITIVE_RPC_NAMES = [
  "internal_find_full_user_by_email",
  "internal_find_user_by_token_hash",
  "internal_get_org_member_counts",
];

export const ANON_SECURITY_DEFINER_LINT_NAMES = new Set([
  "0028_anon_security_definer_function_executable",
  "anon_security_definer_function_executable",
]);

export const EXPECTED_CRON_JOB = "delete-expired-refresh-tokens";

/** Walk stdout and parse the first complete JSON object or array. */
export function extractFirstJsonValue(stdout) {
  const text = String(stdout || "");
  const start = text.search(/[\[{]/);
  if (start < 0) return null;
  const opener = text[start];
  const closer = opener === "[" ? "]" : "}";
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === opener) depth += 1;
    else if (ch === closer) {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * `supabase db query --linked` wraps the row in `{ rows: [{ <alias>: value }] }`.
 * Return the first column of the first row when that wrapper is present.
 */
export function unwrapQueryJson(parsed) {
  if (parsed && Array.isArray(parsed.rows) && parsed.rows[0] && typeof parsed.rows[0] === "object") {
    const row = parsed.rows[0];
    const keys = Object.keys(row);
    if (keys.length === 1) return row[keys[0]];
    return row;
  }
  return parsed;
}

export function parseCliJsonStdout(stdout) {
  const text = String(stdout || "");
  const start = text.search(/[\[{]/);
  if (start < 0) return null;
  try {
    return JSON.parse(text.slice(start));
  } catch {
    return extractFirstJsonValue(text);
  }
}

export function parseLinkedQueryJson(stdout) {
  return unwrapQueryJson(parseCliJsonStdout(stdout) ?? extractFirstJsonValue(stdout));
}

export function supabaseHost(projectRef) {
  return `https://${projectRef}.supabase.co`;
}

/**
 * Count Supabase project hosts in `text` that are not the cutover target.
 * Full URLs already on the target host are ignored.
 */
export function countForeignSupabaseHosts(text, targetRef) {
  if (!text || !targetRef) return 0;
  const targetHost = `${String(targetRef).toLowerCase()}.supabase.co`;
  const matches = String(text).match(/https?:\/\/([a-z0-9]+)\.supabase\.co/gi) ?? [];
  return matches.filter((url) => !url.toLowerCase().includes(targetHost)).length;
}

/** Build a public Storage object URL, or return an existing http(s) URL unchanged. */
export function publicStorageObjectUrl(projectUrl, bucket, objectPath) {
  const trimmed = String(objectPath || "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = String(projectUrl || "").replace(/\/$/, "");
  if (!base) return null;
  let key = trimmed.replace(/^\/+/, "");
  const prefix = `${bucket}/`;
  if (key.startsWith(prefix)) key = key.slice(prefix.length);
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

export function isMaintenanceFreezeResponse(status, body) {
  if (status !== 503) return false;
  const code = body && typeof body === "object" ? body.code : "";
  const message = body && typeof body === "object" ? body.message : "";
  return code === "maintenance_freeze_writes" || /maintenance/i.test(String(message ?? ""));
}

/**
 * Classify a PostgREST RPC call made with the publishable (anon) key.
 * 2xx means the function ran. PGRST202 / 401 / 403 / 404 means it is not exposed.
 */
export function classifySensitiveRpcResponse(status, body) {
  if (status >= 200 && status < 300) {
    return { ok: false, reason: "rpc_executed" };
  }
  const blob = typeof body === "string" ? body : JSON.stringify(body ?? {});
  if (status === 401 || status === 403 || status === 404) {
    return { ok: true, reason: "denied" };
  }
  if (
    status === 400 &&
    /PGRST202|PGRST301|Could not find the function/i.test(blob)
  ) {
    return { ok: true, reason: "not_in_schema_cache" };
  }
  if (status >= 400 && status < 500) {
    return { ok: false, reason: "rpc_reachable" };
  }
  return { ok: false, reason: `http_${status}` };
}

function lintEntityName(lint) {
  const meta = lint?.metadata ?? {};
  return String(meta.name ?? meta.entity ?? lint?.detail ?? "");
}

export function isAnonSecurityDefinerLint(lint) {
  const name = String(lint?.name ?? "");
  return (
    ANON_SECURITY_DEFINER_LINT_NAMES.has(name) ||
    /anon_security_definer_function/i.test(name)
  );
}

/** High-severity: anon can execute an internal_* SECURITY DEFINER function, or an ERROR-level 0028 lint. */
export function isHighSeverityRpcLint(lint) {
  if (!isAnonSecurityDefinerLint(lint)) return false;
  const entity = lintEntityName(lint);
  if (/(^|[.\s])internal_/.test(entity)) return true;
  const level = String(lint?.level ?? "").toUpperCase();
  return level === "ERROR";
}

export function filterHighSeverityRpcLints(lints) {
  return (Array.isArray(lints) ? lints : []).filter(isHighSeverityRpcLint);
}

export function internalFunctionsExposedToAnon(rows) {
  return (Array.isArray(rows) ? rows : []).filter(
    (row) => row?.anon === true || row?.anon === "t" || row?.anon === "true"
  );
}

export function cronJobPresent(jobNames, expected = EXPECTED_CRON_JOB) {
  const names = Array.isArray(jobNames) ? jobNames : [];
  return names.some((name) => String(name) === expected);
}

export function summarizeCheckResults(checks) {
  const failed = checks.filter((c) => c.status === "fail");
  const warned = checks.filter((c) => c.status === "warn");
  const skipped = checks.filter((c) => c.status === "skip");
  const passed = checks.filter((c) => c.status === "pass");
  return {
    passed: passed.length,
    failed: failed.length,
    warned: warned.length,
    skipped: skipped.length,
    ok: failed.length === 0,
  };
}
