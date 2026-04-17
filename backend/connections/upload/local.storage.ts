import fs from "node:fs/promises";
import path from "node:path";

import { config } from "../../config/GlobalConfig";
import { makeId } from "../../utils/make.is";
import { DatabaseError } from "../../errors/InfraError";
import type { IUploadProvider, UploadResult } from "./upload.interface";

function safeJoin(base: string, p: string): string {
    const out = path.join(base, p);
    const rel = path.relative(base, out);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
        throw new Error("Invalid upload path");
    }
    return out;
}

function buildPublicUrl(relativePath: string): string | null {
    const server = config.server as { frontendDomainUrl?: string; backendDomainUrl?: string };
    const origin = String(server.frontendDomainUrl ?? server.backendDomainUrl ?? "").trim().replace(/\/+$/, "");
    if (!origin) return null;
    return `${origin}/uploads/${relativePath.replace(/^\/+/, "")}`;
}

export class LocalStorage implements IUploadProvider {
    public readonly supportsMultipart = false;

    constructor(private readonly uploadDirectory: string) {}

    private assertConfigured(): void {
        if (!this.uploadDirectory?.trim()) {
            throw new DatabaseError("Local upload storage is not configured for this environment", {
                operation: "upload",
                resource: { type: "storage", name: "local" },
                statusCode: 503,
            });
        }
    }

    async uploadFile(params: {
        organizationId: string;
        buffer: Buffer;
        originalName: string;
        contentType: string;
    }): Promise<UploadResult> {
        this.assertConfigured();
        const ext = path.extname(params.originalName) || "";
        const fileName = `${makeId(20)}${ext}`;
        const relative = fileName;

        const onDisk = safeJoin(this.uploadDirectory, relative);
        await fs.mkdir(path.dirname(onDisk), { recursive: true });
        await fs.writeFile(onDisk, params.buffer);

        return { path: relative, publicUrl: buildPublicUrl(relative) };
    }

    async downloadObject(p: string): Promise<{ buffer: Buffer; contentType: string }> {
        this.assertConfigured();
        const onDisk = safeJoin(this.uploadDirectory, p);
        const buffer = await fs.readFile(onDisk);
        return { buffer, contentType: "application/octet-stream" };
    }

    async deleteObject(p: string): Promise<void> {
        this.assertConfigured();
        const onDisk = safeJoin(this.uploadDirectory, p);
        await fs.rm(onDisk, { force: true });
    }
}

