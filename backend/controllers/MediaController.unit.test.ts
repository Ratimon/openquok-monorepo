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

    describe("download", () => {
        it("requires authentication", async () => {
            const req = { query: { path: "auth-1.png" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.download(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect((err as Error).message).toBe("Authentication required");
            expect(storageR2Repository.downloadObject).not.toHaveBeenCalled();
        });

        it("requires organizationId when authenticated", async () => {
            const req = { query: {}, user: { id: "auth-uuid" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.download(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(storageR2Repository.downloadObject).not.toHaveBeenCalled();
        });

        it("streams buffer from R2 when media exists in org", async () => {
            const buffer = Buffer.from([1, 2, 3]);
            uploadProvider.downloadObject.mockResolvedValue({ buffer, contentType: "image/png" } as any);
            mediaService.getMediaByPath.mockResolvedValue({
                id: "m1",
                name: "k.png",
                original_name: null,
                path: "k9j8h7g6f5e4d3c2b1a0.png",
                organization_id: "org-1",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                file_size: 123,
                type: "image",
                thumbnail: null,
                alt: null,
                thumbnail_timestamp: null,
            } as any);

            const req = {
                query: { organizationId: "org-1", path: "k9j8h7g6f5e4d3c2b1a0.png" },
                user: { id: "auth-uuid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.download(req, res, next);

            expect(uploadProvider.downloadObject).toHaveBeenCalledWith("k9j8h7g6f5e4d3c2b1a0.png");
            expect(res.send).toHaveBeenCalledWith(buffer);
            expect(next).not.toHaveBeenCalled();
        });

        it("rejects download when media not found in org", async () => {
            mediaService.getMediaByPath.mockResolvedValue(null);
            const req = {
                query: { organizationId: "org-1", path: "missing.png" },
                user: { id: "auth-uuid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.download(req, res, next);

            expect(uploadProvider.downloadObject).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as Error).message).toContain("do not have access");
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
});
