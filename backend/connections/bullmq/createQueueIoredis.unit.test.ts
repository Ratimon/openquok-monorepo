import IORedis from "ioredis";
import {
    createQueueIoredisClient,
    getSharedQueueIoredisClient,
    resetSharedQueueIoredisClientForTests,
} from "./createQueueIoredis";

const mockQuit = jest.fn().mockResolvedValue("OK");
const mockDisconnect = jest.fn();
const mockOn = jest.fn();

jest.mock("ioredis", () => {
    return jest.fn().mockImplementation(() => ({
        quit: mockQuit,
        disconnect: mockDisconnect,
        on: mockOn,
    }));
});

jest.mock("../../config/GlobalConfig", () => ({
    config: {
        cache: {
            redis: {
                host: "127.0.0.1",
                port: 6379,
                password: "",
                db: 0,
                tls: false,
                tlsRejectUnauthorized: true,
            },
        },
    },
}));

jest.mock("../../utils/Logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe("createQueueIoredis", () => {
    beforeEach(async () => {
        await resetSharedQueueIoredisClientForTests();
        jest.clearAllMocks();
        mockQuit.mockResolvedValue("OK");
    });

    afterEach(async () => {
        await resetSharedQueueIoredisClientForTests();
    });

    it("returns the same shared client on subsequent calls", () => {
        const first = getSharedQueueIoredisClient();
        const second = getSharedQueueIoredisClient();

        expect(first).toBe(second);
        expect(IORedis).toHaveBeenCalledTimes(1);
    });

    it("clears the singleton after reset so the next get creates a new client", async () => {
        const first = getSharedQueueIoredisClient();
        await resetSharedQueueIoredisClientForTests();

        expect(mockQuit).toHaveBeenCalledTimes(1);

        const second = getSharedQueueIoredisClient();
        expect(second).not.toBe(first);
        expect(IORedis).toHaveBeenCalledTimes(2);
    });

    it("is a no-op when reset is called with no shared client", async () => {
        await expect(resetSharedQueueIoredisClientForTests()).resolves.toBeUndefined();
        expect(mockQuit).not.toHaveBeenCalled();
        expect(IORedis).not.toHaveBeenCalled();
    });

    it("keeps createQueueIoredisClient ephemeral and separate from the shared client", () => {
        const shared = getSharedQueueIoredisClient();
        const ephemeral = createQueueIoredisClient();

        expect(ephemeral).not.toBe(shared);
        expect(IORedis).toHaveBeenCalledTimes(2);
    });
});
