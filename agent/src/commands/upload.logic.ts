import path from "node:path";

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

export function mimeFromFilePath(filePath: string): string {
  const ext = path.extname(filePath).replace(/^\./, "").toLowerCase();
  return EXTENSION_TO_MIME[ext] ?? "application/octet-stream";
}

export function shouldUseMultipartUpload(byteLength: number): boolean {
  return Number.isFinite(byteLength) && byteLength > MAX_MEDIA_DIRECT_UPLOAD_BYTES;
}

export function multipartPartNumbers(
  byteLength: number,
  partBytes = MEDIA_MULTIPART_PART_BYTES
): number[] {
  const count = byteLength <= 0 ? 1 : Math.ceil(byteLength / partBytes);
  return Array.from({ length: count }, (_, i) => i + 1);
}

export function hostedUploadTooLargeMessage(status: number): string {
  if (status !== 413) return `Upload failed: ${status}`;
  return (
    "Upload failed: 413 Payload Too Large. The hosted API rejects simple " +
    "POST /public/upload bodies above ~4.5 MB. Use `openquok upload` (it " +
    "switches to direct-to-storage multipart) or call " +
    "POST /public/upload/create-multipart."
  );
}
