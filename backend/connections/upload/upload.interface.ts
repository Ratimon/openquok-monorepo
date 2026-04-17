export type UploadResult = {
    /** Storage key / path persisted in DB (flat object key, e.g. `{makeId(20)}.png`; org is in DB only). */
    path: string;
    /** Optional public URL usable directly in the browser. */
    publicUrl: string | null;
};

export interface IUploadProvider {
    uploadFile(params: {
        organizationId: string;
        buffer: Buffer;
        originalName: string;
        contentType: string;
    }): Promise<UploadResult>;

    downloadObject(path: string): Promise<{ buffer: Buffer; contentType: string }>;

    deleteObject(path: string): Promise<void>;

    /**
     * Multipart orchestration (optional).
     * Providers that do not support multipart should throw a 400-style error in controllers.
     */
    supportsMultipart: boolean;
}

