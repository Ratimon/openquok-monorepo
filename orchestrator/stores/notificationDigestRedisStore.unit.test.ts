import type IORedis from "ioredis";
import {
    acknowledgeNotificationDigestBatch,
    appendNotificationDigestEntry,
    listPendingNotificationDigestBatches,
} from "./notificationDigestRedisStore.js";

function createMockRedis(overrides: Partial<IORedis> = {}): IORedis {
    return {
        rpush: jest.fn().mockResolvedValue(1),
        sadd: jest.fn().mockResolvedValue(1),
        smembers: jest.fn().mockResolvedValue([]),
        lrange: jest.fn().mockResolvedValue([]),
        ltrim: jest.fn().mockResolvedValue("OK"),
        llen: jest.fn().mockResolvedValue(0),
        del: jest.fn().mockResolvedValue(1),
        srem: jest.fn().mockResolvedValue(1),
        ...overrides,
    } as unknown as IORedis;
}

describe("notificationDigestRedisStore", () => {
    it("appendNotificationDigestEntry RPUSHes and tracks the org", async () => {
        const redis = createMockRedis();
        const entry = { subject: "s", message: "m", type: "success" as const };

        await appendNotificationDigestEntry(redis, "org-1", entry);

        expect(redis.rpush).toHaveBeenCalledWith(
            "notificationDigest:list:org-1",
            JSON.stringify(entry)
        );
        expect(redis.sadd).toHaveBeenCalledWith("notificationDigest:pendingOrgs", "org-1");
    });

    it("listPendingNotificationDigestBatches reads without deleting", async () => {
        const entries = [
            { subject: "a", message: "one", type: "success" as const },
            { subject: "b", message: "two", type: "success" as const },
        ];
        const redis = createMockRedis({
            smembers: jest.fn().mockResolvedValue(["org-1"]),
            lrange: jest.fn().mockResolvedValue(entries.map((e) => JSON.stringify(e))),
        });

        const batches = await listPendingNotificationDigestBatches(redis);

        expect(batches).toEqual([{ organizationId: "org-1", entries }]);
        expect(redis.del).not.toHaveBeenCalled();
        expect(redis.ltrim).not.toHaveBeenCalled();
        expect(redis.srem).not.toHaveBeenCalled();
    });

    it("acknowledgeNotificationDigestBatch LTRIMs consumed prefix and clears empty lists", async () => {
        const redis = createMockRedis({
            llen: jest.fn().mockResolvedValue(0),
        });

        await acknowledgeNotificationDigestBatch(redis, "org-1", 2);

        expect(redis.ltrim).toHaveBeenCalledWith("notificationDigest:list:org-1", 2, -1);
        expect(redis.del).toHaveBeenCalledWith("notificationDigest:list:org-1");
        expect(redis.srem).toHaveBeenCalledWith("notificationDigest:pendingOrgs", "org-1");
    });

    it("acknowledgeNotificationDigestBatch keeps pending org when items remain", async () => {
        const redis = createMockRedis({
            llen: jest.fn().mockResolvedValue(1),
        });

        await acknowledgeNotificationDigestBatch(redis, "org-1", 2);

        expect(redis.ltrim).toHaveBeenCalledWith("notificationDigest:list:org-1", 2, -1);
        expect(redis.del).not.toHaveBeenCalled();
        expect(redis.srem).not.toHaveBeenCalled();
    });
});
