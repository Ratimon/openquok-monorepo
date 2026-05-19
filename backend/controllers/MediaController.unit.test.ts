import type { Request, Response, NextFunction } from "express";
import { mediaFileManagerId } from "openquok-common";

import type { StorageR2Repository } from "../repositories/StorageR2Repository";
import type { MediaService } from "../services/MediaService";
import type { IUploadProvider } from "../connections/upload/upload.interface";

import { MediaController } from "./MediaController";

const MEDIA_ID = "550e8400-e29b-41d4-a716-446655440000";
const ORG_ID = "org-1";
const AUTH_USER = { id: "auth-uid" };

function fileManagerId(virtualPath = "/General", displayName = "photo.png"): string {
    return mediaFileManagerId(virtualPath, MEDIA_ID, displayName);
}

function createMockResponse(): jest.Mocked<Response> {
    return {
        set: jest.fn(),
        send: jest.fn(),
        end: jest.fn(),
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
            createMultipartUpload: jest.fn(),
            prepareUploadParts: jest.fn(),
            signPart: jest.fn(),
            listParts: jest.fn(),
            abortMultipartUpload: jest.fn(),
            completeMultipartUpload: jest.fn(),
        } as unknown as jest.Mocked<StorageR2Repository>;

        mediaService = {
            getMedia: jest.fn(),
            saveFile: jest.fn(),
            getMediaById: jest.fn(),
            getMediaByPath: jest.fn(),
            softDeleteMedia: jest.fn(),
            saveMediaInformation: jest.fn(),
            listAllMedia: jest.fn(),
            updateVirtualPaths: jest.fn(),
            duplicateMedia: jest.fn(),
            renameMediaDisplayName: jest.fn(),
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
        it("requires authentication", async () => {
            const req = { query: { organizationId: ORG_ID } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.list(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.getMedia).not.toHaveBeenCalled();
        });

        it("requires organizationId query parameter", async () => {
            const req = { query: {}, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.list(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.getMedia).not.toHaveBeenCalled();
        });

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

    describe("tree", () => {
        it("requires authentication", async () => {
            const req = { query: { organizationId: ORG_ID } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.tree(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.listAllMedia).not.toHaveBeenCalled();
        });

        it("requires organizationId query parameter", async () => {
            const req = { query: {}, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.tree(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.listAllMedia).not.toHaveBeenCalled();
        });

        it("returns file tree entities and drive usage", async () => {
            mediaService.listAllMedia.mockResolvedValue([
                {
                    id: MEDIA_ID,
                    path: "a1b2.png",
                    virtualPath: "/General",
                    name: "a1b2.png",
                    size: 1024,
                    lastModified: "2026-04-12T00:00:00.000Z",
                    publicUrl: null,
                    kind: "image",
                    alt: null,
                    thumbnail: null,
                    thumbnailPublicUrl: null,
                    thumbnailTimestamp: null,
                },
            ]);

            const req = { query: { organizationId: ORG_ID }, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.tree(req, res, next);

            expect(mediaService.listAllMedia).toHaveBeenCalledWith(ORG_ID);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    files: expect.arrayContaining([
                        expect.objectContaining({ type: "file", mediaId: MEDIA_ID }),
                    ]),
                    drive: {
                        used: 1024,
                        total: expect.any(Number),
                    },
                },
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("move", () => {
        it("requires authentication", async () => {
            const req = {
                body: { organizationId: ORG_ID, ids: [fileManagerId()], target: "/Posts" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.move(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.updateVirtualPaths).not.toHaveBeenCalled();
        });

        it("requires ids and target", async () => {
            const req = { body: { organizationId: ORG_ID }, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.move(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.updateVirtualPaths).not.toHaveBeenCalled();
        });

        it("rejects when no ids parse as movable files", async () => {
            const req = {
                body: { organizationId: ORG_ID, ids: ["not-a-valid-id"], target: "/Posts" },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.move(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.updateVirtualPaths).not.toHaveBeenCalled();
        });

        it("updates virtual paths for valid file manager ids", async () => {
            const id = fileManagerId("/General", "clip.mp4");
            mediaService.updateVirtualPaths.mockResolvedValue(1);

            const req = {
                body: { organizationId: ORG_ID, ids: [id], target: "/Posts" },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.move(req, res, next);

            expect(mediaService.updateVirtualPaths).toHaveBeenCalledWith(ORG_ID, [
                { id: MEDIA_ID, virtualPath: "/Posts" },
            ]);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { moved: 1 } });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("copy", () => {
        it("requires authentication", async () => {
            const req = {
                body: { organizationId: ORG_ID, ids: [fileManagerId()], target: "/Posts" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.copy(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.duplicateMedia).not.toHaveBeenCalled();
        });

        it("duplicates media for valid file manager ids", async () => {
            const id = fileManagerId("/General", "clip.mp4");
            mediaService.duplicateMedia.mockResolvedValue(1);

            const req = {
                body: { organizationId: ORG_ID, ids: [id], target: "/Posts" },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.copy(req, res, next);

            expect(mediaService.duplicateMedia).toHaveBeenCalledWith(ORG_ID, [MEDIA_ID], "/Posts");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { copied: 1 } });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("rename", () => {
        it("requires authentication", async () => {
            const req = {
                body: { organizationId: ORG_ID, id: fileManagerId(), name: "new.png" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.rename(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.renameMediaDisplayName).not.toHaveBeenCalled();
        });

        it("requires id and name", async () => {
            const req = { body: { organizationId: ORG_ID }, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.rename(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.renameMediaDisplayName).not.toHaveBeenCalled();
        });

        it("rejects an invalid file manager id", async () => {
            const req = {
                body: { organizationId: ORG_ID, id: "bad-id", name: "new.png" },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.rename(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.renameMediaDisplayName).not.toHaveBeenCalled();
        });

        it("renames display name when media exists", async () => {
            mediaService.renameMediaDisplayName.mockResolvedValue(true);

            const req = {
                body: { organizationId: ORG_ID, id: fileManagerId(), name: "renamed.png" },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.rename(req, res, next);

            expect(mediaService.renameMediaDisplayName).toHaveBeenCalledWith(
                ORG_ID,
                MEDIA_ID,
                "renamed.png"
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true });
            expect(next).not.toHaveBeenCalled();
        });

        it("forwards error when media is not found", async () => {
            mediaService.renameMediaDisplayName.mockResolvedValue(false);

            const req = {
                body: { organizationId: ORG_ID, id: fileManagerId(), name: "renamed.png" },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.rename(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
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

        it("requires a multipart file", async () => {
            const req = { body: { organizationId: ORG_ID }, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });

        it("requires organizationId", async () => {
            const req = {
                file: { buffer: Buffer.from([1]), originalname: "a.png", mimetype: "image/png" },
                body: {},
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });

        it("rejects unsupported mime types", async () => {
            const req = {
                file: { buffer: Buffer.from([1]), originalname: "a.txt", mimetype: "text/plain" },
                body: { organizationId: ORG_ID },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });
    });

    describe("uploadServer", () => {
        it("requires a multipart file", async () => {
            const req = { user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadServer(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.uploadFile).not.toHaveBeenCalled();
        });

        it("uploads and returns originalName", async () => {
            uploadProvider.uploadFile.mockResolvedValue({ path: "x1y2.png", publicUrl: null } as any);
            mediaService.saveFile.mockResolvedValue({ id: "m1", path: "x1y2.png", publicUrl: null });

            const req = {
                file: { buffer: Buffer.from([1]), originalname: "logo.png", mimetype: "image/png" },
                body: { organizationId: ORG_ID },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadServer(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        filePath: "x1y2.png",
                        originalName: "logo.png",
                        id: "m1",
                    }),
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

        it("when preventSave=false, persists media and returns saved envelope", async () => {
            uploadProvider.uploadFile.mockResolvedValue({ path: "p0o9.png", publicUrl: null } as any);
            mediaService.saveFile.mockResolvedValue({ id: "m9", path: "p0o9.png", publicUrl: null });

            const req = {
                file: { buffer: Buffer.from([9]), originalname: "a.png", mimetype: "image/png" },
                body: { preventSave: "false", organizationId: ORG_ID },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.uploadSimple(req, res, next);

            expect(mediaService.saveFile).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({ id: "m9", originalName: "a.png" }),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("multipart", () => {
        function multipartReq(
            endpoint: string,
            body: Record<string, unknown> = {},
            opts: { authenticated?: boolean } = {}
        ): Request {
            const authenticated = opts.authenticated ?? true;
            return {
                params: { endpoint },
                body: { organizationId: ORG_ID, ...body },
                ...(authenticated ? { user: AUTH_USER } : {}),
            } as unknown as Request;
        }

        it("requires authentication", async () => {
            const req = multipartReq("create-multipart-upload", {}, { authenticated: false });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(storageR2Repository.createMultipartUpload).not.toHaveBeenCalled();
        });

        it("create-multipart-upload returns repository payload", async () => {
            storageR2Repository.createMultipartUpload.mockResolvedValue({ uploadId: "up-1", key: "k1.png" });

            const req = multipartReq("create-multipart-upload", {
                file: { name: "photo.png" },
                contentType: "image/png",
            });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(storageR2Repository.createMultipartUpload).toHaveBeenCalledWith(
                expect.objectContaining({ contentType: "image/png" })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ uploadId: "up-1", key: "k1.png" });
            expect(next).not.toHaveBeenCalled();
        });

        it("prepare-upload-parts delegates to repository", async () => {
            storageR2Repository.prepareUploadParts.mockResolvedValue({ presignedUrls: {} });

            const req = multipartReq("prepare-upload-parts", {
                partData: { key: "k1", uploadId: "up-1", parts: [{ number: 1 }] },
            });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(storageR2Repository.prepareUploadParts).toHaveBeenCalledWith({
                key: "k1",
                uploadId: "up-1",
                parts: [{ number: 1 }],
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });

        it("sign-part delegates to repository", async () => {
            storageR2Repository.signPart.mockResolvedValue({ url: "https://signed.example/part" });

            const req = multipartReq("sign-part", { key: "k1", uploadId: "up-1", partNumber: "2" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(storageR2Repository.signPart).toHaveBeenCalledWith({
                key: "k1",
                uploadId: "up-1",
                partNumber: 2,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });

        it("list-parts delegates to repository", async () => {
            storageR2Repository.listParts.mockResolvedValue({ Parts: [] });

            const req = multipartReq("list-parts", { key: "k1", uploadId: "up-1" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(storageR2Repository.listParts).toHaveBeenCalledWith({ key: "k1", uploadId: "up-1" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });

        it("abort-multipart-upload delegates to repository", async () => {
            storageR2Repository.abortMultipartUpload.mockResolvedValue({});

            const req = multipartReq("abort-multipart-upload", { key: "k1", uploadId: "up-1" });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(storageR2Repository.abortMultipartUpload).toHaveBeenCalledWith({
                key: "k1",
                uploadId: "up-1",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });

        it("complete-multipart-upload saves media and merges saved into response", async () => {
            storageR2Repository.completeMultipartUpload.mockResolvedValue({ Location: "k1.png" });
            mediaService.saveFile.mockResolvedValue({ id: "m5", path: "k1.png", publicUrl: null });

            const req = multipartReq("complete-multipart-upload", {
                key: "k1.png",
                uploadId: "up-1",
                parts: [{ ETag: '"etag"', PartNumber: 1 }],
                file: { name: "photo.png", size: 512 },
                contentType: "image/png",
            });
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(storageR2Repository.completeMultipartUpload).toHaveBeenCalled();
            expect(mediaService.saveFile).toHaveBeenCalledWith(
                expect.objectContaining({ organizationId: ORG_ID, path: "k1.png", type: "image" })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    Location: "k1.png",
                    saved: { id: "m5", path: "k1.png", publicUrl: null },
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it("returns 404 for unknown endpoints", async () => {
            const req = multipartReq("unknown-endpoint");
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.multipart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.end).toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("forwards error when neither id nor path resolves to media", async () => {
            const req = { body: { organizationId: ORG_ID }, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(uploadProvider.deleteObject).not.toHaveBeenCalled();
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

        it("deletes object by id when owned by the authenticated user", async () => {
            uploadProvider.deleteObject.mockResolvedValue(undefined);
            mediaService.getMediaById.mockResolvedValue({
                id: MEDIA_ID,
                path: "k9j8.png",
                organization_id: ORG_ID,
            } as any);
            mediaService.softDeleteMedia.mockResolvedValue(true);

            const req = {
                body: { organizationId: ORG_ID, id: MEDIA_ID },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(mediaService.getMediaById).toHaveBeenCalledWith(ORG_ID, MEDIA_ID);
            expect(uploadProvider.deleteObject).toHaveBeenCalledWith("k9j8.png");
            expect(mediaService.softDeleteMedia).toHaveBeenCalledWith(ORG_ID, MEDIA_ID);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("saveMedia", () => {
        it("requires name", async () => {
            const req = { body: {}, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.saveMedia(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it("persists metadata for an existing object key", async () => {
            mediaService.saveFile.mockResolvedValue({
                id: MEDIA_ID,
                path: "stored.png",
                publicUrl: "https://cdn.example.com/stored.png",
            });

            const req = {
                body: {
                    organizationId: ORG_ID,
                    name: "stored.png",
                    originalName: "upload.png",
                    fileSize: 2048,
                    type: "image",
                },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.saveMedia(req, res, next);

            expect(mediaService.saveFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId: ORG_ID,
                    path: "stored.png",
                    originalName: "upload.png",
                    fileSize: 2048,
                    type: "image",
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: MEDIA_ID,
                    path: "stored.png",
                    publicUrl: "https://cdn.example.com/stored.png",
                    originalName: "upload.png",
                },
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("saveMediaInformation", () => {
        it("requires authentication", async () => {
            const req = {
                body: { organizationId: ORG_ID, id: MEDIA_ID, alt: "desc" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.saveMediaInformation(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.saveMediaInformation).not.toHaveBeenCalled();
        });

        it("requires organizationId and id", async () => {
            const req = { body: {}, user: AUTH_USER } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.saveMediaInformation(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(mediaService.saveMediaInformation).not.toHaveBeenCalled();
        });

        it("updates alt and thumbnail fields", async () => {
            const updated = { id: MEDIA_ID, alt: "cover", thumbnail: "thumb.png" };
            mediaService.saveMediaInformation.mockResolvedValue(updated as any);

            const req = {
                body: {
                    organizationId: ORG_ID,
                    id: MEDIA_ID,
                    alt: "cover",
                    thumbnail: "thumb.png",
                    thumbnailTimestamp: 1.5,
                },
                user: AUTH_USER,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.saveMediaInformation(req, res, next);

            expect(mediaService.saveMediaInformation).toHaveBeenCalledWith(ORG_ID, {
                id: MEDIA_ID,
                alt: "cover",
                thumbnail: "thumb.png",
                thumbnailTimestamp: 1.5,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
            expect(next).not.toHaveBeenCalled();
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
