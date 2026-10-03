import { toLinkDirectorySavedSiteDto } from "./LinkDirectoryDTO";
import type { LinkDirectorySavedSiteRow } from "../../data/types/linkDirectoryTypes";

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
