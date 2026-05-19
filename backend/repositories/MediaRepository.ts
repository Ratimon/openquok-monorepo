import { config } from "../config/GlobalConfig";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaLike } from "../utils/dtos/MediaDTO";
import {
    isProtectedMediaVirtualFolder,
    normalizeMediaVirtualPath,
    resolveMediaVirtualPath,
} from "openquok-common";

import { DatabaseError } from "../errors/InfraError";

export type MediaListItemDto = {
    id: string;
    path: string;
    virtualPath: string;
    name: string;
    size: number;
    lastModified: string | null;
    publicUrl: string | null;
    kind: "image" | "video" | "audio" | "document" | "other";
    alt: string | null;
    thumbnail: string | null;
    /** Same derivation as `publicUrl` but for the poster object key (client must not guess R2 vs `/uploads`). */
    thumbnailPublicUrl: string | null;
    thumbnailTimestamp: number | null;
};

export type MediaListResult = {
    results: MediaListItemDto[];
    total: number;
    pages: number;
    page: number;
    pageSize: number;
};

export function publicUrlForObjectKey(key: string): string | null {
    const storage = config.storage as {
        provider?: string;
        r2?: { publicBaseUrl?: string };
    };
    const provider = String(storage.provider ?? "r2").toLowerCase();
    const server = config.server as { frontendDomainUrl?: string; backendDomainUrl?: string };
    const base =
        provider === "local"
            ? `${String(server.frontendDomainUrl ?? server.backendDomainUrl ?? "").trim().replace(/\/+$/, "")}/uploads`
            : storage.r2?.publicBaseUrl?.trim().replace(/\/+$/, "");
    if (!base) return null;
    return `${base}/${key.replace(/^\/+/, "")}`;
}

export function mediaKindForPath(path: string): MediaListItemDto["kind"] {
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"].includes(ext)) return "image";
    if (["mp4", "mov", "webm", "m4v", "mpeg"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
    if (["pdf"].includes(ext)) return "document";
    return "other";
}

const TABLE_MEDIA = "media";
const TABLE_MEDIA_VIRTUAL_FOLDERS = "media_virtual_folders";

function isMissingVirtualFoldersTable(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;
    const code = String(error.code ?? "");
    if (code === "PGRST205" || code === "42P01") return true;
    const msg = String(error.message ?? "").toLowerCase();
    return msg.includes("media_virtual_folders") && msg.includes("schema cache");
}

export type SaveMediaInformationDto = {
    id: string;
    alt?: string | null;
    thumbnail?: string | null;
    thumbnailTimestamp?: number | null;
};

/** Database-backed media repository (public.media). */
export class MediaRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getMedia(organizationId: string, page: number, pageSize: number): Promise<MediaListResult> {
        const safePageSize = Math.min(100, Math.max(1, Math.trunc(pageSize)));
        const safePage = Math.max(1, Math.trunc(page));
        const from = (safePage - 1) * safePageSize;
        const to = from + safePageSize - 1;

        const { count, error: countError } = await this.supabase
            .from(TABLE_MEDIA)
            .select("id", { count: "exact", head: true })
            .eq("organization_id", organizationId)
            .is("deleted_at", null);

        if (countError) {
            throw new DatabaseError(`Failed to count media: ${countError.message}`, {
                cause: countError,
                operation: "count",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }

        const total = count ?? 0;
        const pages = Math.max(1, Math.ceil(total / safePageSize));
        const boundedPage = Math.min(safePage, pages);
        const boundedFrom = (boundedPage - 1) * safePageSize;
        const boundedTo = boundedFrom + safePageSize - 1;

        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .select(
                "id, name, original_name, path, virtual_path, organization_id, created_at, updated_at, deleted_at, file_size, type, thumbnail, alt, thumbnail_timestamp"
            )
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .range(boundedFrom, boundedTo);

        if (error) {
            throw new DatabaseError(`Failed to list media: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }

        const rows = (data ?? []) as MediaLike[];
        const results: MediaListItemDto[] = rows.map((row) => ({
            id: row.id,
            path: row.path,
            virtualPath: resolveMediaVirtualPath(row.virtual_path),
            name: row.original_name || row.name,
            size: row.file_size ?? 0,
            lastModified: row.updated_at ?? null,
            publicUrl: publicUrlForObjectKey(row.path),
            kind: mediaKindForPath(row.path),
            alt: row.alt ?? null,
            thumbnail: row.thumbnail ?? null,
            thumbnailPublicUrl: row.thumbnail ? publicUrlForObjectKey(row.thumbnail) : null,
            thumbnailTimestamp: row.thumbnail_timestamp ?? null,
        }));

        return { results, total, pages, page: boundedPage, pageSize: safePageSize };
    }

    async saveFile(params: {
        organizationId: string;
        name: string;
        path: string;
        virtualPath?: string;
        originalName?: string | null;
        fileSize?: number;
        type?: string;
    }): Promise<{ id: string; path: string; publicUrl: string | null }> {
        const now = new Date().toISOString();
        const payload = {
            organization_id: params.organizationId,
            name: params.name,
            original_name: params.originalName ?? null,
            path: params.path,
            virtual_path: normalizeMediaVirtualPath(params.virtualPath),
            file_size: params.fileSize ?? 0,
            type: params.type ?? "image",
            created_at: now,
            updated_at: now,
        };

        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .insert(payload)
            .select("id, path")
            .single();

        if (error || !data) {
            throw new DatabaseError(`Failed to save media: ${error?.message ?? "no row"}`, {
                cause: error ?? undefined,
                operation: "insert",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }

        const row = data as { id: string; path: string };
        return { id: row.id, path: row.path, publicUrl: publicUrlForObjectKey(row.path) };
    }

    async getMediaById(organizationId: string, id: string): Promise<MediaLike | null> {
        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .select(
                "id, name, original_name, path, virtual_path, organization_id, created_at, updated_at, deleted_at, file_size, type, thumbnail, alt, thumbnail_timestamp"
            )
            .eq("organization_id", organizationId)
            .eq("id", id)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to fetch media: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }

        return (data as MediaLike) ?? null;
    }

    async getMediaByPath(organizationId: string, path: string): Promise<MediaLike | null> {
        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .select(
                "id, name, original_name, path, virtual_path, organization_id, created_at, updated_at, deleted_at, file_size, type, thumbnail, alt, thumbnail_timestamp"
            )
            .eq("organization_id", organizationId)
            .eq("path", path)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to fetch media: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }
        return (data as MediaLike) ?? null;
    }

    async softDeleteMedia(organizationId: string, id: string): Promise<boolean> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .update({ deleted_at: now, updated_at: now })
            .eq("organization_id", organizationId)
            .eq("id", id)
            .is("deleted_at", null)
            .select("id")
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to delete media: ${error.message}`, {
                cause: error,
                operation: "update",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }
        return data != null;
    }

    async saveMediaInformation(
        organizationId: string,
        dto: SaveMediaInformationDto
    ): Promise<{ id: string; path: string; publicUrl: string | null }> {
        const updated_at = new Date().toISOString();
        const payload: Record<string, unknown> = { updated_at };
        if (dto.alt !== undefined) payload.alt = dto.alt;
        if (dto.thumbnail !== undefined) payload.thumbnail = dto.thumbnail;
        if (dto.thumbnailTimestamp !== undefined) payload.thumbnail_timestamp = dto.thumbnailTimestamp;

        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .update(payload)
            .eq("organization_id", organizationId)
            .eq("id", dto.id)
            .select("id, path")
            .single();

        if (error || !data) {
            throw new DatabaseError(`Failed to update media info: ${error?.message ?? "no row"}`, {
                cause: error ?? undefined,
                operation: "update",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }

        const row = data as { id: string; path: string };
        return { id: row.id, path: row.path, publicUrl: publicUrlForObjectKey(row.path) };
    }

    async listAllMedia(organizationId: string): Promise<MediaListItemDto[]> {
        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .select(
                "id, name, original_name, path, virtual_path, organization_id, created_at, updated_at, deleted_at, file_size, type, thumbnail, alt, thumbnail_timestamp"
            )
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to list media tree: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }

        const rows = (data ?? []) as MediaLike[];
        return rows.map((row) => ({
            id: row.id,
            path: row.path,
            virtualPath: resolveMediaVirtualPath(row.virtual_path),
            name: row.original_name || row.name,
            size: row.file_size ?? 0,
            lastModified: row.updated_at ?? null,
            publicUrl: publicUrlForObjectKey(row.path),
            kind: mediaKindForPath(row.path),
            alt: row.alt ?? null,
            thumbnail: row.thumbnail ?? null,
            thumbnailPublicUrl: row.thumbnail ? publicUrlForObjectKey(row.thumbnail) : null,
            thumbnailTimestamp: row.thumbnail_timestamp ?? null,
        }));
    }

    async duplicateMedia(
        organizationId: string,
        sourceIds: string[],
        targetVirtualPath: string
    ): Promise<number> {
        const target = normalizeMediaVirtualPath(targetVirtualPath);
        const now = new Date().toISOString();
        let copied = 0;

        for (const mediaId of sourceIds) {
            const source = await this.getMediaById(organizationId, mediaId);
            if (!source) continue;

            const { data, error } = await this.supabase
                .from(TABLE_MEDIA)
                .insert({
                    organization_id: organizationId,
                    name: source.name,
                    original_name: source.original_name ?? null,
                    path: source.path,
                    virtual_path: target,
                    file_size: source.file_size ?? 0,
                    type: source.type ?? "image",
                    thumbnail: source.thumbnail ?? null,
                    alt: source.alt ?? null,
                    thumbnail_timestamp: source.thumbnail_timestamp ?? null,
                    created_at: now,
                    updated_at: now,
                })
                .select("id")
                .maybeSingle();

            if (error) {
                throw new DatabaseError(`Failed to copy media: ${error.message}`, {
                    cause: error,
                    operation: "insert",
                    resource: { type: "table", name: TABLE_MEDIA },
                });
            }
            if (data) copied += 1;
        }

        return copied;
    }

    async updateVirtualPaths(
        organizationId: string,
        updates: { id: string; virtualPath: string }[]
    ): Promise<number> {
        if (!updates.length) return 0;
        const now = new Date().toISOString();
        let changed = 0;
        for (const row of updates) {
            const { data, error } = await this.supabase
                .from(TABLE_MEDIA)
                .update({
                    virtual_path: normalizeMediaVirtualPath(row.virtualPath),
                    updated_at: now,
                })
                .eq("organization_id", organizationId)
                .eq("id", row.id)
                .is("deleted_at", null)
                .select("id")
                .maybeSingle();

            if (error) {
                throw new DatabaseError(`Failed to move media: ${error.message}`, {
                    cause: error,
                    operation: "update",
                    resource: { type: "table", name: TABLE_MEDIA },
                });
            }
            if (data) changed += 1;
        }
        return changed;
    }

    async listVirtualFolderPaths(organizationId: string): Promise<string[]> {
        const { data, error } = await this.supabase
            .from(TABLE_MEDIA_VIRTUAL_FOLDERS)
            .select("path")
            .eq("organization_id", organizationId)
            .order("path", { ascending: true });

        if (error) {
            if (isMissingVirtualFoldersTable(error)) {
                return [];
            }
            throw new DatabaseError(`Failed to list virtual folders: ${error.message}`, {
                cause: error,
                operation: "select",
                resource: { type: "table", name: TABLE_MEDIA_VIRTUAL_FOLDERS },
            });
        }

        return (data ?? []).map((row) => normalizeMediaVirtualPath(String((row as { path: string }).path)));
    }

    async createVirtualFolder(organizationId: string, path: string): Promise<boolean> {
        const normalized = normalizeMediaVirtualPath(path);
        const { data, error } = await this.supabase
            .from(TABLE_MEDIA_VIRTUAL_FOLDERS)
            .insert({ organization_id: organizationId, path: normalized })
            .select("id")
            .maybeSingle();

        if (error) {
            if (error.code === "23505") {
                return true;
            }
            if (isMissingVirtualFoldersTable(error)) {
                return false;
            }
            throw new DatabaseError(`Failed to create virtual folder: ${error.message}`, {
                cause: error,
                operation: "insert",
                resource: { type: "table", name: TABLE_MEDIA_VIRTUAL_FOLDERS },
            });
        }
        return data != null;
    }

    async deleteVirtualFolder(
        organizationId: string,
        path: string
    ): Promise<{ deleted: boolean; message: string }> {
        const normalized = normalizeMediaVirtualPath(path);

        if (isProtectedMediaVirtualFolder(normalized)) {
            return { deleted: false, message: "This folder cannot be deleted." };
        }

        const { data: mediaRows, error: mediaError } = await this.supabase
            .from(TABLE_MEDIA)
            .select("virtual_path")
            .eq("organization_id", organizationId)
            .is("deleted_at", null);

        if (mediaError) {
            throw new DatabaseError(`Failed to check folder contents: ${mediaError.message}`, {
                cause: mediaError,
                operation: "select",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }

        const hasMedia = (mediaRows ?? []).some((row) => {
            const vp = resolveMediaVirtualPath(String((row as { virtual_path: string }).virtual_path));
            return vp === normalized || vp.startsWith(`${normalized}/`);
        });
        if (hasMedia) {
            return { deleted: false, message: "Remove or move files out of this folder first." };
        }

        const childFolders = await this.listVirtualFolderPaths(organizationId);
        const hasChildFolder = childFolders.some(
            (folderPath) => folderPath !== normalized && folderPath.startsWith(`${normalized}/`)
        );
        if (hasChildFolder) {
            return { deleted: false, message: "Delete subfolders inside this folder first." };
        }

        const { data, error } = await this.supabase
            .from(TABLE_MEDIA_VIRTUAL_FOLDERS)
            .delete()
            .eq("organization_id", organizationId)
            .eq("path", normalized)
            .select("id")
            .maybeSingle();

        if (error) {
            if (isMissingVirtualFoldersTable(error)) {
                return { deleted: false, message: "Custom folders are not available yet." };
            }
            throw new DatabaseError(`Failed to delete virtual folder: ${error.message}`, {
                cause: error,
                operation: "delete",
                resource: { type: "table", name: TABLE_MEDIA_VIRTUAL_FOLDERS },
            });
        }

        if (!data) {
            return { deleted: false, message: "Folder not found or cannot be deleted." };
        }

        return { deleted: true, message: "Folder deleted." };
    }

    async renameMediaDisplayName(
        organizationId: string,
        id: string,
        originalName: string
    ): Promise<boolean> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_MEDIA)
            .update({ original_name: originalName, updated_at: now })
            .eq("organization_id", organizationId)
            .eq("id", id)
            .is("deleted_at", null)
            .select("id")
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to rename media: ${error.message}`, {
                cause: error,
                operation: "update",
                resource: { type: "table", name: TABLE_MEDIA },
            });
        }
        return data != null;
    }
}
