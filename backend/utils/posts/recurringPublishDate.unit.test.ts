import { addUtcDays, computeNextRepeatPublishDateIso } from "./recurringPublishDate";

describe("recurringPublishDate", () => {
    describe("addUtcDays", () => {
        it("advances by whole UTC days", () => {
            expect(addUtcDays("2030-06-01T12:00:00.000Z", 7)).toBe("2030-06-08T12:00:00.000Z");
        });
    });

    describe("computeNextRepeatPublishDateIso", () => {
        it("uses anchor publish_date plus interval days", () => {
            expect(computeNextRepeatPublishDateIso("2030-06-01T12:00:00.000Z", 7)).toBe(
                "2030-06-08T12:00:00.000Z"
            );
        });

        it("falls back to now plus interval when anchor is invalid", () => {
            const before = Date.now();
            const next = computeNextRepeatPublishDateIso("not-a-date", 3);
            const after = Date.now();
            const nextMs = new Date(next).getTime();
            expect(nextMs).toBeGreaterThanOrEqual(before + 3 * 24 * 60 * 60 * 1000 - 1000);
            expect(nextMs).toBeLessThanOrEqual(after + 3 * 24 * 60 * 60 * 1000 + 1000);
        });
    });
});
