import {
    FACEBOOK_PAGE_ANALYTICS_METRICS,
    FACEBOOK_POST_ANALYTICS_METRICS,
    mapFacebookPageInsightsResponse,
    mapFacebookPostInsightsResponse,
} from "./facebookInsightsAnalytics.js";

describe("facebookInsightsAnalytics", () => {
    it("requests current Page metrics (no deprecated impression fields)", () => {
        expect(FACEBOOK_PAGE_ANALYTICS_METRICS).not.toContain("page_impressions_unique");
        expect(FACEBOOK_PAGE_ANALYTICS_METRICS).not.toContain("page_posts_impressions_unique");
        expect(FACEBOOK_PAGE_ANALYTICS_METRICS).toContain("page_total_media_view_unique");
    });

    it("requests current post metrics (no deprecated impression fields)", () => {
        expect(FACEBOOK_POST_ANALYTICS_METRICS).not.toContain("post_impressions_unique");
        expect(FACEBOOK_POST_ANALYTICS_METRICS).toContain("post_total_media_view_unique");
    });

    it("maps page insights rows to analytics series", () => {
        expect(
            mapFacebookPageInsightsResponse({
                data: [
                    {
                        name: "page_total_media_view_unique",
                        values: [{ value: 120, end_time: "2026-09-05T07:00:00+0000" }],
                    },
                    {
                        name: "page_post_engagements",
                        values: [{ value: 8, end_time: "2026-09-05T07:00:00+0000" }],
                    },
                ],
            })
        ).toEqual([
            {
                label: "Page views",
                percentageChange: 0,
                data: [{ total: "120", date: "2026-09-05" }],
            },
            {
                label: "Posts Engagement",
                percentageChange: 0,
                data: [{ total: "8", date: "2026-09-05" }],
            },
        ]);
    });

    it("throws when Graph returns an error payload", () => {
        expect(() =>
            mapFacebookPageInsightsResponse({ error: { message: "Invalid metric" } })
        ).toThrow("Invalid metric");
    });

    it("maps post insights totals", () => {
        expect(
            mapFacebookPostInsightsResponse(
                {
                    data: [
                        { name: "post_total_media_view_unique", values: [{ value: 42 }] },
                        {
                            name: "post_reactions_by_type_total",
                            values: [{ value: { like: 3, love: 1 } }],
                        },
                    ],
                },
                "2026-09-06"
            )
        ).toEqual([
            { label: "Views", percentageChange: 0, data: [{ total: "42", date: "2026-09-06" }] },
            { label: "Reactions", percentageChange: 0, data: [{ total: "4", date: "2026-09-06" }] },
        ]);
    });

    it("dedupes duplicate Graph rows for the same metric or label", () => {
        expect(
            mapFacebookPostInsightsResponse(
                {
                    data: [
                        { name: "post_total_media_view_unique", values: [{ value: 10 }] },
                        { name: "post_total_media_view_unique", values: [{ value: 99 }] },
                    ],
                },
                "2026-09-06"
            )
        ).toEqual([
            { label: "Views", percentageChange: 0, data: [{ total: "10", date: "2026-09-06" }] },
        ]);
    });
});
