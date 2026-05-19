import {
    MEDIA_VIRTUAL_GENERAL,
    MEDIA_VIRTUAL_POSTS,
    MEDIA_VIRTUAL_POSTS_UNSCHEDULED,
    mediaFileManagerId,
    normalizeMediaVirtualPath,
    resolveMediaVirtualPath,
} from "openquok-common";

import type { MediaListItemDto } from "../repositories/MediaRepository";

export type MediaTreeFileEntity = {
    id: string;
    type: "file" | "folder";
    size?: number;
    date?: Date;
    lazy?: boolean;
    mediaId?: string;
    /** User-facing label (SVAR derives `name` from `id`, which includes the media uuid). */
    displayName?: string;
    publicUrl?: string | null;
    kind?: MediaListItemDto["kind"];
};

function folderEntity(id: string, lazy = false): MediaTreeFileEntity {
    return {
        id,
        type: "folder",
        date: new Date(),
        ...(lazy ? { lazy: true } : {}),
    };
}

function ensureFolderPath(segments: string[], folders: Set<string>): void {
    let acc = "";
    for (const segment of segments) {
        acc = acc ? `${acc}/${segment}` : `/${segment}`;
        folders.add(acc);
    }
}

const DEFAULT_FOLDERS = [
    MEDIA_VIRTUAL_GENERAL,
    MEDIA_VIRTUAL_POSTS,
    MEDIA_VIRTUAL_POSTS_UNSCHEDULED,
];

/** Build a flat SVAR File Manager `data` array from workspace media rows. */
export function buildMediaTreeEntities(items: MediaListItemDto[]): MediaTreeFileEntity[] {
    const folderPaths = new Set<string>(DEFAULT_FOLDERS);

    for (const item of items) {
        const vp = resolveMediaVirtualPath(item.virtualPath);
        const parts = vp.split("/").filter(Boolean);
        ensureFolderPath(parts, folderPaths);
    }

    const entities: MediaTreeFileEntity[] = [];
    for (const folderId of [...folderPaths].sort()) {
        entities.push(folderEntity(folderId, folderId === MEDIA_VIRTUAL_POSTS));
    }

    for (const item of items) {
        const vp = resolveMediaVirtualPath(item.virtualPath);
        const displayName = item.name || item.path.split("/").pop() || "file";
        const id = mediaFileManagerId(vp, item.id, displayName);
        const date = item.lastModified ? new Date(item.lastModified) : new Date();
        entities.push({
            id,
            type: "file",
            size: item.size,
            date,
            mediaId: item.id,
            displayName,
            publicUrl: item.publicUrl,
            kind: item.kind,
        });
    }

    return entities;
}

export function normalizeMoveTargetVirtualPath(targetId: string): string {
    return normalizeMediaVirtualPath(targetId);
}
