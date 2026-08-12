import { describe, expect, it } from "vitest";

import {
  hostedUploadTooLargeMessage,
  mimeFromFilePath,
  multipartPartNumbers,
  shouldUseMultipartUpload,
  MAX_MEDIA_DIRECT_UPLOAD_BYTES,
  MEDIA_MULTIPART_PART_BYTES,
} from "./upload.logic";

describe("shouldUseMultipartUpload", () => {
  it("keeps files at the hosted inbound cap on the simple path", () => {
    expect(shouldUseMultipartUpload(MAX_MEDIA_DIRECT_UPLOAD_BYTES)).toBe(false);
    expect(shouldUseMultipartUpload(MAX_MEDIA_DIRECT_UPLOAD_BYTES + 1)).toBe(true);
  });
});

describe("multipartPartNumbers", () => {
  it("uses a single part for files at or under the part size", () => {
    expect(multipartPartNumbers(MEDIA_MULTIPART_PART_BYTES)).toEqual([1]);
    expect(multipartPartNumbers(MEDIA_MULTIPART_PART_BYTES + 1)).toEqual([1, 2]);
  });
});

describe("mimeFromFilePath", () => {
  it("maps common video and image extensions", () => {
    expect(mimeFromFilePath("/tmp/clip.mp4")).toBe("video/mp4");
    expect(mimeFromFilePath("photo.PNG")).toBe("image/png");
  });
});

describe("hostedUploadTooLargeMessage", () => {
  it("explains the hosted 413 and points at multipart", () => {
    expect(hostedUploadTooLargeMessage(413)).toMatch(/4\.5 MB/);
    expect(hostedUploadTooLargeMessage(413)).toMatch(/create-multipart/);
  });
});
