/** Hosted inbound body headroom under the ~4.5 MB function gateway. */
export const MAX_MEDIA_DIRECT_UPLOAD_BYTES = 4 * 1024 * 1024;

/** S3-compatible part size (minimum 5 MiB except the last part). */
export const MEDIA_MULTIPART_PART_BYTES = 5 * 1024 * 1024;

const EXTENSION_TO_MIME: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    m4v: "video/x-m4v",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
    pdf: "application/pdf",
};

export function mimeFromExtension(extension: string): string {
    const ext = extension.replace(/^\./, "").toLowerCase();
    return EXTENSION_TO_MIME[ext] ?? "application/octet-stream";
}

export function shouldUseMultipartUpload(byteLength: number): boolean {
    return Number.isFinite(byteLength) && byteLength > MAX_MEDIA_DIRECT_UPLOAD_BYTES;
}

export function multipartPartCount(byteLength: number, partBytes = MEDIA_MULTIPART_PART_BYTES): number {
    if (byteLength <= 0) return 1;
    return Math.ceil(byteLength / partBytes);
}
