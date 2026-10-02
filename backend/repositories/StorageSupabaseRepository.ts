import type { SupabaseClient } from "@supabase/supabase-js";

import { DatabaseError } from "../errors/InfraError";

/** Supabase Storage bucket names for `/api/v1/image/*` — stay in sync with web `DatabaseName` for that API. */
export const DATABASE_NAMES = {
    AVATARS: "avatars",
    BLOG_IMAGES: "blog_images",
    LINK_DIRECTORY_LOGOS: "link_directory_logos",
} as const;

export type DatabaseName = (typeof DATABASE_NAMES)[keyof typeof DATABASE_NAMES];

export function isAllowedDatabaseName(name: unknown): name is DatabaseName {
    return typeof name === "string" && (Object.values(DATABASE_NAMES) as string[]).includes(name);
}

/** Buckets backed by Supabase Storage (`/api/v1/image/*`). User-owned R2 media uses `/api/v1/media/*`. */
export type SupabaseImageBucketName =
    | typeof DATABASE_NAMES.AVATARS
    | typeof DATABASE_NAMES.BLOG_IMAGES
    | typeof DATABASE_NAMES.LINK_DIRECTORY_LOGOS;

export function isSupabaseImageBucketName(name: unknown): name is SupabaseImageBucketName {
    return (
        name === DATABASE_NAMES.AVATARS ||
        name === DATABASE_NAMES.BLOG_IMAGES ||
        name === DATABASE_NAMES.LINK_DIRECTORY_LOGOS
    );
}

/**
 * Supabase Storage repository.
 *
 * R2 is intentionally handled elsewhere (see `StorageR2Repository`) so this class stays Supabase-only.
 */
export class StorageSupabaseRepository {
    constructor(private readonly supabaseServiceClient: SupabaseClient) {}

    async getPublicImageUrl(databaseName: DatabaseName, imageUrl: string) {
        const { data } = this.supabaseServiceClient.storage.from(databaseName).getPublicUrl(imageUrl);
        return data.publicUrl;
    }

    async downloadImage(databaseName: DatabaseName, path: string) {
        const { data, error } = await this.supabaseServiceClient.storage.from(databaseName).download(path);

        if (error) {
            const rawMsg = error.message;
            const msg = (
                typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg ?? error) || "Unknown storage error"
            ).toLowerCase();
            const isNotFound =
                msg.includes("not found") ||
                msg.includes("object not found") ||
                msg.includes("nosuchkey") ||
                msg.includes("no such key") ||
                (error as { error?: string }).error === "ObjectNotFound";
            const messageStr =
                typeof rawMsg === "string" ? rawMsg : rawMsg ? JSON.stringify(rawMsg) : "Unknown storage error";
            throw new DatabaseError(`Error in downloadImage: ${databaseName} with message ${messageStr}`, {
                cause: error,
                operation: "download",
                resource: { type: "storage", name: databaseName },
                statusCode: isNotFound ? 404 : 500,
            });
        }
        return { data, error };
    }

    async uploadImage(
        databaseName: DatabaseName,
        file: { buffer: Buffer; originalname: string; mimetype: string },
        uid: string
    ) {
        const fileExt = file.originalname.split(".").pop() || "bin";
        const filePath = `${uid}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await this.supabaseServiceClient.storage
            .from(databaseName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            throw new DatabaseError(`Error in uploadImage: ${databaseName} with message ${uploadError.message}`, {
                cause: uploadError,
                operation: "upload",
                resource: { type: "storage", name: databaseName },
            });
        }

        return filePath;
    }

    /** Upsert mirrored integration profile photo (`integration-profiles/...` in avatars bucket). */
    async uploadIntegrationProfilePicture(
        objectPath: string,
        buffer: Buffer,
        contentType: string
    ): Promise<{ error: null | { message: string } }> {
        const { error } = await this.supabaseServiceClient.storage
            .from(DATABASE_NAMES.AVATARS)
            .upload(objectPath, buffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            return { error: { message: error.message } };
        }
        return { error: null };
    }

    async deleteImage(
        databaseName: DatabaseName,
        path: string
    ): Promise<{ data: unknown; error: null | { message: string } }> {
        const { data, error } = await this.supabaseServiceClient.storage.from(databaseName).remove([path]);

        if (error) {
            throw new DatabaseError(`Error in deleteImage: ${databaseName} with message ${error.message}`, {
                cause: error,
                operation: "remove",
                resource: { type: "storage", name: databaseName },
            });
        }
        return { data, error };
    }

    /**
     * Lists objects in the flat `blog_images` bucket (service role).
     * Supabase Storage does not expose total counts; use `hasMore` for pagination.
     * When `search` is set, names are filtered case-insensitively by scanning the bucket in batches.
     */
    async listBlogImages(params: {
        limit: number;
        offset: number;
        search?: string;
    }): Promise<{
        items: { name: string; createdAt?: string; updatedAt?: string }[];
        hasMore: boolean;
    }> {
        const { limit, offset, search } = params;
        const bucket = DATABASE_NAMES.BLOG_IMAGES;
        const sortBy = { column: "created_at" as const, order: "desc" as const };
        const searchTerm = search?.trim().toLowerCase();

        const mapRow = (row: { name: string; created_at?: string; updated_at?: string }) => ({
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });

        const matchesSearch = (name: string) =>
            !searchTerm || name.toLowerCase().includes(searchTerm);

        if (!searchTerm) {
            const { data, error } = await this.supabaseServiceClient.storage.from(bucket).list("", {
                limit: limit + 1,
                offset,
                sortBy,
            });

            if (error) {
                throw new DatabaseError(`Error in listBlogImages: ${bucket} with message ${error.message}`, {
                    cause: error,
                    operation: "list",
                    resource: { type: "storage", name: bucket },
                });
            }

            const rows = data ?? [];
            const hasMore = rows.length > limit;
            const pageRows = hasMore ? rows.slice(0, limit) : rows;
            return { items: pageRows.map(mapRow), hasMore };
        }

        const scanBatchSize = 100;
        let scanOffset = 0;
        let skipped = 0;
        const collected: { name: string; createdAt?: string; updatedAt?: string }[] = [];
        let hasMore = false;

        scanLoop: while (true) {
            const { data, error } = await this.supabaseServiceClient.storage.from(bucket).list("", {
                limit: scanBatchSize,
                offset: scanOffset,
                sortBy,
            });

            if (error) {
                throw new DatabaseError(`Error in listBlogImages: ${bucket} with message ${error.message}`, {
                    cause: error,
                    operation: "list",
                    resource: { type: "storage", name: bucket },
                });
            }

            const batch = data ?? [];
            if (batch.length === 0) {
                break;
            }

            for (const row of batch) {
                if (!matchesSearch(row.name)) {
                    continue;
                }
                if (skipped < offset) {
                    skipped += 1;
                    continue;
                }
                collected.push(mapRow(row));
                if (collected.length > limit) {
                    hasMore = true;
                    break scanLoop;
                }
            }

            if (batch.length < scanBatchSize) {
                break;
            }
            scanOffset += scanBatchSize;
        }

        return { items: collected.slice(0, limit), hasMore };
    }
}

