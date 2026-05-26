import { computePostsBillingMonthStart } from "./PermissionsService";

describe("computePostsBillingMonthStart", () => {
    it("uses current_period_start for MONTHLY subscriptions", () => {
        const start = new Date("2026-05-01T12:34:56.000Z");
        const got = computePostsBillingMonthStart({
            subscription: {
                id: "sub",
                organization_id: "org",
                subscription_tier: "SOLO",
                period: "MONTHLY",
                identifier: null,
                cancel_at: null,
                channels_per_workspace: 15,
                is_lifetime: false,
                current_period_start: start.toISOString(),
                current_period_end: new Date("2026-06-01T12:34:56.000Z").toISOString(),
                created_at: new Date("2026-01-01T00:00:00.000Z").toISOString(),
                updated_at: new Date("2026-01-01T00:00:00.000Z").toISOString(),
                deleted_at: null,
            },
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-05-26T00:00:00.000Z"),
        });
        expect(got.toISOString()).toBe(start.toISOString());
    });

    it("anchors YEARLY monthly windows to current_period_start (rolling months)", () => {
        const anchor = new Date("2026-01-10T08:00:00.000Z");
        const got = computePostsBillingMonthStart({
            subscription: {
                id: "sub",
                organization_id: "org",
                subscription_tier: "SOLO",
                period: "YEARLY",
                identifier: null,
                cancel_at: null,
                channels_per_workspace: 15,
                is_lifetime: false,
                current_period_start: anchor.toISOString(),
                current_period_end: new Date("2027-01-10T08:00:00.000Z").toISOString(),
                created_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
                updated_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
                deleted_at: null,
            },
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-03-09T00:00:00.000Z"),
        });
        // Jan-10 anchor → Feb-10 (1 month) → Mar-10 (2 months); on Mar-09 we're still in the Feb-10 window.
        expect(got.toISOString()).toBe(new Date("2026-02-10T08:00:00.000Z").toISOString());
    });

    it("advances YEARLY monthly window after crossing a month boundary", () => {
        const anchor = new Date("2026-01-10T08:00:00.000Z");
        const baseSubscription = {
            id: "sub",
            organization_id: "org",
            subscription_tier: "SOLO" as const,
            period: "YEARLY" as const,
            identifier: null,
            cancel_at: null,
            channels_per_workspace: 15,
            is_lifetime: false,
            current_period_start: anchor.toISOString(),
            current_period_end: new Date("2027-01-10T08:00:00.000Z").toISOString(),
            created_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
            updated_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
            deleted_at: null,
        };

        const before = computePostsBillingMonthStart({
            subscription: baseSubscription,
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-02-10T07:59:59.000Z"),
        });
        expect(before.toISOString()).toBe(anchor.toISOString());

        const after = computePostsBillingMonthStart({
            subscription: baseSubscription,
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-02-10T08:00:00.000Z"),
        });
        expect(after.toISOString()).toBe(new Date("2026-02-10T08:00:00.000Z").toISOString());
    });
});

