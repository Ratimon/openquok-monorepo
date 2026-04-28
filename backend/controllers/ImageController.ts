import type { Request, Response, NextFunction } from "express";
import type { StorageSupabaseRepository } from "../repositories/StorageSupabaseRepository";

import http from "http";
import https from "https";

import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import { UserValidationError } from "../errors/UserError";
import { isSupabaseImageBucketName } from "../repositories/StorageSupabaseRepository";

export class ImageController {
    constructor(private readonly storageRepository: StorageSupabaseRepository) {}

    private isAllowedExternalImageHost(hostname: string): boolean {
        const h = hostname.toLowerCase();
        // Strict allowlist to avoid SSRF / open proxy risks.
        // The Instagram Graph `profile_picture_url` commonly resolves to `scontent-*.cdninstagram.com`.
        return (
            h === "cdninstagram.com" ||
            h.endsWith(".cdninstagram.com") ||
            h === "fbcdn.net" ||
            h.endsWith(".fbcdn.net") ||
            h === "platform-lookaside.fbsbx.com" ||
            h.endsWith(".fbsbx.com")
        );
    }

    getByUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { databaseName, imageUrl } = req.query;

            if (!imageUrl || !databaseName) {
                throw new UserValidationError("ImageUrl and databaseName are required");
            }
            if (!isSupabaseImageBucketName(databaseName)) {
                throw new UserValidationError("Invalid databaseName");
            }

            const { data } = await this.storageRepository.downloadImage(databaseName, imageUrl as string);
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
     * Uses Supabase auth user id from JWT (req.user.id), not body.uid.
     * Client `currentUser.id` from GET /users/me is public.users.id and may differ from auth.uid.
     */
    upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const databaseName = req.body?.databaseName;
            const authUser = (req as AuthenticatedRequest).user;
            const authUid = authUser?.id;

            if (!req.file || !databaseName) {
                throw new UserValidationError("Image file and databaseName are required");
            }
            if (!authUid) {
                throw new UserValidationError("Authentication required");
            }
            if (!isSupabaseImageBucketName(databaseName)) {
                throw new UserValidationError("Invalid databaseName");
            }

            const filePath = await this.storageRepository.uploadImage(
                databaseName,
                req.file as { buffer: Buffer; originalname: string; mimetype: string },
                authUid
            );

            res.status(200).json({
                success: true,
                data: { filePath },
                message: "Image uploaded successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { databaseName, imagePath } = req.body ?? {};

            if (!imagePath || !databaseName) {
                throw new UserValidationError("ImagePath and databaseName are required");
            }
            if (!isSupabaseImageBucketName(databaseName)) {
                throw new UserValidationError("Invalid databaseName");
            }

            await this.storageRepository.deleteImage(databaseName, imagePath);

            res.status(200).json({
                success: true,
                message: "Image deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Allowlisted proxy for external avatar URLs (e.g. Instagram CDN profile pictures).
     *
     * Requires a valid user JWT (see global API auth in `middlewares/core.ts`). To avoid SSRF, only a
     * small host allowlist is supported. The web client loads pixels via fetch + Bearer token (see
     * `IntegrationChannelPicture.svelte`), not bare `<img src>` to this URL.
     */
    allowlistedExternalImageProxy = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { url } = req.query;

            if (!url || typeof url !== "string") {
                throw new UserValidationError("URL parameter is required");
            }

            const imageUrl = new URL(url);
            if (!["http:", "https:"].includes(imageUrl.protocol)) {
                throw new UserValidationError("Invalid URL protocol. Only HTTP and HTTPS are allowed.");
            }
            if (!this.isAllowedExternalImageHost(imageUrl.hostname)) {
                throw new UserValidationError("URL host is not allowed");
            }

            const httpModule = imageUrl.protocol === "https:" ? https : http;

            await new Promise<void>((resolve, reject) => {
                const request = httpModule.get(
                    url,
                    {
                        headers: {
                            // Some CDNs return 403 for missing/unknown UA.
                            "User-Agent":
                                "Mozilla/5.0 (compatible; OpenquokPublicImageProxy/1.0)",
                            Accept: "image/*,*/*;q=0.8",
                        },
                        timeout: 10000,
                    },
                    (response) => {
                        if (response.statusCode && response.statusCode >= 400) {
                            reject(
                                new Error(
                                    `Failed to fetch image: ${response.statusCode} ${response.statusMessage}`
                                )
                            );
                            return;
                        }

                        const contentType = response.headers["content-type"];
                        if (!contentType || !contentType.startsWith("image/")) {
                            reject(new UserValidationError("URL does not point to a valid image"));
                            return;
                        }

                        res.set("Content-Type", contentType);
                        // Cache at CDN/browser for a short time; these URLs can rotate.
                        res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
                        response.pipe(res);
                        response.on("end", () => resolve());
                    }
                );

                request.on("error", (error) => reject(error));
                request.on("timeout", () => {
                    request.destroy();
                    reject(new Error("Request timeout"));
                });
            });
        } catch (error) {
            next(error);
        }
    };

    proxyImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { url } = req.query;

            if (!url || typeof url !== "string") {
                throw new UserValidationError("URL parameter is required");
            }

            const imageUrl = new URL(url);
            if (!["http:", "https:"].includes(imageUrl.protocol)) {
                throw new UserValidationError("Invalid URL protocol. Only HTTP and HTTPS are allowed.");
            }

            const httpModule = imageUrl.protocol === "https:" ? https : http;

            await new Promise<void>((resolve, reject) => {
                const request = httpModule.get(
                    url,
                    {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
                        },
                        timeout: 10000,
                    },
                    (response) => {
                        if (response.statusCode && response.statusCode >= 400) {
                            reject(new Error(`Failed to fetch image: ${response.statusCode} ${response.statusMessage}`));
                            return;
                        }

                        const contentType = response.headers["content-type"];
                        if (!contentType || !contentType.startsWith("image/")) {
                            reject(new UserValidationError("URL does not point to a valid image"));
                            return;
                        }

                        res.set("Content-Type", contentType);
                        res.set("Cache-Control", "public, max-age=3600");
                        response.pipe(res);
                        response.on("end", () => resolve());
                    }
                );

                request.on("error", (error) => reject(error));
                request.on("timeout", () => {
                    request.destroy();
                    reject(new Error("Request timeout"));
                });
            });
        } catch (error) {
            next(error);
        }
    };
}
