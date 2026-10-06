import {
    buildAdminLinkDirectorySitesCacheKey,
    buildPublishedLinkDirectorySitesCacheKey,
    toLinkDirectorySavedSiteDto,
} from "./LinkDirectoryDTO";
import type {
    AdminLinkDirectorySitesFilterOptions,
    LinkDirectorySavedSiteRow,
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

describe("LinkDirectoryDTO saved site mapping", () => {
    it("maps outreach_completed_at to outreachCompletedAt", () => {
        const row: LinkDirectorySavedSiteRow = {
            id: "b1",
            user_id: "u1",
            site_id: "s1",
            sort_order: 0,
            created_at: "2026-01-01T00:00:00.000Z",
            outreach_completed_at: "2026-02-01T12:00:00.000Z",
            site: null,
        };

        expect(toLinkDirectorySavedSiteDto(row)).toEqual({
            id: "b1",
            siteId: "s1",
            sortOrder: 0,
            createdAt: "2026-01-01T00:00:00.000Z",
            outreachCompletedAt: "2026-02-01T12:00:00.000Z",
            site: null,
        });
    });

    it("defaults missing outreach_completed_at to null", () => {
        const row: LinkDirectorySavedSiteRow = {
            id: "b2",
            user_id: "u1",
            site_id: "s2",
            sort_order: 1,
            created_at: "2026-01-01T00:00:00.000Z",
            outreach_completed_at: null,
            site: null,
        };

        expect(toLinkDirectorySavedSiteDto(row).outreachCompletedAt).toBeNull();
    });
});
