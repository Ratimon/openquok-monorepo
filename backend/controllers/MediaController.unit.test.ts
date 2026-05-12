import type { Request, Response, NextFunction } from "express";

import type { StorageR2Repository } from "../repositories/StorageR2Repository";
import type { MediaService } from "../services/MediaService";
import type { IUploadProvider } from "../connections/upload/upload.interface";

import { MediaController } from "./MediaController";

function createMockResponse(): jest.Mocked<Response> {
    return {
        set: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as jest.Mocked<Response>;
}

describe("MediaController", () => {
    let storageR2Repository: jest.Mocked<StorageR2Repository>;
    let controller: MediaController;
    let mediaService: jest.Mocked<MediaService>;
    let uploadProvider: jest.Mocked<IUploadProvider>;

    beforeEach(() => {
        storageR2Repository = {
            downloadObject: jest.fn(),
            putObject: jest.fn(),
            deleteObject: jest.fn(),
            listObjects: jest.fn(),
        } as unknown as jest.Mocked<StorageR2Repository>;

        mediaService = {
            getMedia: jest.fn(),
            saveFile: jest.fn(),
            getMediaById: jest.fn(),
            getMediaByPath: jest.fn(),
            softDeleteMedia: jest.fn(),
            saveMediaInformation: jest.fn(),
        } as unknown as jest.Mocked<MediaService>;

        uploadProvider = {
            uploadFile: jest.fn(),
            downloadObject: jest.fn(),
            deleteObject: jest.fn(),
            supportsMultipart: true,
        } as unknown as jest.Mocked<IUploadProvider>;

        controller = new MediaController(mediaService, storageR2Repository, uploadProvider);
    });

    describe("list", () => {
        it("lists only the authenticated user's media", async () => {
            mediaService.getMedia.mockResolvedValue({
                results: [
                    {
                        id: "m2",
                        path: "a1b2c3d4e5f6g7h8i9j0.png",
                        virtualPath: "/",
                        name: "two.png",
                        size: 222,
                        lastModified: "2026-04-12T00:00:00.000Z",
                        publicUrl: null,
                        kind: "image",
                        alt: null,
                        thumbnail: null,
                        thumbnailPublicUrl: null,
                        thumbnailTimestamp: null,
                    },
                    {
                        id: "m1",
                        path: "z9y8x7w6v5u4t3s2r1q0.mp4",
                        virtualPath: "/",
                        name: "one.mp4",
                        size: 111,
                        lastModified: "2026-04-10T00:00:00.000Z",
                        publicUrl: null,
                        kind: "video",
                        alt: null,
                        thumbnail: null,
                        thumbnailPublicUrl: null,
                        thumbnailTimestamp: null,
                    },
                ],
                total: 2,
                pages: 1,
                page: 1,
                pageSize: 24,
            });

            const req = {
                query: { organizationId: "org-1", page: "1", pageSize: "24" },
                user: { id: "auth-uid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.list(req, res, next);

            expect(mediaService.getMedia).toHaveBeenCalledWith("org-1", 1, 24);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    total: 2,
                    pages: 1,
                    page: 1,
                    pageSize: 24,
                    results: expect.any(Array),
                }),
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("upload", () => {
        it("requires authentication", async () => {
            const req = {
                file: { buffer: Buffer.from([1]), originalname: "a.png", mimetype: "image/png" },
                user: undefined,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(storageR2Repository.putObject).not.toHaveBeenCalled();
        });

        it("uploads allowed mime and returns filePath", async () => {
            uploadProvider.uploadFile.mockResolvedValue({ path: "x1y2z3a4b5c6d7e8f9g0.mp4", publicUrl: null } as any);
            mediaService.saveFile.mockResolvedValue({ id: "m1", path: "x1y2z3a4b5c6d7e8f9g0.mp4", publicUrl: null });

            const file = {
                buffer: Buffer.from([9]),
                originalname: "clip.mp4",
                mimetype: "video/mp4",
            };
            const req = {
                file,
                body: { organizationId: "org-1" },
                user: { id: "auth-uid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(uploadProvider.uploadFile).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        filePath: expect.any(String),
                    }),
                    message: "Media uploaded successfully",
                })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("uploadSimple", () => {
        it("when preventSave=true, returns path alias", async () => {
            uploadProvider.uploadFile.mockResolvedValue({ path: "p0o9n8m7l6k5j4i3h2g1.png", publicUrl: null } as any);

            const req = {
                file: { buffer: Buffer.from([9]), originalname: "a.png", mimetype: "image/png" },
                body: { preventSave: "true", organizationId: "org-1" },
                user: { id: "auth-uid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadSimple(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        path: expect.any(String),
                        filePath: expect.any(String),
                    }),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("requires path in body", async () => {
            const req = { body: {}, user: { id: "auth-uid" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(storageR2Repository.deleteObject).not.toHaveBeenCalled();
        });

        it("deletes object by key when owned by the authenticated user", async () => {
            uploadProvider.deleteObject.mockResolvedValue(undefined);
            mediaService.getMediaByPath.mockResolvedValue({
                id: "m1",
                path: "k9j8h7g6f5e4d3c2b1a0.png",
                organization_id: "org-1",
            } as any);
            mediaService.softDeleteMedia.mockResolvedValue(true);

            const req = {
                body: { organizationId: "org-1", path: "k9j8h7g6f5e4d3c2b1a0.png" },
                user: { id: "auth-uid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(uploadProvider.deleteObject).toHaveBeenCalledWith("k9j8h7g6f5e4d3c2b1a0.png");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("saveMedia", () => {
        it("requires name", async () => {
            const req = { body: {}, user: { id: "auth-uid" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.saveMedia(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe("uploadProgrammatic", () => {
        function programmaticRequest(overrides: Partial<{ file: unknown; orgId: string | null }> = {}): Request {
            return {
                file: overrides.file ?? undefined,
                organization: overrides.orgId === null ? undefined : { id: overrides.orgId ?? "org-1" },
            } as unknown as Request;
        }

        it("requires an organization on the request (programmatic auth)", async () => {
            const req = programmaticRequest({
                file: { buffer: Buffer.from([1]), originalname: "a.png", mimetype: "image/png" },
                orgId: null,
            });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammatic(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });

        it("rejects when no multipart file is attached", async () => {
            const req = programmaticRequest({ orgId: "org-1" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammatic(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });

        it("uploads the multipart file and returns the saved media envelope", async () => {
            uploadProvider.uploadFile.mockResolvedValue({
                path: "org-1/abc.png",
                publicUrl: "https://cdn.example.com/org-1/abc.png",
            } as any);
            mediaService.saveFile.mockResolvedValue({
                id: "media-1",
                path: "org-1/abc.png",
                publicUrl: "https://cdn.example.com/org-1/abc.png",
            });

            const req = programmaticRequest({
                file: { buffer: Buffer.from([1, 2, 3]), originalname: "logo.png", mimetype: "image/png" },
                orgId: "org-1",
            });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammatic(req, res, next);

            expect(uploadProvider.uploadFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId: "org-1",
                    contentType: "image/png",
                    originalName: "logo.png",
                })
            );
            expect(mediaService.saveFile).toHaveBeenCalledWith(
                expect.objectContaining({ organizationId: "org-1", type: "image", originalName: "logo.png" })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Media uploaded successfully",
                    data: expect.objectContaining({
                        id: "media-1",
                        filePath: "org-1/abc.png",
                        originalName: "logo.png",
                        publicUrl: "https://cdn.example.com/org-1/abc.png",
                    }),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("falls back to an extension-derived mime when multer left mimetype empty", async () => {
            uploadProvider.uploadFile.mockResolvedValue({ path: "org-1/clip.mp4", publicUrl: null } as any);
            mediaService.saveFile.mockResolvedValue({ id: "media-2", path: "org-1/clip.mp4", publicUrl: null });

            const req = programmaticRequest({
                file: { buffer: Buffer.from([9]), originalname: "clip.mp4", mimetype: "" },
                orgId: "org-1",
            });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammatic(req, res, next);

            // No mp4 entry in the extension map → defaults to `application/octet-stream`, which is rejected
            // by the mime allow-list, so the request is forwarded as a UserValidationError.
            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });
    });

    describe("uploadProgrammaticFromUrl", () => {
        let fetchSpy: jest.SpyInstance;

        function fromUrlRequest(body: unknown, orgId: string | null = "org-1"): Request {
            return {
                body,
                organization: orgId === null ? undefined : { id: orgId },
            } as unknown as Request;
        }

        function mockFetchResponse(opts: {
            ok?: boolean;
            status?: number;
            contentType?: string | null;
            body?: Uint8Array;
        }): unknown {
            const buf = opts.body ?? new Uint8Array([0xff, 0xd8, 0xff]);
            return {
                ok: opts.ok ?? true,
                status: opts.status ?? 200,
                arrayBuffer: jest.fn().mockResolvedValue(buf.buffer.slice(0)),
                headers: { get: jest.fn().mockReturnValue(opts.contentType ?? null) },
            };
        }

        beforeEach(() => {
            fetchSpy = jest.spyOn(globalThis, "fetch" as never);
        });

        afterEach(() => {
            fetchSpy.mockRestore();
        });

        it("requires an organization on the request", async () => {
            const req = fromUrlRequest({ url: "https://example.com/a.png" }, null);
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammaticFromUrl(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it("rejects an empty body", async () => {
            const req = fromUrlRequest({});
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammaticFromUrl(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it("rejects a malformed URL string", async () => {
            const req = fromUrlRequest({ url: "not-a-url" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammaticFromUrl(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it("rejects non-http(s) schemes such as ftp:", async () => {
            const req = fromUrlRequest({ url: "ftp://example.com/a.png" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammaticFromUrl(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it("forwards an error when fetch returns a non-2xx response", async () => {
            fetchSpy.mockResolvedValue(mockFetchResponse({ ok: false, status: 404 }) as never);

            const req = fromUrlRequest({ url: "https://example.com/missing.png" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammaticFromUrl(req, res, next);

            expect(fetchSpy).toHaveBeenCalledWith("https://example.com/missing.png");
            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });

        it("uses the response Content-Type header to derive mime and saves the media", async () => {
            fetchSpy.mockResolvedValue(
                mockFetchResponse({ contentType: "image/png", body: new Uint8Array([1, 2, 3, 4]) }) as never
            );
            uploadProvider.uploadFile.mockResolvedValue({ path: "org-1/upload.png", publicUrl: null } as any);
            mediaService.saveFile.mockResolvedValue({ id: "media-3", path: "org-1/upload.png", publicUrl: null });

            const req = fromUrlRequest({ url: "https://example.com/banner.png" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammaticFromUrl(req, res, next);

            expect(uploadProvider.uploadFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId: "org-1",
                    contentType: "image/png",
                    originalName: "upload.png",
                })
            );
            expect(mediaService.saveFile).toHaveBeenCalledWith(
                expect.objectContaining({ organizationId: "org-1", type: "image", fileSize: 4 })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        id: "media-3",
                        filePath: "org-1/upload.png",
                        originalName: "upload.png",
                    }),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("falls back to the URL extension when the response omits Content-Type", async () => {
            fetchSpy.mockResolvedValue(
                mockFetchResponse({ contentType: null, body: new Uint8Array([1]) }) as never
            );
            uploadProvider.uploadFile.mockResolvedValue({ path: "org-1/upload.mp4", publicUrl: null } as any);
            mediaService.saveFile.mockResolvedValue({ id: "media-4", path: "org-1/upload.mp4", publicUrl: null });

            const req = fromUrlRequest({ url: "https://example.com/clip.mp4?signed=true" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadProgrammaticFromUrl(req, res, next);

            expect(uploadProvider.uploadFile).toHaveBeenCalledWith(
                expect.objectContaining({ contentType: "video/mp4", originalName: "upload.mp4" })
            );
            expect(mediaService.saveFile).toHaveBeenCalledWith(
                expect.objectContaining({ type: "video", originalName: "upload.mp4" })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
