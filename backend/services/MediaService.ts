import type { MediaListResult, MediaRepository, SaveMediaInformationDto } from "../repositories/MediaRepository";
import type { MediaLike } from "../utils/dtos/MediaDTO";

/**
 * Application layer for user media metadata and listing (storage-backed).
 */
export class MediaService {
    constructor(private readonly _mediaRepository: MediaRepository) {}

    getMedia(organizationId: string, page: number, pageSize: number): Promise<MediaListResult> {
        return this._mediaRepository.getMedia(organizationId, page, pageSize);
    }

    saveFile(params: {
        organizationId: string;
        name: string;
        path: string;
        virtualPath?: string;
        originalName?: string | null;
        fileSize?: number;
        type?: string;
    }): Promise<{ id: string; path: string; publicUrl: string | null }> {
        return this._mediaRepository.saveFile(params);
    }

    getMediaById(organizationId: string, id: string): Promise<MediaLike | null> {
        return this._mediaRepository.getMediaById(organizationId, id);
    }

    getMediaByPath(organizationId: string, path: string): Promise<MediaLike | null> {
        return this._mediaRepository.getMediaByPath(organizationId, path);
    }

    softDeleteMedia(organizationId: string, id: string): Promise<boolean> {
        return this._mediaRepository.softDeleteMedia(organizationId, id);
    }

    saveMediaInformation(
        organizationId: string,
        dto: SaveMediaInformationDto
    ): Promise<{ id: string; path: string; publicUrl: string | null }> {
        return this._mediaRepository.saveMediaInformation(organizationId, dto);
    }

    listAllMedia(organizationId: string) {
        return this._mediaRepository.listAllMedia(organizationId);
    }

    updateVirtualPaths(organizationId: string, updates: { id: string; virtualPath: string }[]) {
        return this._mediaRepository.updateVirtualPaths(organizationId, updates);
    }

    duplicateMedia(organizationId: string, sourceIds: string[], targetVirtualPath: string) {
        return this._mediaRepository.duplicateMedia(organizationId, sourceIds, targetVirtualPath);
    }

    renameMediaDisplayName(organizationId: string, id: string, originalName: string) {
        return this._mediaRepository.renameMediaDisplayName(organizationId, id, originalName);
    }

    listVirtualFolderPaths(organizationId: string) {
        return this._mediaRepository.listVirtualFolderPaths(organizationId);
    }

    createVirtualFolder(organizationId: string, path: string) {
        return this._mediaRepository.createVirtualFolder(organizationId, path);
    }

    deleteVirtualFolder(organizationId: string, path: string) {
        return this._mediaRepository.deleteVirtualFolder(organizationId, path);
    }
}
