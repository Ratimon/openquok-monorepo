import type { MediaService } from "../../services/MediaService";
import type { SubscriptionService } from "../../services/SubscriptionService";
import type { IUploadProvider } from "../../connections/upload/upload.interface";
import { publicUrlForObjectKey } from "../../repositories/MediaRepository";
import { UserValidationError } from "../../errors/UserError";
import { inferMediaMimeType, validateMediaFileUploadSize } from "openquok-common";

function isAllowedMediaMime(mimetype: string): boolean {
    const m = mimetype.toLowerCase();
    return (
        m.startsWith("image/") ||
        m.startsWith("video/") ||
        m === "application/pdf" ||
        m.startsWith("audio/")
    );
}

export type ProgrammaticMediaUploadDeps = {
    mediaService: MediaService;
    subscriptionService: SubscriptionService;
    uploadProvider: IUploadProvider;
};

/**
 * Fetches a public URL and stores it as workspace media (programmatic / MCP path).
 */
export async function uploadProgrammaticMediaFromUrl(
    organizationId: string,
    url: string,
    deps: ProgrammaticMediaUploadDeps
): Promise<{ id: string; path: string }> {
    const trimmed = url.trim();
    if (!trimmed) {
        throw new UserValidationError("url is required");
    }
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new UserValidationError("Only http(s) URLs are supported");
        }
    } catch (err) {
        if (err instanceof UserValidationError) throw err;
        throw new UserValidationError("Invalid URL");
    }

    const response = await fetch(trimmed);
    if (!response.ok) {
        throw new UserValidationError(`Failed to fetch URL (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const headerType = (response.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
    const pathPart = trimmed.split("?")[0] ?? "";
    const ext = pathPart.includes(".") ? pathPart.split(".").pop()!.toLowerCase() : "";
    const extToMime: Record<string, string> = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp",
        mp4: "video/mp4",
        mov: "video/quicktime",
        webm: "video/webm",
        pdf: "application/pdf",
    };
    const rawMime = (headerType || extToMime[ext] || "image/jpeg").toLowerCase();
    const finalExt =
        ext ||
        (rawMime === "image/jpeg"
            ? "jpg"
            : rawMime.startsWith("image/") || rawMime.startsWith("video/")
              ? rawMime.split("/")[1]!
              : "bin");
    const originalname = `upload.${finalExt}`;
    const mimetype = inferMediaMimeType(originalname, rawMime);

    if (!isAllowedMediaMime(mimetype)) {
        throw new UserValidationError("Unsupported media type");
    }

    const uploadSizeError = validateMediaFileUploadSize(buffer.length, mimetype, "backend");
    if (uploadSizeError) {
        throw new UserValidationError(uploadSizeError);
    }

    await deps.subscriptionService.assertMediaStorageAvailable(organizationId, buffer.length, undefined);

    const out = await deps.uploadProvider.uploadFile({
        organizationId,
        buffer,
        originalName: originalname,
        contentType: mimetype,
    });

    const saved = await deps.mediaService.saveFile({
        organizationId,
        name: out.path.split("/").pop() ?? out.path,
        path: out.path,
        originalName: originalname,
        fileSize: buffer.length,
        type: mimetype.startsWith("video/") ? "video" : "image",
    });

    void publicUrlForObjectKey(out.path);
    return { id: saved.id, path: saved.path };
}
