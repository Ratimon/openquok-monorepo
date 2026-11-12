import {
    buildAdminLinkDirectorySitesCacheKey,
    buildPublishedLinkDirectorySitesCacheKey,
    toLinkDirectorySavedSiteDto,
    toLinkDirectorySiteDto,
} from "./LinkDirectoryDTO";
import type {
    AdminLinkDirectorySitesFilterOptions,
    LinkDirectoryOpportunityRow,
    LinkDirectorySavedSiteRow,
    LinkDirectorySiteRow,
    PublishedLinkDirectorySitesFilterOptions,
} from "../../data/types/linkDirectoryTypes";

const PUBLISHED_PREFIX = "linkDirectory:published:list";
const ADMIN_PREFIX = "linkDirectory:admin:sites:list";

describe("buildPublishedLinkDirectorySitesCacheKey", () => {
    it("serializes defaults matching LinkDirectoryService normalization", () => {
        const options: PublishedLinkDirectorySitesFilterOptions = {
            limit: 20,
            skip: 0,
            searchTerm: null,
            tagSlugs: null,
            categorySlug: null,
            costTiers: null,
            dofollow: null,
            effort: null,
            approvalMode: null,
            opportunityTypeSlugs: null,
            sortByKey: null,
            sortByOrder: null,
            range: null,
        };
        expect(buildPublishedLinkDirectorySitesCacheKey(options, PUBLISHED_PREFIX)).toBe(
            [
                PUBLISHED_PREFIX,
                "limit:20",
                "skip:0",
                "search:none",
                "tags:none",
                "category:none",
                "costTiers:none",
                "dofollow:none",
                "effort:none",
                "approval:none",
                "oppTypes:none",
                "sort:none",
                "order:desc",
                "range:none",
            ].join(":")
        );
    });

    it("sorts multi-value filters so key order is stable", () => {
        const base: PublishedLinkDirectorySitesFilterOptions = {
            limit: 10,
            skip: 5,
            searchTerm: "outreach",
            categorySlug: "directories",
            sortByKey: "views",
            sortByOrder: true,
            range: { start: 0, end: 9 },
        };
        const keyA = buildPublishedLinkDirectorySitesCacheKey(
            {
                ...base,
                tagSlugs: ["beta", "alpha"],
                costTiers: ["paid", "free"],
                dofollow: ["nofollow", "dofollow"],
                effort: ["hard", "easy"],
                approvalMode: ["manual_review", "instant"],
                opportunityTypeSlugs: ["guest-post", "comment"],
            },
            PUBLISHED_PREFIX
        );
        const keyB = buildPublishedLinkDirectorySitesCacheKey(
            {
                ...base,
                tagSlugs: ["alpha", "beta"],
                costTiers: ["free", "paid"],
                dofollow: ["dofollow", "nofollow"],
                effort: ["easy", "hard"],
                approvalMode: ["instant", "manual_review"],
                opportunityTypeSlugs: ["comment", "guest-post"],
            },
            PUBLISHED_PREFIX
        );
        expect(keyA).toBe(keyB);
        expect(keyA).toContain("tags:alpha,beta");
        expect(keyA).toContain("costTiers:free,paid");
        expect(keyA).toContain("range:start:0:end:9");
        expect(keyA).toContain("order:asc");
    });
});

describe("buildAdminLinkDirectorySitesCacheKey", () => {
    it("serializes defaults matching LinkDirectoryService normalization", () => {
        const options: AdminLinkDirectorySitesFilterOptions = {
            limit: 50,
            searchTerm: null,
            sortByKey: "created_at",
            sortByOrder: false,
            range: null,
        };
        expect(buildAdminLinkDirectorySitesCacheKey(options, ADMIN_PREFIX)).toBe(
            [
                ADMIN_PREFIX,
                "limit:50",
                "search:none",
                "sort:created_at",
                "order:desc",
                "range:none",
            ].join(":")
        );
    });

    it("includes search, sort, and range segments", () => {
        expect(
            buildAdminLinkDirectorySitesCacheKey(
                {
                    limit: 25,
                    searchTerm: "exemplar",
                    sortByKey: "title",
                    sortByOrder: true,
                    range: { start: 10, end: 34 },
                },
                ADMIN_PREFIX
            )
        ).toBe(
            [
                ADMIN_PREFIX,
                "limit:25",
                "search:exemplar",
                "sort:title",
                "order:asc",
                "range:start:10:end:34",
            ].join(":")
        );
    });
});

describe("LinkDirectoryDTO opportunity mapping", () => {
    it("maps auto_launch columns on opportunities", () => {
        const row = {
            id: "o1",
            site_id: "s1",
            slug: "free-launch",
            title: "Free launch",
            opportunity_type_id: "t1",
            effort: "hard",
            approval_mode: "manual_review",
            approval_time_hint: null,
            dofollow: "unknown",
            cost_tier: "free",
            cost_note: null,
            description: null,
            steps: [],
            openquok_cta_kind: "external_doc",
            openquok_channel_slug: null,
            openquok_plug_name: null,
            cta_href: "https://open-launch.com/pricing",
            cta_label: "Open Launch pricing",
            sort_order: 10,
            is_admin_published: true,
            published_at: "2026-01-01T00:00:00.000Z",
            auto_launch_enabled: true,
            auto_launch_provider_slug: "open-launch-free-launch",
        } as LinkDirectoryOpportunityRow;

        const siteRow = {
            id: "s1",
            slug: "open-launch",
            title: "Open Launch",
            site_url: "https://open-launch.com",
            logo_url: null,
            short_description: null,
            long_description: null,
            domain_authority: null,
            domain_rating: null,
            monthly_visits: null,
            metrics_source: null,
            metrics_updated_at: null,
            category_id: null,
            is_openquok_auth_supported: false,
            openquok_channel_slug: null,
            is_admin_published: true,
            sort_order: 0,
            tag_slugs: [],
            published_at: null,
            likes: 0,
            views: 0,
            bookmark_count: 0,
            average_rating: null,
            ratings_count: 0,
            opportunities: [row],
        } as LinkDirectorySiteRow;

        expect(toLinkDirectorySiteDto(siteRow).opportunities[0]).toMatchObject({
            autoLaunchEnabled: true,
            autoLaunchProviderSlug: "open-launch-free-launch",
        });
    });
});

describe("LinkDirectoryDTO saved site mapping", () => {
    it("maps saved site rows to DTOs", () => {
        const row: LinkDirectorySavedSiteRow = {
            id: "b1",
            user_id: "u1",
            site_id: "s1",
            sort_order: 0,
            created_at: "2026-01-01T00:00:00.000Z",
            site: null,
        };

        expect(toLinkDirectorySavedSiteDto(row)).toEqual({
            id: "b1",
            siteId: "s1",
            sortOrder: 0,
            createdAt: "2026-01-01T00:00:00.000Z",
            site: null,
        });
    });
});
