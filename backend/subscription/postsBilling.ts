import dayjs from "dayjs";
import type { OrganizationSubscriptionRow } from "../repositories/SubscriptionRepository";

export function computePostsBillingMonthStart(params: {
    /** Subscription row for the billing account (may be null). */
    subscription: OrganizationSubscriptionRow | null;
    /** Workspace created_at ISO fallback when no subscription exists. */
    organizationCreatedAt: string;
    /** Current time (injectable for tests). */
    now?: Date;
}): Date {
    const { subscription, organizationCreatedAt, now } = params;
    const clock = now ?? new Date();

    const anchorIso =
        (subscription as { current_period_start?: string | null })?.current_period_start ??
        subscription?.created_at ??
        organizationCreatedAt;
    const anchor = dayjs(anchorIso);
    const current = dayjs(clock);

    if (subscription?.period === "MONTHLY" && (subscription as { current_period_start?: string | null }).current_period_start) {
        return anchor.toDate();
    }

    const monthsPast = Math.max(0, current.diff(anchor, "month"));
    return anchor.add(monthsPast, "month").toDate();
}
