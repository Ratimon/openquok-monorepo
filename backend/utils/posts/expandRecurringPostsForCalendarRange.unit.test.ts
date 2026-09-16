import { describe, expect, it } from "@jest/globals";
import type { SocialPostLike } from "../dtos/PostDTO";
import { expandRecurringPostsForCalendarRange } from "./expandRecurringPostsForCalendarRange";

function recurringRow(overrides: Partial<SocialPostLike> = {}): SocialPostLike {
    return {
        id: "post-1",
        state: "DRAFT",
        publish_date: "2030-06-01T12:00:00.000Z",
        organization_id: "org-1",
        integration_id: "int-1",
        content: "hello",
        delay: 0,
        post_group: "group-1",
        title: null,
        description: null,
        parent_post_id: null,
        release_id: null,
        release_url: null,
        settings: "{}",
        image: null,
        interval_in_days: 7,
        error: null,
        deleted_at: null,
        created_by_user_id: null,
        note: null,
        is_agent_edited: false,
        is_reviewed: false,
        created_at: "2030-05-01T00:00:00.000Z",
        updated_at: "2030-05-01T00:00:00.000Z",
        ...overrides,
    };
}

describe("expandRecurringPostsForCalendarRange", () => {
    it("expands weekly anchor before the visible window", () => {
        const rows = [recurringRow()];
        const out = expandRecurringPostsForCalendarRange(
            rows,
            "2030-06-15T00:00:00.000Z",
            "2030-06-30T23:59:59.999Z"
        );

        expect(out.map((r) => r.publish_date)).toEqual([
            "2030-06-15T12:00:00.000Z",
            "2030-06-22T12:00:00.000Z",
            "2030-06-29T12:00:00.000Z",
        ]);
        expect(out.every((r) => r.id === "post-1")).toBe(true);
        expect(out.every((r) => r.series_anchor_publish_date === "2030-06-01T12:00:00.000Z")).toBe(true);
    });

    it("passes through non-recurring rows unchanged", () => {
        const row = recurringRow({ interval_in_days: null });
        const out = expandRecurringPostsForCalendarRange(
            [row],
            "2030-06-01T00:00:00.000Z",
            "2030-06-30T23:59:59.999Z"
        );
        expect(out).toEqual([row]);
    });

    it("does not expand PUBLISHED recurring rows", () => {
        const row = recurringRow({ state: "PUBLISHED", publish_date: "2030-06-10T12:00:00.000Z" });
        const out = expandRecurringPostsForCalendarRange(
            [row],
            "2030-06-01T00:00:00.000Z",
            "2030-06-30T23:59:59.999Z"
        );
        expect(out).toEqual([row]);
    });

    it("dedupes by id and publish_date across input rows", () => {
        const row = recurringRow({ publish_date: "2030-06-15T12:00:00.000Z" });
        const out = expandRecurringPostsForCalendarRange(
            [row, { ...row }],
            "2030-06-15T00:00:00.000Z",
            "2030-06-22T23:59:59.999Z"
        );
        expect(out.map((r) => r.publish_date)).toEqual([
            "2030-06-15T12:00:00.000Z",
            "2030-06-22T12:00:00.000Z",
        ]);
    });

    it("includes anchor occurrence when it falls inside the range", () => {
        const row = recurringRow({ publish_date: "2030-06-08T09:30:00.000Z", interval_in_days: 7 });
        const out = expandRecurringPostsForCalendarRange(
            [row],
            "2030-06-08T00:00:00.000Z",
            "2030-06-22T23:59:59.999Z"
        );
        expect(out.map((r) => r.publish_date)).toEqual([
            "2030-06-08T09:30:00.000Z",
            "2030-06-15T09:30:00.000Z",
            "2030-06-22T09:30:00.000Z",
        ]);
        const anchor = out.find((r) => r.publish_date === "2030-06-08T09:30:00.000Z");
        const virtual = out.filter((r) => r.publish_date !== "2030-06-08T09:30:00.000Z");
        expect(anchor?.series_anchor_publish_date).toBeUndefined();
        expect(virtual.every((r) => r.series_anchor_publish_date === "2030-06-08T09:30:00.000Z")).toBe(true);
    });

    it("expands daily recurring rows across a month-long window", () => {
        const row = recurringRow({
            publish_date: "2030-06-01T10:00:00.000Z",
            interval_in_days: 1,
        });
        const out = expandRecurringPostsForCalendarRange(
            [row],
            "2030-06-01T00:00:00.000Z",
            "2030-06-30T23:59:59.999Z"
        );

        expect(out).toHaveLength(30);
        expect(out[0].publish_date).toBe("2030-06-01T10:00:00.000Z");
        expect(out[29].publish_date).toBe("2030-06-30T10:00:00.000Z");
        expect(out.every((r) => r.id === "post-1")).toBe(true);
    });

    it("expands QUEUE recurring anchors", () => {
        const row = recurringRow({ state: "QUEUE", publish_date: "2030-06-10T12:00:00.000Z", interval_in_days: 7 });
        const out = expandRecurringPostsForCalendarRange(
            [row],
            "2030-06-10T00:00:00.000Z",
            "2030-06-24T23:59:59.999Z"
        );
        expect(out.map((r) => r.publish_date)).toEqual([
            "2030-06-10T12:00:00.000Z",
            "2030-06-17T12:00:00.000Z",
            "2030-06-24T12:00:00.000Z",
        ]);
    });

    it("does not expand when interval_in_days is zero", () => {
        const row = recurringRow({ interval_in_days: 0 });
        const out = expandRecurringPostsForCalendarRange(
            [row],
            "2030-06-01T00:00:00.000Z",
            "2030-06-30T23:59:59.999Z"
        );
        expect(out).toEqual([row]);
    });

    it("sorts expanded rows by publish_date ascending", () => {
        const early = recurringRow({
            id: "post-a",
            publish_date: "2030-06-01T08:00:00.000Z",
            interval_in_days: 7,
        });
        const late = recurringRow({
            id: "post-b",
            publish_date: "2030-06-03T14:00:00.000Z",
            interval_in_days: 7,
        });
        const out = expandRecurringPostsForCalendarRange(
            [late, early],
            "2030-06-01T00:00:00.000Z",
            "2030-06-15T23:59:59.999Z"
        );
        const dates = out.map((r) => r.publish_date);
        expect(dates).toEqual([...dates].sort((a, b) => a.localeCompare(b)));
    });

    it("passes through non-recurring rows alongside expanded recurring rows", () => {
        const recurring = recurringRow({
            id: "recurring",
            publish_date: "2030-06-01T12:00:00.000Z",
            interval_in_days: 7,
        });
        const oneOff = recurringRow({
            id: "one-off",
            publish_date: "2030-06-05T09:00:00.000Z",
            interval_in_days: null,
        });
        const out = expandRecurringPostsForCalendarRange(
            [recurring, oneOff],
            "2030-06-01T00:00:00.000Z",
            "2030-06-15T23:59:59.999Z"
        );
        expect(out.some((r) => r.id === "one-off" && r.publish_date === "2030-06-05T09:00:00.000Z")).toBe(true);
        expect(out.filter((r) => r.id === "recurring").length).toBeGreaterThan(1);
    });
});
