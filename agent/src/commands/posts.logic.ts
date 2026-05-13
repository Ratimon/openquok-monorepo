import fs from "node:fs";

function randomMediaId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** yargs may leave repeated flags as string | string[] */
export function toStringList(v: unknown): string[] {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) {
    return v.flatMap((x) => (typeof x === "string" && x.trim() ? [x.trim()] : []));
  }
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

/**
 * `-m`: comma-separated paths/URLs per flag; or a JSON array string
 * `[{"id":"…","path":"…"}]` (repeat `-m` for multiple blobs).
 */
export function buildMediaFromArgs(
  mediaArg: unknown,
  generateId: () => string = randomMediaId
): { id: string; path: string }[] {
  const rows = toStringList(mediaArg);
  const out: { id: string; path: string }[] = [];
  for (const row of rows) {
    const t = row.trim();
    if (t.startsWith("[") && t.endsWith("]")) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(t);
      } catch {
        throw new Error("media: invalid JSON array");
      }
      if (!Array.isArray(parsed)) throw new Error("media: JSON must be an array of {id, path}");
      for (const item of parsed) {
        if (!item || typeof item !== "object") continue;
        const id = (item as { id?: unknown }).id;
        const path = (item as { path?: unknown }).path;
        if (typeof id === "string" && id && typeof path === "string" && path) {
          out.push({ id, path });
        }
      }
    } else {
      for (const part of t.split(",").map((s) => s.trim()).filter(Boolean)) {
        out.push({ id: generateId(), path: part });
      }
    }
  }
  return out;
}

export function resolveCreateStatus(args: { status?: unknown; type?: unknown }): "draft" | "scheduled" {
  const raw = args.status ?? args.type;
  if (raw === "draft") return "draft";
  if (raw === "schedule" || raw === "scheduled") return "scheduled";
  return "scheduled";
}

/** `posts:status --status` (and `-s`): require draft | schedule | scheduled (no default). */
export function parsePostsStatusFlag(v: unknown): "draft" | "scheduled" {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error('status is required (use --status draft | schedule | scheduled, or -s)');
  }
  const raw = v.trim().toLowerCase();
  if (raw === "draft") return "draft";
  if (raw === "schedule" || raw === "scheduled") return "scheduled";
  throw new Error(`invalid status: expected draft, schedule, or scheduled (got ${JSON.stringify(v)})`);
}

export function getDataObjectFromApiEnvelope(parsed: unknown): Record<string, unknown> {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("unexpected API response");
  }
  const o = parsed as Record<string, unknown>;
  if (o.success !== true) {
    throw new Error("API returned success: false");
  }
  const data = o.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("API response missing data object");
  }
  return data as Record<string, unknown>;
}

/** `GET /public/posts/:postId` envelope → parent group UUID (for `posts:status`). */
export function getPostGroupFromSummaryEnvelope(parsed: unknown): string {
  const data = getDataObjectFromApiEnvelope(parsed);
  const pg = data.postGroup;
  if (typeof pg !== "string" || !pg.trim()) {
    throw new Error("post summary missing postGroup");
  }
  return pg.trim();
}

/**
 * Build a `PUT /public/posts/group/:id` body from `GET /public/posts/group/:id` data,
 * flipping only `status` while keeping `scheduledAt` aligned with `publishDateIso`.
 */
export function buildUpdatePostGroupBodyFromGetData(
  data: Record<string, unknown>,
  nextStatus: "draft" | "scheduled"
): Record<string, unknown> {
  const publishDateIso = data.publishDateIso;
  if (typeof publishDateIso !== "string" || !publishDateIso.trim()) {
    throw new Error("post group payload missing publishDateIso");
  }

  const integrationIds = data.integrationIds;
  if (!Array.isArray(integrationIds) || integrationIds.length === 0) {
    throw new Error("post group payload missing integrationIds");
  }

  const body = typeof data.body === "string" ? data.body : "";
  const isGlobal = typeof data.isGlobal === "boolean" ? data.isGlobal : true;

  const out: Record<string, unknown> = {
    scheduledAt: publishDateIso.trim(),
    status: nextStatus,
    body,
    integrationIds,
    isGlobal,
  };

  const bbi = data.bodiesByIntegrationId;
  if (bbi && typeof bbi === "object" && !Array.isArray(bbi) && Object.keys(bbi as object).length > 0) {
    out.bodiesByIntegrationId = { ...(bbi as Record<string, string>) };
  }

  const tagNames = data.tagNames;
  if (Array.isArray(tagNames) && tagNames.length) {
    const names = tagNames.filter((x): x is string => typeof x === "string" && x.length > 0);
    if (names.length) out.tagNames = names;
  }

  if ("repeatInterval" in data) {
    out.repeatInterval = data.repeatInterval;
  }

  const media = data.media;
  if (Array.isArray(media) && media.length) {
    const rows = media
      .filter((m): m is Record<string, unknown> => m !== null && typeof m === "object" && !Array.isArray(m))
      .map((m) => {
        const id = m.id;
        const path = m.path;
        if (typeof id !== "string" || !id || typeof path !== "string" || !path) return null;
        const row: Record<string, unknown> = { id, path };
        if (typeof m.bucket === "string" && m.bucket) row.bucket = m.bucket;
        return row;
      })
      .filter((x): x is Record<string, unknown> => x !== null);
    if (rows.length) out.media = rows;
  }

  const ps = data.providerSettingsByIntegrationId;
  if (ps && typeof ps === "object" && !Array.isArray(ps) && Object.keys(ps).length > 0) {
    out.providerSettingsByIntegrationId = ps;
  }

  return out;
}

/**
 * Load a create-post payload from disk for `posts:create --json`.
 * Root object must match `POST /public/posts` (e.g. `scheduledAt`, `status`, optional
 * `body`, `integrationIds`, `bodiesByIntegrationId`, `media`,
 * `providerSettingsByIntegrationId`, …). `organizationId` is removed if present.
 */
export function readCreatePayloadFromJsonFile(path: string): Record<string, unknown> {
  if (!fs.existsSync(path)) {
    throw new Error(`json file not found: ${path}`);
  }
  const text = fs.readFileSync(path, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`json file: invalid JSON (${msg})`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("json file: root must be a JSON object (same shape as POST /public/posts)");
  }
  const o = { ...(parsed as Record<string, unknown>) };
  delete o.organizationId;
  return o;
}

/**
 * Builds `providerSettingsByIntegrationId` from CLI flags.
 * Merge order per selected integration id: (1) `--providerSettingsByIntegrationId`
 * entries, (2) `--settings` merged on top, (3) when multiple `-c` segments exist,
 * a `replies` array is merged last (overwrites an existing `replies` key).
 */
export function mergeProviderSettingsForIntegrations(args: {
  integrationIds: string[];
  contentSegments: string[];
  delayMs: number;
  settingsJson?: unknown;
  explicitByIntegration?: unknown;
}): Record<string, Record<string, unknown>> | undefined {
  const { integrationIds, contentSegments, delayMs, settingsJson, explicitByIntegration } = args;

  let base: Record<string, Record<string, unknown>> = {};
  if (explicitByIntegration && typeof explicitByIntegration === "object" && !Array.isArray(explicitByIntegration)) {
    for (const [k, v] of Object.entries(explicitByIntegration as Record<string, unknown>)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        base[k] = { ...(v as Record<string, unknown>) };
      }
    }
  }

  const parsedSettings =
    settingsJson && typeof settingsJson === "object" && !Array.isArray(settingsJson)
      ? (settingsJson as Record<string, unknown>)
      : undefined;

  if (parsedSettings) {
    for (const id of integrationIds) {
      base[id] = { ...(base[id] ?? {}), ...parsedSettings };
    }
  }

  if (contentSegments.length > 1) {
    const gapMs = Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : 5000;
    const gapSec = Math.max(1, Math.floor(gapMs / 1000));
    const replies = contentSegments.slice(1).map((message, idx) => ({
      message,
      delaySeconds: gapSec * (idx + 1),
    }));
    for (const id of integrationIds) {
      base[id] = { ...(base[id] ?? {}), replies };
    }
  }

  return Object.keys(base).length ? base : undefined;
}
