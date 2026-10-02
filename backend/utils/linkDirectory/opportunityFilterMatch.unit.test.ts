import {
    hasOpportunityLevelFilters,
    opportunityMatchesFilters,
    siteHasMatchingOpportunity,
} from "./opportunityFilterMatch";
import type { LinkDirectoryOpportunityRow } from "../../data/types/linkDirectoryTypes";

const baseOpportunity = (overrides: Partial<LinkDirectoryOpportunityRow> = {}): LinkDirectoryOpportunityRow => ({
    id: "opp-1",
    site_id: "site-1",
    slug: "post",
    title: "Post link",
    opportunity_type_id: "type-1",
    effort: "easy",
    approval_mode: "instant",
    approval_time_hint: null,
    dofollow: "dofollow",
    cost_tier: "free",
    cost_note: null,
    description: null,
    steps: [],
    openquok_cta_kind: "none",
    openquok_channel_slug: null,
    openquok_plug_name: null,
    cta_href: null,
    cta_label: null,
    sort_order: 0,
    is_admin_published: true,
    published_at: null,
    ...overrides,
});

describe("opportunityFilterMatch", () => {
    it("treats empty filters as matching any published opportunity", () => {
        expect(hasOpportunityLevelFilters({})).toBe(false);
        expect(
            siteHasMatchingOpportunity([baseOpportunity({ is_admin_published: false })], {}, true)
        ).toBe(true);
    });

    it("matches when any opportunity satisfies cost tier filter", () => {
        const opportunities = [
            baseOpportunity({ cost_tier: "paid" }),
            baseOpportunity({ id: "opp-2", cost_tier: "free" }),
        ];
        expect(
            siteHasMatchingOpportunity(opportunities, { costTiers: ["free"] }, true)
        ).toBe(true);
        expect(
            siteHasMatchingOpportunity(opportunities, { costTiers: ["freemium"] }, true)
        ).toBe(false);
    });

    it("ignores unpublished opportunities when publishedOnly is true", () => {
        expect(
            opportunityMatchesFilters(
                baseOpportunity({ is_admin_published: false, cost_tier: "free" }),
                { costTiers: ["free"] },
                true
            )
        ).toBe(false);
    });

    it("matches when any opportunity satisfies opportunity type slug filter", () => {
        const opportunities = [
            baseOpportunity({
                id: "opp-1",
                opportunity_type: { id: "type-1", slug: "post_link", label: "Post link", description: null, sort_order: 10 },
            }),
            baseOpportunity({
                id: "opp-2",
                opportunity_type: {
                    id: "type-2",
                    slug: "profile_link",
                    label: "Profile link",
                    description: null,
                    sort_order: 20,
                },
            }),
        ];
        expect(
            siteHasMatchingOpportunity(opportunities, { opportunityTypeSlugs: ["profile_link"] }, true)
        ).toBe(true);
        expect(
            siteHasMatchingOpportunity(opportunities, { opportunityTypeSlugs: ["guest_post"] }, true)
        ).toBe(false);
        expect(hasOpportunityLevelFilters({ opportunityTypeSlugs: ["profile_link"] })).toBe(true);
    });
});
