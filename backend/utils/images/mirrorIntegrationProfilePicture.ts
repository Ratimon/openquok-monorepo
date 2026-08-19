import type { StorageSupabaseRepository } from "../../repositories/StorageSupabaseRepository";
import type { FetchedExternalImage } from "./externalImageFetch";
import { isExternalCdnProfilePictureUrl } from "./allowedExternalImageHosts";
import { fetchAllowlistedExternalImage } from "./externalImageFetch";
import { logger } from "../Logger";

/** Storage object key prefix in the `avatars` bucket for mirrored integration profile photos. */
export const INTEGRATION_PROFILE_STORAGE_PREFIX = "integration-profiles";

export function integrationProfileStoragePath(organizationId: string, internalId: string): string {
    const safeOrg = organizationId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeInternal = internalId.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `${INTEGRATION_PROFILE_STORAGE_PREFIX}/${safeOrg}/${safeInternal}.jpg`;
}

export function isIntegrationProfileStoragePath(picture: string | null | undefined): boolean {
    return (
        typeof picture === "string" &&
        picture.startsWith(`${INTEGRATION_PROFILE_STORAGE_PREFIX}/`)
    );
}

function contentTypeToExtension(contentType: string): string {
    const normalized = contentType.toLowerCase();
    if (normalized.includes("png")) return "png";
    if (normalized.includes("webp")) return "webp";
    if (normalized.includes("gif")) return "gif";
    return "jpg";
}

/**
 * Downloads an allowlisted CDN profile picture and stores it in Supabase (`avatars` bucket).
 * Returns the storage object key on success, or `null` when mirroring is skipped or fails.
 */
export async function mirrorIntegrationProfilePicture(params: {
    storageRepository: StorageSupabaseRepository;
    organizationId: string;
    internalId: string;
    remoteUrl: string | null | undefined;
    /** Provider API download when hotlinked CDN URLs keep returning 403. */
    downloadBytes?: () => Promise<FetchedExternalImage | null>;
}): Promise<string | null> {
    const { storageRepository, organizationId, internalId } = params;
    const remoteUrl = typeof params.remoteUrl === "string" ? params.remoteUrl.trim() : "";

    const tryFetch = async (url: string) => {
        try {
            return await fetchAllowlistedExternalImage(url);
        } catch {
            return null;
        }
    };

    let fetched = remoteUrl && isExternalCdnProfilePictureUrl(remoteUrl) ? await tryFetch(remoteUrl) : null;
    if (!fetched && params.downloadBytes) {
        try {
            fetched = (await params.downloadBytes()) ?? null;
        } catch {
            fetched = null;
        }
    }

    if (!fetched) {
        logger.debug({
            msg: "integration profile picture mirror skipped (CDN fetch failed)",
            organizationId,
            internalId,
        });
        return null;
    }

    const ext = contentTypeToExtension(fetched.contentType);
    const basePath = integrationProfileStoragePath(organizationId, internalId);
    const objectPath = ext === "jpg" ? basePath : basePath.replace(/\.jpg$/, `.${ext}`);

    try {
        const { error } = await storageRepository.uploadIntegrationProfilePicture(
            objectPath,
            fetched.buffer,
            fetched.contentType
        );
        if (error) {
            logger.debug({
                msg: "integration profile picture mirror upload failed",
                organizationId,
                internalId,
                error: error.message,
            });
            return null;
        }
        return objectPath;
    } catch (err) {
        logger.debug({
            msg: "integration profile picture mirror upload threw",
            organizationId,
            internalId,
            error: err instanceof Error ? err.message : String(err),
        });
        return null;
    }
}

/** Prefer a mirrored storage path; fall back to the remote CDN URL when mirroring fails. */
export async function resolveIntegrationPictureForStorage(params: {
    storageRepository: StorageSupabaseRepository;
    organizationId: string;
    internalId: string;
    picture: string | null | undefined;
    downloadBytes?: () => Promise<FetchedExternalImage | null>;
}): Promise<string | null> {
    const raw = typeof params.picture === "string" ? params.picture.trim() : "";
    if (!raw) return null;
    if (isIntegrationProfileStoragePath(raw)) return raw;

    const mirrored = await mirrorIntegrationProfilePicture({
        storageRepository: params.storageRepository,
        organizationId: params.organizationId,
        internalId: params.internalId,
        remoteUrl: raw,
        downloadBytes: params.downloadBytes,
    });
    return mirrored ?? raw;
}
