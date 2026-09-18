/// <reference types="jest" />
import { createServer, get } from "node:http";
import type IORedis from "ioredis";
import { buildHealthPayload } from "./workerHealthServer.js";

const mockSharedQuit = jest.fn().mockResolvedValue("OK");
const mockSharedPing = jest.fn().mockResolvedValue("PONG");
const mockInjectedQuit = jest.fn().mockResolvedValue("OK");
const mockInjectedPing = jest.fn().mockResolvedValue("PONG");

jest.mock("backend/connections/bullmq/createQueueIoredis.js", () => ({
    getSharedQueueIoredisClient: jest.fn(() => ({
        ping: mockSharedPing,
        quit: mockSharedQuit,
    })),
}));

jest.mock("bullmq", () => ({
    Queue: jest.fn().mockImplementation(() => ({
        getJobCounts: jest.fn().mockResolvedValue({
            waiting: 1,
            delayed: 2,
            active: 0,
            failed: 0,
        }),
        close: jest.fn().mockResolvedValue(undefined),
    })),
}));

function injectedRedis(): IORedis {
    return {
        ping: mockInjectedPing,
        quit: mockInjectedQuit,
    } as unknown as IORedis;
}

describe("buildHealthPayload", () => {
    beforeEach(() => {
        mockSharedPing.mockClear();
        mockSharedQuit.mockClear();
        mockInjectedPing.mockClear();
        mockInjectedQuit.mockClear();
    });

    it("returns ok when injected Redis PING succeeds and includes queue counts without quitting", async () => {
        const redis = injectedRedis();
        const body = await buildHealthPayload({ label: "test-worker", queueName: "test-queue", redis });
        expect(body.status).toBe("ok");
        expect(body.worker).toBe("test-worker");
        expect(body.redis).toBe("ok");
        expect(body.queue).toEqual({ waiting: 1, delayed: 2, active: 0, failed: 0 });
        expect(mockInjectedPing).toHaveBeenCalled();
        expect(mockInjectedQuit).not.toHaveBeenCalled();
        expect(mockSharedPing).not.toHaveBeenCalled();
        expect(mockSharedQuit).not.toHaveBeenCalled();
    });

    it("returns error when injected Redis PING fails without quitting", async () => {
        const redis = injectedRedis();
        mockInjectedPing.mockRejectedValueOnce(new Error("connection refused"));
        const body = await buildHealthPayload({ label: "test-worker", redis });
        expect(body.status).toBe("error");
        expect(body.redis).toBe("error");
        expect(body.error).toContain("connection refused");
        expect(mockInjectedQuit).not.toHaveBeenCalled();
    });

    it("falls back to shared redis when none is injected and does not quit", async () => {
        const body = await buildHealthPayload({ label: "test-worker" });
        expect(body.status).toBe("ok");
        expect(body.redis).toBe("ok");
        expect(mockSharedPing).toHaveBeenCalled();
        expect(mockSharedQuit).not.toHaveBeenCalled();
    });
});

describe("GET /health/status response shape", () => {
    it("serializes a healthy payload for uptime monitors", async () => {
        const body = await buildHealthPayload({
            label: "integration-refresh",
            queueName: "integration-refresh",
            redis: injectedRedis(),
        });

        await new Promise<void>((resolve, reject) => {
            const server = createServer((req, res) => {
                if (req.url?.startsWith("/health")) {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify(body));
                    return;
                }
                res.writeHead(404);
                res.end();
            });
            server.listen(0, () => {
                const addr = server.address();
                if (!addr || typeof addr === "string") {
                    reject(new Error("no port"));
                    return;
                }
                get(`http://127.0.0.1:${addr.port}/health/status`, (res) => {
                    let data = "";
                    res.on("data", (c) => {
                        data += c;
                    });
                    res.on("end", () => {
                        try {
                            expect(res.statusCode).toBe(200);
                            const json = JSON.parse(data) as { status: string; worker: string };
                            expect(json.status).toBe("ok");
                            expect(json.worker).toBe("integration-refresh");
                            server.close(() => resolve());
                        } catch (e) {
                            server.close(() => reject(e));
                        }
                    });
                }).on("error", (err) => {
                    server.close(() => reject(err));
                });
            });
        });
    });
});
