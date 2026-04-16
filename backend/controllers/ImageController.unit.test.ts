import type { Request, Response, NextFunction } from "express";
import http from "http";
import https from "https";

import { ImageController } from "./ImageController";
import type { StorageSupabaseRepository } from "../repositories/StorageSupabaseRepository";

function createMockResponse(): jest.Mocked<Response> {
    return {
        set: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as jest.Mocked<Response>;
}

describe("ImageController", () => {
    let storageRepository: jest.Mocked<StorageSupabaseRepository>;
    let controller: ImageController;

    beforeEach(() => {
        storageRepository = {
            downloadImage: jest.fn(),
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
        } as unknown as jest.Mocked<StorageSupabaseRepository>;

        controller = new ImageController(storageRepository);
    });

    describe("getByUrl", () => {
        it("throws validation error when imageUrl and databaseName are missing", async () => {
            const req = { query: {} } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.getByUrl(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("ImageUrl and databaseName are required");
        });

        it("throws validation error when databaseName is invalid", async () => {
            const req = {
                query: { databaseName: "invalid", imageUrl: "some/key.png" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.getByUrl(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("Invalid databaseName");
            expect(storageRepository.downloadImage).not.toHaveBeenCalled();
        });

        it("forwards error when storage returns no data", async () => {
            storageRepository.downloadImage.mockResolvedValue({ data: null } as any);

            const req = {
                query: { databaseName: "avatars", imageUrl: "avatars/user-1.png" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.getByUrl(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe("No data returned from storage");
        });

        it("sets content type and streams buffer when storage returns a Buffer", async () => {
            const buffer = Buffer.from([1, 2, 3]);
            storageRepository.downloadImage.mockResolvedValue({ data: buffer } as any);

            const req = {
                query: { databaseName: "avatars", imageUrl: "avatars/user-1.png" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.getByUrl(req, res, next);

            expect(storageRepository.downloadImage).toHaveBeenCalledWith("avatars", "avatars/user-1.png");
            expect(res.set).toHaveBeenCalledWith("Content-Type", "application/octet-stream");
            expect(res.send).toHaveBeenCalledWith(buffer);
            expect(next).not.toHaveBeenCalled();
        });

        it("converts arrayBuffer payload to Buffer and uses provided type", async () => {
            const bytes = new Uint8Array([4, 5, 6]);
            const payload = {
                arrayBuffer: jest.fn().mockResolvedValue(bytes.buffer),
                type: "image/png",
            };
            storageRepository.downloadImage.mockResolvedValue({ data: payload } as any);

            const req = {
                query: { databaseName: "blog_images", imageUrl: "blog_images/post-1.png" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.getByUrl(req, res, next);

            expect(storageRepository.downloadImage).toHaveBeenCalledWith(
                "blog_images",
                "blog_images/post-1.png"
            );
            expect(res.set).toHaveBeenCalledWith("Content-Type", "image/png");
            expect(res.send).toHaveBeenCalledWith(Buffer.from(bytes));
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("upload", () => {
        it("throws validation error when image file and/or databaseName are missing", async () => {
            const req = { body: {}, file: undefined, user: { id: "auth-1" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("Image file and databaseName are required");
            expect(storageRepository.uploadImage).not.toHaveBeenCalled();
        });

        it("throws validation error when authentication is missing (no req.user.id)", async () => {
            const req = {
                body: { databaseName: "avatars" },
                file: {
                    buffer: Buffer.from([1]),
                    originalname: "a.png",
                    mimetype: "image/png",
                },
                user: undefined,
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("Authentication required");
            expect(storageRepository.uploadImage).not.toHaveBeenCalled();
        });

        it("throws validation error when databaseName is invalid", async () => {
            const req = {
                body: { databaseName: "invalid" },
                file: {
                    buffer: Buffer.from([1]),
                    originalname: "a.png",
                    mimetype: "image/png",
                },
                user: { id: "auth-1" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("Invalid databaseName");
            expect(storageRepository.uploadImage).not.toHaveBeenCalled();
        });

        it("uploads the image and returns filePath on success", async () => {
            storageRepository.uploadImage.mockResolvedValue("avatars/auth-1-random.png");

            const file = {
                buffer: Buffer.from([1, 2, 3]),
                originalname: "avatar.png",
                mimetype: "image/png",
            };

            const req = {
                body: { databaseName: "avatars" },
                file,
                user: { id: "auth-1" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.upload(req, res, next);

            expect(storageRepository.uploadImage).toHaveBeenCalledWith("avatars", file, "auth-1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { filePath: "avatars/auth-1-random.png" },
                message: "Image uploaded successfully",
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("throws validation error when imagePath and/or databaseName are missing", async () => {
            const req = { body: {} } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("ImagePath and databaseName are required");
            expect(storageRepository.deleteImage).not.toHaveBeenCalled();
        });

        it("throws validation error when databaseName is invalid", async () => {
            const req = { body: { databaseName: "invalid", imagePath: "any.png" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("Invalid databaseName");
            expect(storageRepository.deleteImage).not.toHaveBeenCalled();
        });

        it("deletes image and returns success on success", async () => {
            storageRepository.deleteImage.mockResolvedValue({ data: {}, error: null });

            const req = {
                body: { databaseName: "avatars", imagePath: "avatars/auth-1.png" },
            } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.delete(req, res, next);

            expect(storageRepository.deleteImage).toHaveBeenCalledWith("avatars", "avatars/auth-1.png");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Image deleted successfully",
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("proxyImage", () => {
        let httpGetSpy: jest.SpyInstance;
        let httpsGetSpy: jest.SpyInstance;

        beforeEach(() => {
            httpGetSpy = jest
                .spyOn(http as any, "get")
                .mockImplementation(() => ({ on: jest.fn().mockReturnThis(), destroy: jest.fn() }));
            httpsGetSpy = jest
                .spyOn(https as any, "get")
                .mockImplementation(() => ({ on: jest.fn().mockReturnThis(), destroy: jest.fn() }));
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("throws validation error when url query param is missing", async () => {
            const req = { query: {} } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.proxyImage(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("URL parameter is required");
            expect(httpGetSpy).not.toHaveBeenCalled();
            expect(httpsGetSpy).not.toHaveBeenCalled();
        });

        it("throws validation error when URL protocol is not http/https", async () => {
            const req = { query: { url: "ftp://example.com/image.png" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.proxyImage(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("Invalid URL protocol. Only HTTP and HTTPS are allowed.");
            expect(httpGetSpy).not.toHaveBeenCalled();
            expect(httpsGetSpy).not.toHaveBeenCalled();
        });

        it("forwards error when remote returns non-2xx status code", async () => {
            const mockRequest = {
                on: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
            };
            const response = {
                statusCode: 404,
                statusMessage: "Not Found",
                headers: { "content-type": "image/png" },
                pipe: jest.fn(),
                on: jest.fn(),
            };

            httpGetSpy.mockImplementation((_, __, callback) => {
                callback(response);
                return mockRequest;
            });

            const req = { query: { url: "http://example.com/image.png" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.proxyImage(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe("Failed to fetch image: 404 Not Found");
            expect(res.set).not.toHaveBeenCalledWith("Content-Type", expect.any(String));
            expect(response.pipe).not.toHaveBeenCalled();
        });

        it("throws validation error when remote content-type is not an image", async () => {
            const mockRequest = {
                on: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
            };
            const response = {
                statusCode: 200,
                statusMessage: "OK",
                headers: { "content-type": "text/plain" },
                pipe: jest.fn(),
                on: jest.fn(),
            };

            httpGetSpy.mockImplementation((_, __, callback) => {
                callback(response);
                return mockRequest;
            });

            const req = { query: { url: "http://example.com/image.png" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.proxyImage(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect((err as any).statusCode).toBe(400);
            expect((err as any).metadata?.errorCode).toBe("USER_VALIDATION_ERROR");
            expect(err.message).toBe("URL does not point to a valid image");
            expect(res.set).not.toHaveBeenCalledWith("Content-Type", expect.any(String));
            expect(response.pipe).not.toHaveBeenCalled();
        });

        it("proxies an image (sets headers, pipes response, resolves on end)", async () => {
            const mockRequest = {
                on: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
            };
            const response = {
                statusCode: 200,
                statusMessage: "OK",
                headers: { "content-type": "image/png" },
                pipe: jest.fn(),
                on: jest.fn((event: string, cb: () => void) => {
                    if (event === "end") cb();
                }),
            };

            httpGetSpy.mockImplementation((_, __, callback) => {
                callback(response);
                return mockRequest;
            });

            const req = { query: { url: "http://example.com/image.png" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.proxyImage(req, res, next);

            expect(res.set).toHaveBeenCalledWith("Content-Type", "image/png");
            expect(res.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
            expect(response.pipe).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it("forwards timeout error when upstream request times out", async () => {
            const mockRequest = {
                on: jest.fn((event: string, cb: () => void) => {
                    if (event === "timeout") cb();
                }),
                destroy: jest.fn(),
            };

            httpGetSpy.mockImplementation(() => mockRequest);

            const req = { query: { url: "http://example.com/image.png" } } as unknown as Request;
            const res = createMockResponse();
            const next = jest.fn() as unknown as NextFunction;

            await controller.proxyImage(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const err = (next as jest.Mock).mock.calls[0][0];
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe("Request timeout");
            expect(mockRequest.destroy).toHaveBeenCalled();
        });
    });
});

