import {
    createRateLimitStore,
    isRateLimitRedisStoreActive,
    resetRateLimitStoreForTests,
    warmUpRateLimitRedisStore,
} from "./rateLimitStore";

const mockConnect = jest.fn();
const mockPing = jest.fn();
const mockQuit = jest.fn();
const mockDisconnect = jest.fn();
const mockCall = jest.fn();

jest.mock("ioredis", () => {
    return jest.fn().mockImplementation(() => ({
        connect: mockConnect,
        ping: mockPing,
        quit: mockQuit,
        disconnect: mockDisconnect,
        call: mockCall,
        on: jest.fn(),
    }));
});

jest.mock("rate-limit-redis", () => ({
    RedisStore: jest.fn().mockImplementation((options: { prefix?: string }) => ({
        prefix: options.prefix,
    })),
}));

jest.mock("../utils/Logger", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("../config/GlobalConfig", () => ({
    config: {
        rateLimit: {
            redis: {
                enabled: false,
                keyPrefix: "rl:",
                db: 0,
            },
        },
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

const { config } = jest.requireMock("../config/GlobalConfig") as {
    config: {
        rateLimit: { redis: { enabled: boolean; keyPrefix: string; db: number } };
        cache: { redis: { host: string } };
    };
};

describe("rateLimitStore", () => {
    beforeEach(() => {
        resetRateLimitStoreForTests();
        jest.clearAllMocks();
        config.rateLimit.redis.enabled = false;
        config.cache.redis.host = "127.0.0.1";
        mockConnect.mockResolvedValue(undefined);
        mockPing.mockResolvedValue("PONG");
        mockQuit.mockResolvedValue("OK");
    });

    it("returns undefined store when Redis is disabled", async () => {
        await warmUpRateLimitRedisStore();
        expect(createRateLimitStore("global")).toBeUndefined();
        expect(isRateLimitRedisStoreActive()).toBe(false);
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it("connects and creates prefixed Redis stores when enabled", async () => {
        config.rateLimit.redis.enabled = true;
        await warmUpRateLimitRedisStore();

        expect(isRateLimitRedisStoreActive()).toBe(true);
        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(mockPing).toHaveBeenCalledTimes(1);

        const store = createRateLimitStore("global");
        expect(store).toEqual({ prefix: "rl:global:" });
    });

    it("falls back to memory when Redis host is missing", async () => {
        config.rateLimit.redis.enabled = true;
        config.cache.redis.host = "";
        await warmUpRateLimitRedisStore();

        expect(isRateLimitRedisStoreActive()).toBe(false);
        expect(createRateLimitStore("global")).toBeUndefined();
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it("falls back to memory when ping fails", async () => {
        config.rateLimit.redis.enabled = true;
        mockPing.mockRejectedValueOnce(new Error("ECONNREFUSED"));

        await warmUpRateLimitRedisStore();

        expect(isRateLimitRedisStoreActive()).toBe(false);
        expect(createRateLimitStore("session")).toBeUndefined();
        expect(mockQuit).toHaveBeenCalled();
    });
});
