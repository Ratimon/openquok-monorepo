import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

export type R2ConnectionConfig = {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
};

export function isR2ConnectionReady(cfg: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
}): boolean {
    return Boolean(
        cfg.accountId?.trim() &&
            cfg.accessKeyId?.trim() &&
            cfg.secretAccessKey?.trim() &&
            cfg.bucket?.trim()
    );
}

/**
 * Cloudflare R2 via S3 API (see product docs: configuration-backend / Cloudflare R2).
 */
export class R2StorageClient {
    private readonly client: S3Client;

    constructor(private readonly cfg: R2ConnectionConfig) {
        const endpoint = `https://${cfg.accountId}.r2.cloudflarestorage.com`;
        this.client = new S3Client({
            region: cfg.region || "auto",
            endpoint,
            credentials: {
                accessKeyId: cfg.accessKeyId,
                secretAccessKey: cfg.secretAccessKey,
            },
        });
    }

    async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.cfg.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            })
        );
    }

    async getObjectBuffer(key: string): Promise<{ buffer: Buffer; contentType: string }> {
        const out = await this.client.send(
            new GetObjectCommand({
                Bucket: this.cfg.bucket,
                Key: key,
            })
        );
        const stream = out.Body as Readable;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);
        const contentType = out.ContentType ?? "application/octet-stream";
        return { buffer, contentType };
    }

    async deleteObject(key: string): Promise<void> {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.cfg.bucket,
                Key: key,
            })
        );
    }
}
