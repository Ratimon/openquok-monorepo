/**
 * Sentry metrics helpers for the public programmatic API.
 *
 * `Sentry.metrics` is an evolving surface: in `@sentry/node` v8 the canonical
 * counter method is {@link import("@sentry/node").metrics.increment}. The
 * helper wraps the call in a try/catch so the request path stays unaffected if
 * the SDK is uninitialized, the user disabled Sentry, or the method is renamed
 * in a future SDK upgrade.
 *
 * Use the metric name `public_api-request` and a `route` tag so each public
 * endpoint can be sliced in Sentry without sprinkling SDK calls across
 * controllers.
 */

import { Sentry } from "./index";

const METRIC_NAME = "public_api-request" as const;

/** Best-effort counter for a single public API request, tagged by route name. */
export function countPublicApiRequest(route: string): void {
    try {
        const metrics = (Sentry as { metrics?: { increment?: (name: string, value?: number, options?: { tags?: Record<string, string> }) => void } })
            .metrics;
        metrics?.increment?.(METRIC_NAME, 1, { tags: { route } });
    } catch {
        /* best-effort: never fail the request because of a metric */
    }
}
