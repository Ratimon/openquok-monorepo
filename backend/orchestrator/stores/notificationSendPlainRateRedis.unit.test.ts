/// <reference types="jest" />
/**
 * Redis-backed global send-plain slot (~700ms spacing across concurrent BullMQ workers).
 *
 * The Flowcraft [pausing guide](https://flowcraft.js.org/guide/pausing) applies to in-process `sleep` / `wait`
 * with a scheduler. The BullMQ adapter runs concurrent workers and does not expose worker limiter options in
 * our setup, so a **distributed throttle** (Redis `SET NX` + spin) fits better than embedding sleep nodes in
 * the send-plain blueprint.
 *
 * Worker wiring: `runNotificationEmailBullMqWorker` passes `acquireSendPlainSlot` into Flowcraft dependencies;
 * `notificationSendPlainDispatchNode` calls it before `sendPlain`. See also
 * `notificationEmailWorkflow.unit.test.ts` for dispatch ordering.
 */
import type IORedis from "ioredis";
import { acquireNotificationSendPlainSlot } from "./notificationSendPlainRateRedis";

describe("acquireNotificationSendPlainSlot (Redis global send-plain slot)", () => {
    it("no-ops when minIntervalMs is 0", async () => {
        const set = jest.fn();
        const redis = { set } as unknown as IORedis;
        await acquireNotificationSendPlainSlot(redis, 0);
        expect(set).not.toHaveBeenCalled();
    });

    it("uses SET NX PX on one key so concurrent workers coordinate spacing (not per-run Flowcraft sleep)", async () => {
        const set = jest.fn().mockResolvedValue("OK");
        const redis = { set } as unknown as IORedis;
        await acquireNotificationSendPlainSlot(redis, 700);
        expect(set).toHaveBeenCalledWith("notificationEmail:sendPlain:slot", "1", "PX", 700, "NX");
    });

    it("retries until SET NX succeeds", async () => {
        jest.useFakeTimers();
        const set = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce("OK");
        const redis = { set } as unknown as IORedis;
        const done = acquireNotificationSendPlainSlot(redis, 100);
        await Promise.resolve();
        await jest.advanceTimersByTimeAsync(20);
        await done;
        expect(set).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
    });
});
