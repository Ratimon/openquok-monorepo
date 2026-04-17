import type {
    MediaListResult,
    MediaRepository,
    MediaRow,
    SaveMediaInformationDto,
} from "../repositories/MediaRepository";

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

    getMediaById(organizationId: string, id: string): Promise<MediaRow | null> {
        return this._mediaRepository.getMediaById(organizationId, id);
    }

    getMediaByPath(organizationId: string, path: string): Promise<MediaRow | null> {
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
}
