import type { Request, Response, NextFunction } from "express";

import { MediaController } from "./MediaController";
import type { StorageR2Repository } from "../repositories/StorageR2Repository";

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

    beforeEach(() => {
        storageR2Repository = {
            downloadObject: jest.fn(),
            putObject: jest.fn(),
            deleteObject: jest.fn(),
        } as unknown as jest.Mocked<StorageR2Repository>;

        controller = new MediaController(storageR2Repository);
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

        it("requires path query when authenticated", async () => {
            const req = { query: {}, user: { id: "auth-uuid" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.download(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(storageR2Repository.downloadObject).not.toHaveBeenCalled();
        });

        it("streams buffer from R2 when path is owned by the authenticated user", async () => {
            const buffer = Buffer.from([1, 2, 3]);
            storageR2Repository.downloadObject.mockResolvedValue({ data: buffer } as any);

            const req = {
                query: { path: "auth-uuid-0.5.png" },
                user: { id: "auth-uuid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.download(req, res, next);

            expect(storageR2Repository.downloadObject).toHaveBeenCalledWith("auth-uuid-0.5.png");
            expect(res.send).toHaveBeenCalledWith(buffer);
            expect(next).not.toHaveBeenCalled();
        });

        it("rejects download when path is not owned by the authenticated user", async () => {
            const req = {
                query: { path: "other-user-0.5.png" },
                user: { id: "auth-uuid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.download(req, res, next);

            expect(storageR2Repository.downloadObject).not.toHaveBeenCalled();
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
            storageR2Repository.putObject.mockResolvedValue(undefined);

            const file = {
                buffer: Buffer.from([9]),
                originalname: "clip.mp4",
                mimetype: "video/mp4",
            };
            const req = {
                file,
                user: { id: "auth-uid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(storageR2Repository.putObject).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        filePath: expect.stringMatching(/^auth-uid-/),
                    }),
                    message: "Media uploaded successfully",
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
            storageR2Repository.deleteObject.mockResolvedValue(undefined);

            const req = {
                body: { path: "auth-uid-key.png" },
                user: { id: "auth-uid" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(storageR2Repository.deleteObject).toHaveBeenCalledWith("auth-uid-key.png");
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
