import type { Request, Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import { config } from "../config/GlobalConfig";
import { AuthError } from "../errors/AuthError";
import { UserValidationError } from "../errors/UserError";
import type { StorageR2Repository } from "../repositories/StorageR2Repository";

/** User-owned media (images, video, etc.) stored in R2 — not blog inline images. */
const MAX_MEDIA_UPLOAD_BYTES = 50 * 1024 * 1024;

function isAllowedMediaMime(mimetype: string): boolean {
    const m = mimetype.toLowerCase();
    return (
        m.startsWith("image/") ||
        m.startsWith("video/") ||
        m === "application/pdf" ||
        m.startsWith("audio/")
    );
}

function publicUrlForObjectKey(key: string): string | null {
    const storage = config.storage as { r2: { publicBaseUrl?: string } };
    const base = storage.r2.publicBaseUrl?.trim().replace(/\/+$/, "");
    if (!base) return null;
    return `${base}/${key.replace(/^\/+/, "")}`;
}

export class MediaController {
    constructor(private readonly storageR2Repository: StorageR2Repository) {}

    /**
     * Stream one object from R2. Requires JWT; only the owning auth user may read (`path` must start with their `auth.uid` + `-`).
     * Query: `path` — object key (same as stored `filePath` from upload).
     */
    download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            const authUid = authUser?.id;
            if (!authUid) {
                throw new UserValidationError("Authentication required");
            }

            const pathParam = typeof req.query.path === "string" ? req.query.path : "";
            if (!pathParam.trim()) {
                throw new UserValidationError("path query parameter is required");
            }

            assertMediaKeyOwnedByUser(pathParam, authUid);

            const { data } = await this.storageR2Repository.downloadObject(pathParam);
            if (!data) {
                throw new Error("No data returned from storage");
            }

            const buffer = data instanceof Buffer ? data : Buffer.from(await data.arrayBuffer());
            const contentType = (data as Blob & { type?: string }).type ?? "application/octet-stream";
            res.set("Content-Type", contentType);
            res.send(buffer);
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
            const authUid = authUser?.id;

            if (!req.file) {
                throw new UserValidationError("Media file is required");
            }
            if (!authUid) {
                throw new UserValidationError("Authentication required");
            }

            const file = req.file as { buffer: Buffer; originalname: string; mimetype: string };
            if (!isAllowedMediaMime(file.mimetype || "")) {
                throw new UserValidationError("Unsupported media type");
            }

            const fileExt = file.originalname.split(".").pop() || "bin";
            const filePath = `${authUid}-${Math.random()}.${fileExt}`;

            await this.storageR2Repository.putObject(
                filePath,
                file.buffer,
                file.mimetype || "application/octet-stream"
            );

            const publicUrl = publicUrlForObjectKey(filePath);

            res.status(200).json({
                success: true,
                data: {
                    filePath,
                    ...(publicUrl ? { publicUrl } : {}),
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
            const authUid = authUser?.id;
            if (!authUid) {
                throw new UserValidationError("Authentication required");
            }

            const { path: objectPath } = (req.body ?? {}) as { path?: string };

            if (!objectPath || typeof objectPath !== "string") {
                throw new UserValidationError("path is required");
            }

            assertMediaKeyOwnedByUser(objectPath, authUid);

            await this.storageR2Repository.deleteObject(objectPath);

            res.status(200).json({
                success: true,
                message: "Media deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * After a client-side or multipart R2 upload, register the object key and receive the canonical public URL
     * (same idea as OpenQuok `save-media` with `CLOUDFLARE_BUCKET_URL + '/' + name`).
     */
    saveMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            const authUid = authUser?.id;
            if (!authUid) {
                throw new UserValidationError("Authentication required");
            }

            const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
            const originalName =
                typeof req.body?.originalName === "string" ? req.body.originalName : undefined;

            if (!name) {
                throw new UserValidationError("name is required");
            }

            assertMediaKeyOwnedByUser(name, authUid);

            const publicUrl = publicUrlForObjectKey(name);

            res.status(200).json({
                success: true,
                data: {
                    path: name,
                    ...(publicUrl ? { publicUrl } : {}),
                    ...(originalName ? { originalName } : {}),
                },
            });
        } catch (error) {
            next(error);
        }
    };
}

export { MAX_MEDIA_UPLOAD_BYTES };

/** Object keys are created as `${auth.uid}-${random()}.ext` — reject cross-user access. */
function assertMediaKeyOwnedByUser(objectKey: string, authUid: string): void {
    const key = objectKey.replace(/^\/+/, "");
    if (!key.startsWith(`${authUid}-`)) {
        throw new AuthError("You do not have access to this media object", 403);
    }
}
