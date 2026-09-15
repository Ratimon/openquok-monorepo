import type { Request, Response, NextFunction } from "express";
import type { StorageSupabaseRepository } from "../repositories/StorageSupabaseRepository";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";

import http from "http";
import https from "https";

import type { AuthenticatedRequest } from "../guards";
import { AppError } from "../errors/AppError";
import { UserAuthorizationError, UserValidationError } from "../errors/UserError";
import { isSupabaseImageBucketName } from "../repositories/StorageSupabaseRepository";
import { isAllowedExternalImageHost } from "../utils/images/allowedExternalImageHosts";
import {
    ExternalImageFetchError,
    fetchAllowlistedExternalImage,
} from "../utils/images/externalImageFetch";

export class ImageController {
    constructor(
        private readonly storageRepository: StorageSupabaseRepository,
        private readonly integrationConnectionService: IntegrationConnectionService
    ) {}

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

    private readExternalImageUrl(req: Request): string {
        const fromQuery = req.query.url;
        if (typeof fromQuery === "string" && fromQuery.trim()) {
            return fromQuery.trim();
        }
        const body = req.body as { url?: unknown } | undefined;
        if (body && typeof body.url === "string" && body.url.trim()) {
            return body.url.trim();
        }
        throw new UserValidationError("URL parameter is required");
    }

    /**
     * Allowlisted proxy for external avatar URLs (Instagram, Facebook, and LinkedIn CDNs).
     *
     * Requires a valid user JWT (see global API auth in `middlewares/core.ts`). To avoid SSRF, only a
     * small host allowlist is supported. Prefer POST `{ url }` so long signed CDN query strings are
     * not stripped by edge WAFs; GET `?url=` remains for older clients.
     */
    /**
     * Channel avatar via provider OAuth (LinkedIn userinfo / org logo, Meta Graph `/picture`, etc.).
     * Requires JWT + workspace membership; use when signed CDN URLs expired in the browser.
     */
    getIntegrationAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserAuthorizationError("Not authenticated");
            }

            const organizationId =
                typeof req.query.organizationId === "string" ? req.query.organizationId.trim() : "";
            const integrationId =
                typeof req.query.integrationId === "string" ? req.query.integrationId.trim() : "";
            if (!organizationId || !integrationId) {
                throw new UserValidationError("organizationId and integrationId are required");
            }

            const image = await this.integrationConnectionService.getIntegrationAvatarImage(
                authUser.id,
                organizationId,
                integrationId
            );
            if (!image) {
                throw new AppError("Channel avatar is not available", 404);
            }

            res.set("Content-Type", image.contentType);
            res.set("Cache-Control", "private, max-age=3600, stale-while-revalidate=86400");
            res.send(image.buffer);
        } catch (error) {
            next(error);
        }
    };

    allowlistedExternalImageProxy = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const url = this.readExternalImageUrl(req);

            const imageUrl = new URL(url);
            if (!["http:", "https:"].includes(imageUrl.protocol)) {
                throw new UserValidationError("Invalid URL protocol. Only HTTP and HTTPS are allowed.");
            }
            if (!isAllowedExternalImageHost(imageUrl.hostname)) {
                throw new UserValidationError("URL host is not allowed");
            }

            const { buffer, contentType } = await fetchAllowlistedExternalImage(url);

            res.set("Content-Type", contentType);
            // Cache at CDN/browser for a short time; these URLs can rotate.
            res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
            res.send(buffer);
        } catch (error) {
            if (error instanceof ExternalImageFetchError) {
                const err = new Error(error.message);
                // Upstream CDN 403/404 is not an auth failure — use 502 so clients/logs are not confused
                // with JWT rejection on this route.
                const statusCode =
                    error.statusCode === 403 || error.statusCode === 404 ? 502 : error.statusCode;
                (err as Error & { statusCode?: number }).statusCode = statusCode;
                next(err);
                return;
            }
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
