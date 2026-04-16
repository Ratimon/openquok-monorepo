import { DatabaseError } from "../errors/InfraError";
import { R2StorageClient, type R2ConnectionConfig } from "../connections/R2StorageClient";

/**
 * Logical bucket label for composer/post JSON (`bucket` on media items). Objects are stored in R2, not in Supabase Storage.
 */
export const COMPOSER_MEDIA_BUCKET_NAME = "social_media" as const;

/**
 * Cloudflare R2 (S3-compatible) object storage for social/composer attachments.
 * Supabase Storage handles other buckets; this class is the only place that talks to R2.
 */
export class StorageR2Repository {
    private readonly client: R2StorageClient | null;

    constructor(r2Connection: R2ConnectionConfig | null) {
        this.client = r2Connection ? new R2StorageClient(r2Connection) : null;
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    private assertClient(): R2StorageClient {
        if (!this.client) {
            throw new DatabaseError("R2 object storage is not configured for this environment", {
                operation: "upload",
                resource: { type: "storage", name: COMPOSER_MEDIA_BUCKET_NAME },
                statusCode: 503,
            });
        }
        return this.client;
    }

    async downloadObject(path: string): Promise<{ data: Blob; error: null }> {
        const r2 = this.assertClient();
        const { buffer, contentType } = await r2.getObjectBuffer(path);
        const data = new Blob([new Uint8Array(buffer)], { type: contentType });
        return { data, error: null };
    }

    async putObject(
        key: string,
        buffer: Buffer,
        contentType: string
    ): Promise<void> {
        const r2 = this.assertClient();
        await r2.putObject(key, buffer, contentType || "application/octet-stream");
    }

    async deleteObject(key: string): Promise<void> {
        const r2 = this.assertClient();
        await r2.deleteObject(key);
    }
}
