/// <reference types="jest" />
import { createServer, get } from "node:http";
import { buildHealthPayload } from "./workerHealthServer.js";

const mockQuit = jest.fn().mockResolvedValue("OK");
const mockPing = jest.fn().mockResolvedValue("PONG");

jest.mock("backend/config/GlobalConfig.js", () => ({
    config: {
        orchestratorWorker: { healthPort: 0 },
    },
}));

jest.mock("backend/connections/bullmq/createQueueIoredis.js", () => ({
    createQueueIoredisClient: jest.fn(() => ({
        ping: mockPing,
        quit: mockQuit,
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

describe("buildHealthPayload", () => {
    beforeEach(() => {
        mockPing.mockClear();
        mockQuit.mockClear();
    });

    it("returns ok when Redis PING succeeds and includes queue counts", async () => {
        const body = await buildHealthPayload({ label: "test-worker", queueName: "test-queue" });
        expect(body.status).toBe("ok");
        expect(body.worker).toBe("test-worker");
        expect(body.redis).toBe("ok");
        expect(body.queue).toEqual({ waiting: 1, delayed: 2, active: 0, failed: 0 });
        expect(mockPing).toHaveBeenCalled();
        expect(mockQuit).toHaveBeenCalled();
    });

    it("returns error when Redis PING fails", async () => {
        mockPing.mockRejectedValueOnce(new Error("connection refused"));
        const body = await buildHealthPayload({ label: "test-worker" });
        expect(body.status).toBe("error");
        expect(body.redis).toBe("error");
        expect(body.error).toContain("connection refused");
    });
});

describe("GET /health/status response shape", () => {
    it("serializes a healthy payload for uptime monitors", async () => {
        const body = await buildHealthPayload({ label: "integration-refresh", queueName: "integration-refresh" });

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
