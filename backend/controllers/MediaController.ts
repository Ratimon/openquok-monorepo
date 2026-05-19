import type { Request, Response, NextFunction } from "express";
import type { StorageR2Repository } from "../repositories/StorageR2Repository";
import type { MediaService } from "../services/MediaService";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { ProgrammaticAuthRequest } from "../middlewares/programmaticAuth";
import type { IUploadProvider } from "../connections/upload/upload.interface";

import { publicUrlForObjectKey } from "../repositories/MediaRepository";
import { makeId } from "../utils/make.is";
import { buildMediaTreeEntities } from "../utils/mediaTreeBuilder";

import { AuthError } from "../errors/AuthError";
import { UserValidationError } from "../errors/UserError";
import {
    MAX_MEDIA_UPLOAD_BYTES,
    mediaVirtualPathFromFileManagerTarget,
    normalizeMediaVirtualPath,
    parseMediaFileManagerId,
} from "openquok-common";

function readVirtualPath(body: unknown): string | undefined {
    const raw =
        typeof (body as any)?.virtualPath === "string"
            ? String((body as any).virtualPath)
            : typeof (body as any)?.virtual_path === "string"
              ? String((body as any).virtual_path)
              : "";
    return raw.trim() ? normalizeMediaVirtualPath(raw) : undefined;
}

function isAllowedMediaMime(mimetype: string): boolean {
    const m = mimetype.toLowerCase();
    return (
        m.startsWith("image/") ||
        m.startsWith("video/") ||
        m === "application/pdf" ||
        m.startsWith("audio/")
    );
}

export class MediaController {
    constructor(
        private readonly mediaService: MediaService,
        private readonly storageR2Repository: StorageR2Repository,
        private readonly uploadProvider: IUploadProvider
    ) {}

    private async uploadToStorage(params: {
        organizationId: string;
        file: { buffer: Buffer; originalname: string; mimetype: string };
    }): Promise<{ filePath: string; publicUrl: string | null }> {
        const { organizationId, file } = params;

        if (!isAllowedMediaMime(file.mimetype || "")) {
            throw new UserValidationError("Unsupported media type");
        }

        const out = await this.uploadProvider.uploadFile({
            organizationId,
            buffer: file.buffer,
            originalName: file.originalname,
            contentType: file.mimetype || "application/octet-stream",
        });

        return { filePath: out.path, publicUrl: out.publicUrl ?? publicUrlForObjectKey(out.path) };
    }

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const organizationId = typeof req.query.organizationId === "string" ? req.query.organizationId : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId query parameter is required");
            }

            const rawPage = Number(req.query.page ?? 1);
            const rawPageSize = Number(req.query.pageSize ?? 24);
            const page = Number.isFinite(rawPage) ? Math.max(1, Math.trunc(rawPage)) : 1;
            const pageSize = Number.isFinite(rawPageSize)
                ? Math.min(100, Math.max(1, Math.trunc(rawPageSize)))
                : 24;

            const data = await this.mediaService.getMedia(organizationId, page, pageSize);

            res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    tree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const organizationId = typeof req.query.organizationId === "string" ? req.query.organizationId : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId query parameter is required");
            }

            const items = await this.mediaService.listAllMedia(organizationId);
            const usedBytes = items.reduce((sum, row) => sum + (row.size ?? 0), 0);
            const files = buildMediaTreeEntities(items);

            res.status(200).json({
                success: true,
                data: {
                    files,
                    drive: {
                        used: usedBytes,
                        total: Math.max(usedBytes, 5_368_709_120),
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    };

    move = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const organizationId = typeof req.body?.organizationId === "string" ? String(req.body.organizationId) : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId is required");
            }

            const ids = Array.isArray(req.body?.ids) ? (req.body.ids as unknown[]) : [];
            const targetRaw = typeof req.body?.target === "string" ? String(req.body.target) : "";
            if (!ids.length || !targetRaw.trim()) {
                throw new UserValidationError("ids and target are required");
            }

            const targetVirtualPath = mediaVirtualPathFromFileManagerTarget(targetRaw);
            const updates: { id: string; virtualPath: string }[] = [];
            for (const rawId of ids) {
                const idStr = String(rawId ?? "");
                const parsed = parseMediaFileManagerId(idStr);
                if (!parsed) continue;
                updates.push({ id: parsed.mediaId, virtualPath: targetVirtualPath });
            }

            if (!updates.length) {
                throw new UserValidationError("No movable files in selection");
            }

            const moved = await this.mediaService.updateVirtualPaths(organizationId, updates);
            res.status(200).json({ success: true, data: { moved } });
        } catch (error) {
            next(error);
        }
    };

    copy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const organizationId = typeof req.body?.organizationId === "string" ? String(req.body.organizationId) : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId is required");
            }

            const ids = Array.isArray(req.body?.ids) ? (req.body.ids as unknown[]) : [];
            const targetRaw = typeof req.body?.target === "string" ? String(req.body.target) : "";
            if (!ids.length || !targetRaw.trim()) {
                throw new UserValidationError("ids and target are required");
            }

            const targetVirtualPath = mediaVirtualPathFromFileManagerTarget(targetRaw);
            const mediaIds: string[] = [];
            for (const rawId of ids) {
                const idStr = String(rawId ?? "");
                const parsed = parseMediaFileManagerId(idStr);
                if (!parsed) continue;
                mediaIds.push(parsed.mediaId);
            }

            if (!mediaIds.length) {
                throw new UserValidationError("No copyable files in selection");
            }

            const copied = await this.mediaService.duplicateMedia(
                organizationId,
                mediaIds,
                targetVirtualPath
            );
            res.status(200).json({ success: true, data: { copied } });
        } catch (error) {
            next(error);
        }
    };

    rename = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const organizationId = typeof req.body?.organizationId === "string" ? String(req.body.organizationId) : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId is required");
            }

            const fileManagerId = typeof req.body?.id === "string" ? String(req.body.id) : "";
            const name = typeof req.body?.name === "string" ? String(req.body.name).trim() : "";
            if (!fileManagerId || !name) {
                throw new UserValidationError("id and name are required");
            }

            const parsed = parseMediaFileManagerId(fileManagerId);
            if (!parsed) {
                throw new UserValidationError("Invalid file id");
            }

            const ok = await this.mediaService.renameMediaDisplayName(organizationId, parsed.mediaId, name);
            if (!ok) {
                throw new UserValidationError("Media not found");
            }

            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Upload user media to R2. Field name: `mediaFile` (multipart).
     * Auth user id prefixes the object key so objects stay scoped to the uploading user.
     */
    upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            if (!req.file) {
                throw new UserValidationError("Media file is required");
            }
            const organizationId = typeof (req.body as any)?.organizationId === "string" ? String((req.body as any).organizationId) : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId is required");
            }

            const file = req.file as { buffer: Buffer; originalname: string; mimetype: string };
            const { filePath, publicUrl } = await this.uploadToStorage({ organizationId, file });

            const saved = await this.mediaService.saveFile({
                organizationId,
                name: filePath.split("/").pop() ?? filePath,
                path: filePath,
                virtualPath: readVirtualPath(req.body),
                originalName: file.originalname,
                fileSize: (file as any).size ?? 0,
                type: file.mimetype?.startsWith("video/") ? "video" : "image",
            });

            res.status(200).json({
                success: true,
                data: {
                    filePath: saved.path,
                    ...(saved.publicUrl ? { publicUrl: saved.publicUrl } : publicUrl ? { publicUrl } : {}),
                    id: saved.id,
                },
                message: "Media uploaded successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Multipart helpers for S3-compatible uploaders (client obtains presigned URLs per part).
     * Route: POST `/api/v1/media/:endpoint` with JSON body.
     */
    multipart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) throw new UserValidationError("Authentication required");

            const endpoint = String((req.params as any)?.endpoint ?? "");
            const organizationId =
                typeof (req.body as any)?.organizationId === "string" ? String((req.body as any).organizationId) : "";
            if (!organizationId.trim()) throw new UserValidationError("organizationId is required");

            if (endpoint === "create-multipart-upload") {
                const file = (req.body as any)?.file;
                const contentType = String((req.body as any)?.contentType ?? "");
                const fileHash =
                    typeof (req.body as any)?.fileHash === "string" ? String((req.body as any).fileHash) : undefined;
                const fileName = typeof file?.name === "string" ? file.name : "";
                const ext = fileName.includes(".") ? `.${fileName.split(".").pop()}` : "";
                const key = `${makeId(20)}${ext || ""}`;
                const out = await this.storageR2Repository.createMultipartUpload({ key, contentType, fileHash });
                res.status(200).json(out);
                return;
            }

            if (endpoint === "prepare-upload-parts") {
                const partData = (req.body as any)?.partData;
                const key = String(partData?.key ?? "");
                const uploadId = String(partData?.uploadId ?? "");
                const parts = Array.isArray(partData?.parts) ? partData.parts : [];
                const out = await this.storageR2Repository.prepareUploadParts({
                    key,
                    uploadId,
                    parts: parts.map((p: any) => ({ number: Number(p?.number) })),
                });
                res.status(200).json(out);
                return;
            }

            if (endpoint === "sign-part") {
                const key = String((req.body as any)?.key ?? "");
                const uploadId = String((req.body as any)?.uploadId ?? "");
                const partNumber = Number.parseInt(String((req.body as any)?.partNumber ?? "0"), 10);
                const out = await this.storageR2Repository.signPart({ key, uploadId, partNumber });
                res.status(200).json(out);
                return;
            }

            if (endpoint === "list-parts") {
                const key = String((req.body as any)?.key ?? "");
                const uploadId = String((req.body as any)?.uploadId ?? "");
                const out = await this.storageR2Repository.listParts({ key, uploadId });
                res.status(200).json(out);
                return;
            }

            if (endpoint === "abort-multipart-upload") {
                const key = String((req.body as any)?.key ?? "");
                const uploadId = String((req.body as any)?.uploadId ?? "");
                const out = await this.storageR2Repository.abortMultipartUpload({ key, uploadId });
                res.status(200).json(out);
                return;
            }

            if (endpoint === "complete-multipart-upload") {
                const key = String((req.body as any)?.key ?? "");
                const uploadId = String((req.body as any)?.uploadId ?? "");
                const parts = Array.isArray((req.body as any)?.parts) ? (req.body as any).parts : [];
                const completed = await this.storageR2Repository.completeMultipartUpload({
                    key,
                    uploadId,
                    parts: parts.map((p: any) => ({
                        ETag: String(p?.ETag ?? ""),
                        PartNumber: Number(p?.PartNumber ?? 0),
                    })),
                    publicBaseUrl: null,
                });

                const originalName =
                    typeof (req.body as any)?.file?.name === "string" ? String((req.body as any).file.name) : undefined;
                const saved = await this.mediaService.saveFile({
                    organizationId,
                    name: key.split("/").pop() ?? key,
                    path: key,
                    virtualPath: readVirtualPath(req.body),
                    originalName: originalName ?? null,
                    fileSize: Number((req.body as any)?.file?.size ?? 0) || 0,
                    type:
                        typeof (req.body as any)?.contentType === "string" &&
                        String((req.body as any).contentType).startsWith("video/")
                            ? "video"
                            : "image",
                });

                res.status(200).json({ ...completed, saved });
                return;
            }

            res.status(404).end();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Upload via multipart field `file` (client compatibility). Mirrors `/upload`, but includes `originalName`.
     */
    uploadServer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            const authUid = authUser?.id;

            if (!req.file) {
                throw new UserValidationError("Media file is required");
            }
            if (!authUid) {
                throw new UserValidationError("Authentication required");
            }

            const file = req.file as { buffer: Buffer; originalname: string; mimetype: string };
            const organizationId = typeof (req.body as any)?.organizationId === "string" ? String((req.body as any).organizationId) : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId is required");
            }

            const { filePath, publicUrl } = await this.uploadToStorage({ organizationId, file });

            const saved = await this.mediaService.saveFile({
                organizationId,
                name: filePath.split("/").pop() ?? filePath,
                path: filePath,
                virtualPath: readVirtualPath(req.body),
                originalName: file.originalname,
                fileSize: (file as any).size ?? 0,
                type: file.mimetype?.startsWith("video/") ? "video" : "image",
            });

            res.status(200).json({
                success: true,
                data: {
                    filePath: saved.path,
                    originalName: file.originalname,
                    ...(saved.publicUrl ? { publicUrl: saved.publicUrl } : publicUrl ? { publicUrl } : {}),
                    id: saved.id,
                },
                message: "Media uploaded successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Programmatic URL upload (`POST {api.prefix}/public/upload-from-url`). Organization from API key.
     * Fetches the URL server-side, infers a mime type, and stores it through {@link uploadToStorage}
     * just like the multipart `POST /public/upload` route.
     */
    uploadProgrammaticFromUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organization = (req as ProgrammaticAuthRequest).organization;
            if (!organization?.id?.trim()) {
                throw new UserValidationError("Organization required");
            }

            const url = typeof (req.body as any)?.url === "string" ? String((req.body as any).url).trim() : "";
            if (!url) {
                throw new UserValidationError("url is required");
            }
            try {
                const parsed = new URL(url);
                if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                    throw new UserValidationError("Only http(s) URLs are supported");
                }
            } catch {
                throw new UserValidationError("Invalid URL");
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new UserValidationError(`Failed to fetch URL (${response.status})`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const headerType = (response.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
            const pathPart = url.split("?")[0] ?? "";
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
            const mimetype = (headerType || extToMime[ext] || "image/jpeg").toLowerCase();
            const finalExt =
                ext ||
                (mimetype === "image/jpeg"
                    ? "jpg"
                    : mimetype.startsWith("image/") || mimetype.startsWith("video/")
                      ? mimetype.split("/")[1]!
                      : "bin");

            const file = { buffer, originalname: `upload.${finalExt}`, mimetype };

            const organizationId = organization.id;
            const { filePath, publicUrl } = await this.uploadToStorage({ organizationId, file });

            const saved = await this.mediaService.saveFile({
                organizationId,
                name: filePath.split("/").pop() ?? filePath,
                path: filePath,
                virtualPath: readVirtualPath(req.body),
                originalName: file.originalname,
                fileSize: buffer.length,
                type: file.mimetype.startsWith("video/") ? "video" : "image",
            });

            res.status(200).json({
                success: true,
                data: {
                    filePath: saved.path,
                    originalName: file.originalname,
                    ...(saved.publicUrl ? { publicUrl: saved.publicUrl } : publicUrl ? { publicUrl } : {}),
                    id: saved.id,
                },
                message: "Media uploaded successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Programmatic upload (`POST {api.prefix}/public/upload`). Organization from API key / OAuth app token.
     * Multipart field name: `file` (same as `/media/upload-server` for session users).
     */
    uploadProgrammatic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organization = (req as ProgrammaticAuthRequest).organization;
            if (!organization?.id?.trim()) {
                throw new UserValidationError("Organization required");
            }
            if (!req.file) {
                throw new UserValidationError("Media file is required");
            }

            const raw = req.file as { buffer: Buffer; originalname: string; mimetype: string };
            let mimetype = (raw.mimetype ?? "").trim();
            if (!mimetype) {
                const ext = (raw.originalname ?? "").split(".").pop()?.toLowerCase() ?? "";
                const map: Record<string, string> = {
                    png: "image/png",
                    jpg: "image/jpeg",
                    jpeg: "image/jpeg",
                    gif: "image/gif",
                    webp: "image/webp",
                };
                mimetype = map[ext] || "application/octet-stream";
            }
            const file = { ...raw, mimetype };

            const organizationId = organization.id;
            const { filePath, publicUrl } = await this.uploadToStorage({ organizationId, file });

            const saved = await this.mediaService.saveFile({
                organizationId,
                name: filePath.split("/").pop() ?? filePath,
                path: filePath,
                virtualPath: readVirtualPath(req.body),
                originalName: file.originalname,
                fileSize: (file as any).size ?? 0,
                type: file.mimetype?.startsWith("video/") ? "video" : "image",
            });

            res.status(200).json({
                success: true,
                data: {
                    filePath: saved.path,
                    originalName: file.originalname,
                    ...(saved.publicUrl ? { publicUrl: saved.publicUrl } : publicUrl ? { publicUrl } : {}),
                    id: saved.id,
                },
                message: "Media uploaded successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Upload via multipart field `file`. If `preventSave=true`, return only `{ path }` for compatibility.
     */
    uploadSimple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            const authUid = authUser?.id;

            if (!req.file) {
                throw new UserValidationError("Media file is required");
            }
            if (!authUid) {
                throw new UserValidationError("Authentication required");
            }

            const preventSave =
                typeof (req.body as any)?.preventSave === "string"
                    ? String((req.body as any).preventSave).toLowerCase() === "true"
                    : Boolean((req.body as any)?.preventSave);

            const file = req.file as { buffer: Buffer; originalname: string; mimetype: string };
            const organizationId = typeof (req.body as any)?.organizationId === "string" ? String((req.body as any).organizationId) : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId is required");
            }

            const { filePath, publicUrl } = await this.uploadToStorage({ organizationId, file });

            if (preventSave) {
                res.status(200).json({
                    success: true,
                    data: {
                        path: filePath,
                        filePath,
                        ...(publicUrl ? { publicUrl } : {}),
                    },
                    message: "Media uploaded successfully",
                });
                return;
            }

            const saved = await this.mediaService.saveFile({
                organizationId,
                name: filePath.split("/").pop() ?? filePath,
                path: filePath,
                virtualPath: readVirtualPath(req.body),
                originalName: file.originalname,
                fileSize: (file as any).size ?? 0,
                type: file.mimetype?.startsWith("video/") ? "video" : "image",
            });

            res.status(200).json({
                success: true,
                data: {
                    filePath: saved.path,
                    originalName: file.originalname,
                    ...(saved.publicUrl ? { publicUrl: saved.publicUrl } : publicUrl ? { publicUrl } : {}),
                    id: saved.id,
                },
                message: "Media uploaded successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const organizationId = typeof (req.body as any)?.organizationId === "string" ? String((req.body as any).organizationId) : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId is required");
            }

            const { id, path: objectPath } = (req.body ?? {}) as { id?: string; path?: string };
            const mediaRow = id
                ? await this.mediaService.getMediaById(organizationId, id)
                : objectPath
                  ? await this.mediaService.getMediaByPath(organizationId, objectPath)
                  : null;

            if (!mediaRow) {
                throw new AuthError("You do not have access to this media object", 403);
            }

            await this.uploadProvider.deleteObject(mediaRow.path);
            await this.mediaService.softDeleteMedia(organizationId, mediaRow.id);

            res.status(200).json({
                success: true,
                message: "Media deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    saveMediaInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) throw new UserValidationError("Authentication required");

            const organizationId = typeof req.body?.organizationId === "string" ? String(req.body.organizationId) : "";
            if (!organizationId.trim()) throw new UserValidationError("organizationId is required");

            const id = typeof req.body?.id === "string" ? String(req.body.id) : "";
            if (!id.trim()) throw new UserValidationError("id is required");

            const dto = {
                id,
                alt: req.body?.alt ?? undefined,
                thumbnail: req.body?.thumbnail ?? undefined,
                thumbnailTimestamp: req.body?.thumbnailTimestamp ?? undefined,
            };
            const updated = await this.mediaService.saveMediaInformation(organizationId, dto);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    };

    /**
     * After upload, confirm an object key and receive the canonical public URL for that key.
     */
    saveMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const organizationId = typeof req.body?.organizationId === "string" ? String(req.body.organizationId) : "";
            if (!organizationId.trim()) throw new UserValidationError("organizationId is required");

            const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
            const originalName =
                typeof req.body?.originalName === "string" ? req.body.originalName : undefined;

            if (!name) {
                throw new UserValidationError("name is required");
            }
            const saved = await this.mediaService.saveFile({
                organizationId,
                name: name.split("/").pop() ?? name,
                path: name,
                virtualPath: readVirtualPath(req.body),
                originalName: originalName ?? null,
                fileSize: Number(req.body?.fileSize ?? 0) || 0,
                type: typeof req.body?.type === "string" ? String(req.body.type) : undefined,
            });

            res.status(200).json({
                success: true,
                data: {
                    id: saved.id,
                    path: saved.path,
                    ...(saved.publicUrl ? { publicUrl: saved.publicUrl } : {}),
                    ...(originalName ? { originalName } : {}),
                },
            });
        } catch (error) {
            next(error);
        }
    };
}

export { MAX_MEDIA_UPLOAD_BYTES };
