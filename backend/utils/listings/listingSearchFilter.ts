const LISTING_SEARCH_COLUMNS = [
    "title",
    "slug",
    "excerpt",
    "description",
    "description_mcp",
    "description_skills",
] as const;

/** Escape `%`, `_`, and `\` so user input is treated literally in `ilike` patterns. */
export function escapeIlikePattern(term: string): string {
    return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * PostgREST `.or()` filter for case-insensitive substring search across listing text fields.
 * Matches the building-blocks hub client filter (title / excerpt / description contains).
 */
export function buildListingSearchOrFilter(searchTerm: string): string | null {
    const trimmed = searchTerm.trim();
    if (!trimmed) return null;

    const pattern = `%${escapeIlikePattern(trimmed)}%`;
    return LISTING_SEARCH_COLUMNS.map((column) => `${column}.ilike.${pattern}`).join(",");
}
