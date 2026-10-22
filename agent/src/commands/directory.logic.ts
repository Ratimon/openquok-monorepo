import fs from "node:fs";

export type DirectoryProfileRow = {
  id?: string;
  parentProfileId?: string | null;
  profileKind?: string;
  [key: string]: unknown;
};

export function parseDirectorySeoHistoryDays(input: unknown): number {
  const raw = typeof input === "number" ? input : Number(input);
  if (!Number.isInteger(raw) || raw < 1 || raw > 366) {
    throw new Error("days must be an integer from 1 to 366");
  }
  return raw;
}

/** Client-side filter for `directory:profiles:list --main-only` (no `parentProfileId`). */
export function filterDirectoryProfilesListResponse(response: unknown, mainOnly: boolean): unknown {
  if (!mainOnly) return response;
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return response;
  }
  const envelope = response as { success?: boolean; data?: unknown };
  if (!Array.isArray(envelope.data)) return response;
  const filtered = envelope.data.filter((row) => isMainProfileRow(row));
  return { ...envelope, data: filtered };
}

export function isMainProfileRow(row: unknown): boolean {
  if (!row || typeof row !== "object") return false;
  const parent = (row as DirectoryProfileRow).parentProfileId;
  return parent === null || parent === undefined;
}

export function readJsonObjectFromFile(filePath: string, label = "json"): Record<string, unknown> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} file not found: ${filePath}`);
  }
  const text = fs.readFileSync(filePath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`${label} file: invalid JSON (${msg})`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} file: root must be a JSON object`);
  }
  const o = { ...(parsed as Record<string, unknown>) };
  delete o.organizationId;
  return o;
}

function optionalString(input: unknown): string | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  return t ? t : undefined;
}

function optionalNullableString(input: unknown): string | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (typeof input !== "string") return undefined;
  const t = input.trim();
  return t ? t : null;
}

/**
 * Build `POST /public/directory-launch/profiles` body from flags and/or `--json` file.
 * `organizationId` is always stripped.
 */
export function buildCreateDirectoryProfileBody(args: {
  name?: unknown;
  tagline?: unknown;
  description?: unknown;
  websiteUrl?: unknown;
  logoUrl?: unknown;
  customerGroupId?: unknown;
  profileData?: unknown;
  json?: unknown;
}): Record<string, unknown> {
  let base: Record<string, unknown> = {};
  if (typeof args.json === "string" && args.json.trim()) {
    base = readJsonObjectFromFile(args.json.trim(), "--json");
  }

  const name = optionalString(args.name) ?? optionalString(base.name);
  if (!name) {
    throw new Error("name is required (use --name or --json with a name field)");
  }

  const body: Record<string, unknown> = { ...base, name };

  const tagline = optionalNullableString(args.tagline);
  if (tagline !== undefined) body.tagline = tagline;
  const description = optionalNullableString(args.description);
  if (description !== undefined) body.description = description;
  const websiteUrl = optionalNullableString(args.websiteUrl);
  if (websiteUrl !== undefined) body.websiteUrl = websiteUrl;
  const logoUrl = optionalNullableString(args.logoUrl);
  if (logoUrl !== undefined) body.logoUrl = logoUrl;

  const customerGroupId = optionalNullableString(args.customerGroupId);
  if (customerGroupId !== undefined) {
    body.integrationCustomerId = customerGroupId;
  }

  if (args.profileData !== undefined) {
    let parsed: unknown = args.profileData;
    if (typeof args.profileData === "string") {
      try {
        parsed = JSON.parse(args.profileData);
      } catch {
        throw new Error("profile-data must be valid JSON");
      }
    }
    if (parsed !== null && (typeof parsed !== "object" || Array.isArray(parsed))) {
      throw new Error("profile-data must be a JSON object");
    }
    body.profileData = parsed as Record<string, unknown>;
  }

  delete body.organizationId;
  return body;
}

/** Build `PATCH /public/directory-launch/profiles/:id` body from flags and/or `--json` file. */
export function buildUpdateDirectoryProfileBody(args: {
  name?: unknown;
  tagline?: unknown;
  description?: unknown;
  websiteUrl?: unknown;
  logoUrl?: unknown;
  customerGroupId?: unknown;
  profileData?: unknown;
  json?: unknown;
}): Record<string, unknown> {
  let body: Record<string, unknown> = {};
  if (typeof args.json === "string" && args.json.trim()) {
    body = readJsonObjectFromFile(args.json.trim(), "--json");
  }

  const name = optionalString(args.name);
  if (name) body.name = name;
  const tagline = optionalNullableString(args.tagline);
  if (tagline !== undefined) body.tagline = tagline;
  const description = optionalNullableString(args.description);
  if (description !== undefined) body.description = description;
  const websiteUrl = optionalNullableString(args.websiteUrl);
  if (websiteUrl !== undefined) body.websiteUrl = websiteUrl;
  const logoUrl = optionalNullableString(args.logoUrl);
  if (logoUrl !== undefined) body.logoUrl = logoUrl;
  const customerGroupId = optionalNullableString(args.customerGroupId);
  if (customerGroupId !== undefined) body.integrationCustomerId = customerGroupId;

  if (args.profileData !== undefined) {
    let parsed: unknown = args.profileData;
    if (typeof args.profileData === "string") {
      try {
        parsed = JSON.parse(args.profileData);
      } catch {
        throw new Error("profile-data must be valid JSON");
      }
    }
    if (parsed !== null && (typeof parsed !== "object" || Array.isArray(parsed))) {
      throw new Error("profile-data must be a JSON object");
    }
    body.profileData = parsed as Record<string, unknown>;
  }

  if (!Object.keys(body).length) {
    throw new Error("provide at least one field to update (--json or flags such as --name)");
  }

  delete body.organizationId;
  return body;
}

export function buildEnsureVariantBody(args: {
  siteKey?: unknown;
  name?: unknown;
}): { directorySiteKey: string; name?: string } {
  const directorySiteKey = optionalString(args.siteKey);
  if (!directorySiteKey) {
    throw new Error("site-key is required (--site-key)");
  }
  const name = optionalString(args.name);
  return name ? { directorySiteKey, name } : { directorySiteKey };
}
