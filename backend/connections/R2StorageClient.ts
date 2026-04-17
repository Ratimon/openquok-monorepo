import {
    DeleteObjectCommand,
    GetObjectCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    ListPartsCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

    async createMultipartUpload(params: {
        key: string;
        contentType: string;
        fileHash?: string;
    }): Promise<{ uploadId: string; key: string }> {
        const command = new CreateMultipartUploadCommand({
            Bucket: this.cfg.bucket,
            Key: params.key,
            ContentType: params.contentType,
            ...(params.fileHash
                ? { Metadata: { "x-amz-meta-file-hash": params.fileHash } }
                : {}),
        });
        const response = await this.client.send(command);
        if (!response.UploadId || !response.Key) {
            throw new Error("Multipart upload initialization failed");
        }
        return { uploadId: response.UploadId, key: response.Key };
    }

    async signPart(params: {
        key: string;
        uploadId: string;
        partNumber: number;
        expiresInSeconds?: number;
    }): Promise<{ url: string }> {
        const command = new UploadPartCommand({
            Bucket: this.cfg.bucket,
            Key: params.key,
            PartNumber: params.partNumber,
            UploadId: params.uploadId,
        });
        const url = await getSignedUrl(this.client, command, {
            expiresIn: params.expiresInSeconds ?? 3600,
        });
        return { url };
    }

    async prepareUploadParts(params: {
        key: string;
        uploadId: string;
        parts: Array<{ number: number }>;
        expiresInSeconds?: number;
    }): Promise<{ presignedUrls: Record<string, string> }> {
        const presignedUrls: Record<string, string> = {};
        for (const part of params.parts) {
            const { url } = await this.signPart({
                key: params.key,
                uploadId: params.uploadId,
                partNumber: part.number,
                expiresInSeconds: params.expiresInSeconds,
            });
            presignedUrls[String(part.number)] = url;
        }
        return { presignedUrls };
    }

    async listParts(params: { key: string; uploadId: string }): Promise<unknown> {
        const command = new ListPartsCommand({
            Bucket: this.cfg.bucket,
            Key: params.key,
            UploadId: params.uploadId,
        });
        const response = await this.client.send(command);
        return response.Parts ?? [];
    }

    async abortMultipartUpload(params: { key: string; uploadId: string }): Promise<unknown> {
        const command = new AbortMultipartUploadCommand({
            Bucket: this.cfg.bucket,
            Key: params.key,
            UploadId: params.uploadId,
        });
        return await this.client.send(command);
    }

    async completeMultipartUpload(params: {
        key: string;
        uploadId: string;
        parts: Array<{ ETag: string; PartNumber: number }>;
        publicBaseUrl?: string | null;
    }): Promise<{ Location?: string | null }> {
        const command = new CompleteMultipartUploadCommand({
            Bucket: this.cfg.bucket,
            Key: params.key,
            UploadId: params.uploadId,
            MultipartUpload: { Parts: params.parts },
        });
        const response = await this.client.send(command);
        const base = (params.publicBaseUrl ?? "").trim().replace(/\/+$/, "");
        const location = base ? `${base}/${params.key.replace(/^\/+/, "")}` : response.Location ?? null;
        return { Location: location };
    }
}
