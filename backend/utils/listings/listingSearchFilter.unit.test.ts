import { buildListingSearchOrFilter, escapeIlikePattern } from "./listingSearchFilter";

describe("listingSearchFilter", () => {
    describe("escapeIlikePattern", () => {
        it("escapes LIKE wildcards and backslashes", () => {
            expect(escapeIlikePattern("100%_off\\")).toBe("100\\%\\_off\\\\");
        });
    });

    describe("buildListingSearchOrFilter", () => {
        it("returns null for blank input", () => {
            expect(buildListingSearchOrFilter("")).toBeNull();
            expect(buildListingSearchOrFilter("   ")).toBeNull();
        });

        it("builds ilike or-filter across listing text columns", () => {
            expect(buildListingSearchOrFilter("Bloo")).toBe(
                "title.ilike.%Bloo%,slug.ilike.%Bloo%,excerpt.ilike.%Bloo%,description.ilike.%Bloo%,description_mcp.ilike.%Bloo%,description_skills.ilike.%Bloo%"
            );
        });

        it("preserves multi-word phrases for contiguous substring match", () => {
            expect(buildListingSearchOrFilter("bloom mcp")).toContain("title.ilike.%bloom mcp%");
        });
    });
});
