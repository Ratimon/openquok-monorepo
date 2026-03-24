import type { SupabaseClient } from "@supabase/supabase-js";

import { DatabaseError } from "../errors/InfraError";

/** Buckets exposed by the image API — must stay in sync with web `DatabaseName`. */
export const DATABASE_NAMES = {
    AVATARS: "avatars",
    BLOG_IMAGES: "blog_images",
} as const;

export type DatabaseName = (typeof DATABASE_NAMES)[keyof typeof DATABASE_NAMES];

export function isAllowedDatabaseName(name: unknown): name is DatabaseName {
    return typeof name === "string" && (Object.values(DATABASE_NAMES) as string[]).includes(name);
}

export class StorageRepository {
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
            const messageStr = typeof rawMsg === "string" ? rawMsg : rawMsg ? JSON.stringify(rawMsg) : "Unknown storage error";
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
        const fileExt = file.originalname.split(".").pop();
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
}
