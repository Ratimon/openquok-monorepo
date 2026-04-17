import path from "node:path";

import type { StorageR2Repository } from "../../repositories/StorageR2Repository";
import { publicUrlForObjectKey } from "../../repositories/MediaRepository";
import { makeId } from "../../utils/make.is";
import type { IUploadProvider, UploadResult } from "./upload.interface";

export class R2Storage implements IUploadProvider {
    public readonly supportsMultipart = true;

    constructor(private readonly storageR2Repository: StorageR2Repository) {}

    async uploadFile(params: {
        organizationId: string;
        buffer: Buffer;
        originalName: string;
        contentType: string;
    }): Promise<UploadResult> {
        const ext = path.extname(params.originalName) || "";
        const key = `${makeId(20)}${ext || ".bin"}`;
        await this.storageR2Repository.putObject(key, params.buffer, params.contentType);
        return { path: key, publicUrl: publicUrlForObjectKey(key) };
    }

    async downloadObject(path: string): Promise<{ buffer: Buffer; contentType: string }> {
        const { data } = await this.storageR2Repository.downloadObject(path);
        const buffer = data instanceof Buffer ? data : Buffer.from(await data.arrayBuffer());
        const contentType = (data as Blob & { type?: string }).type ?? "application/octet-stream";
        return { buffer, contentType };
    }

    async deleteObject(path: string): Promise<void> {
        await this.storageR2Repository.deleteObject(path);
    }
}

