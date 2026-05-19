/** Default folder for library uploads, imports, and designs. */
export const MEDIA_VIRTUAL_GENERAL = "/General";

/** Parent folder for media attached from the post composer. */
export const MEDIA_VIRTUAL_POSTS = "/Posts";

/** Composer uploads when no publish date is set yet. */
export const MEDIA_VIRTUAL_POSTS_UNSCHEDULED = "/Posts/unscheduled";

/** Built-in library folders that cannot be removed from the tree. */
export const MEDIA_VIRTUAL_PROTECTED_FOLDERS = [
	MEDIA_VIRTUAL_GENERAL,
	MEDIA_VIRTUAL_POSTS,
	MEDIA_VIRTUAL_POSTS_UNSCHEDULED
] as const;

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Normalize a stored or UI folder path (always leading slash, no trailing slash except root). */
export function normalizeMediaVirtualPath(path: string | null | undefined): string {
	const raw = String(path ?? "").trim().replace(/\\/g, "/");
	if (!raw || raw === "/") return MEDIA_VIRTUAL_GENERAL;
	const withLead = raw.startsWith("/") ? raw : `/${raw}`;
	return withLead.replace(/\/+$/, "") || MEDIA_VIRTUAL_GENERAL;
}

/** Map legacy rows that still use `/` to the general library folder. */
export function resolveMediaVirtualPath(path: string | null | undefined): string {
	return normalizeMediaVirtualPath(path);
}

/**
 * Folder for composer uploads from a publish / schedule timestamp (UTC calendar date).
 * Uses `YYYY-MM-DD` under `/Posts`, or `/Posts/unscheduled` when missing/invalid.
 */
export function mediaVirtualPathForComposerUpload(publishDateIso?: string | null): string {
	if (!publishDateIso?.trim()) return MEDIA_VIRTUAL_POSTS_UNSCHEDULED;
	const ms = Date.parse(publishDateIso);
	if (!Number.isFinite(ms)) return MEDIA_VIRTUAL_POSTS_UNSCHEDULED;
	const d = new Date(ms);
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${MEDIA_VIRTUAL_POSTS}/${y}-${m}-${day}`;
}

/** Stable SVAR File Manager id: `{folder}/{mediaId}__{displayName}`. */
export function mediaFileManagerId(
	virtualPath: string,
	mediaId: string,
	displayName: string
): string {
	const folder = normalizeMediaVirtualPath(virtualPath);
	const safe = sanitizeMediaDisplayName(displayName);
	return `${folder}/${mediaId}__${safe}`;
}

/** User-facing file label from a file-manager id (`{folder}/{uuid}__{displayName}`). */
export function mediaFileManagerDisplayNameFromId(id: string): string {
	const normalized = String(id ?? "").replace(/\\/g, "/");
	const lastSlash = normalized.lastIndexOf("/");
	const filePart = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized;
	const sep = filePart.indexOf("__");
	if (sep > 0 && UUID_RE.test(filePart.slice(0, sep))) {
		return filePart.slice(sep + 2);
	}
	return filePart;
}

export function parseMediaFileManagerId(
	id: string
): { mediaId: string; virtualPath: string } | null {
	const normalized = String(id ?? "").replace(/\\/g, "/");
	const lastSlash = normalized.lastIndexOf("/");
	if (lastSlash < 0) return null;
	const virtualPath = normalizeMediaVirtualPath(normalized.slice(0, lastSlash));
	const filePart = normalized.slice(lastSlash + 1);
	const sep = filePart.indexOf("__");
	if (sep <= 0) return null;
	const mediaId = filePart.slice(0, sep);
	if (!UUID_RE.test(mediaId)) return null;
	return { mediaId, virtualPath };
}

/** True when the file-manager id is a folder path (not a `{folder}/{uuid}__{name}` file id). */
export function isMediaFileManagerFolderId(id: string): boolean {
	if (parseMediaFileManagerId(id)) return false;
	const normalized = String(id ?? "")
		.trim()
		.replace(/\\/g, "/");
	if (!normalized || normalized === "/") return false;
	return normalized.startsWith("/");
}

/** Whether a normalized virtual path is a built-in folder that must not be deleted. */
export function isProtectedMediaVirtualFolder(path: string): boolean {
	const normalized = normalizeMediaVirtualPath(path);
	return (MEDIA_VIRTUAL_PROTECTED_FOLDERS as readonly string[]).includes(normalized);
}

/** Target folder id from a SVAR folder path or file id. */
export function mediaVirtualPathFromFileManagerTarget(targetId: string): string {
	const parsed = parseMediaFileManagerId(targetId);
	if (parsed) return parsed.virtualPath;
	return normalizeMediaVirtualPath(targetId);
}

function sanitizeMediaDisplayName(name: string): string {
	const base = String(name ?? "file")
		.trim()
		.replace(/[/\\?%*:|"<>]/g, "-")
		.replace(/\s+/g, " ")
		.slice(0, 180);
	return base.length > 0 ? base : "file";
}
