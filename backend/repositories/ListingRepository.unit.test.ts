import type { SupabaseClient } from "@supabase/supabase-js";
import { ListingRepository } from "./ListingRepository";

type QueryCall = { method: string; args: unknown[] };

function createThenableQueryBuilder(
    resolveValue: { data?: unknown; error?: unknown; count?: number | null },
    calls: QueryCall[]
): Record<string, unknown> {
    const builder: Record<string, unknown> = {};
    const chain =
        (method: string) =>
        (...args: unknown[]) => {
            calls.push({ method, args });
            return builder;
        };

    for (const method of ["select", "match", "eq", "not", "contains", "textSearch", "or", "order", "range", "insert", "update", "delete"]) {
        builder[method] = jest.fn(chain(method));
    }

    builder.single = jest.fn(() => {
        calls.push({ method: "single", args: [] });
        return Promise.resolve(resolveValue);
    });

    Object.assign(builder, {
        then: (
            onFulfilled?: (value: typeof resolveValue) => unknown,
            onRejected?: (reason: unknown) => unknown
        ) => Promise.resolve(resolveValue).then(onFulfilled, onRejected),
    });

    return builder;
}

function createMockSupabase(queryResult: { data?: unknown; error?: unknown; count?: number | null }) {
    const calls: QueryCall[] = [];
    let lastTable = "";
    const queryBuilder = createThenableQueryBuilder(queryResult, calls);

    const from = jest.fn((table: string) => {
        lastTable = table;
        calls.push({ method: "from", args: [table] });
        return queryBuilder;
    });

    const rpc = jest.fn(() => {
        calls.push({ method: "rpc", args: [] });
        return createThenableQueryBuilder(queryResult, calls);
    });

    const supabase = { from, rpc } as unknown as SupabaseClient;

    return { supabase, calls, getLastTable: () => lastTable, queryBuilder };
}

describe("ListingRepository", () => {
    describe("findPublishedListings", () => {
        it("filters by dual publish flags and listing_kind extension", async () => {
            const listing = { id: "listing-1", title: "Test", slug: "test", listing_kind: "extension" };
            const { supabase, calls } = createMockSupabase({ data: [listing], count: 1 });
            const repo = new ListingRepository(supabase);

            const result = await repo.findPublishedListings({ limit: 10 });

            expect(result.data).toEqual([listing]);
            expect(result.count).toBe(1);
            expect(calls).toEqual(
                expect.arrayContaining([
                    { method: "from", args: ["listings"] },
                    {
                        method: "match",
                        args: [
                            {
                                is_user_published: true,
                                is_admin_published: true,
                                listing_kind: "extension",
                            },
                        ],
                    },
                ])
            );
        });

        it("falls back to created_at when sort key is not in allowlist", async () => {
            const { supabase, calls } = createMockSupabase({ data: [], count: 0 });
            const repo = new ListingRepository(supabase);

            await repo.findPublishedListings({
                limit: 5,
                sortByKey: "invalid_sort_key",
                sortByOrder: true,
            });

            expect(calls).toEqual(
                expect.arrayContaining([{ method: "order", args: ["created_at", { ascending: true }] }])
            );
        });

        it("uses allowed sort key from allowlist", async () => {
            const { supabase, calls } = createMockSupabase({ data: [], count: 0 });
            const repo = new ListingRepository(supabase);

            await repo.findPublishedListings({
                limit: 5,
                sortByKey: "likes",
                sortByOrder: false,
            });

            expect(calls).toEqual(
                expect.arrayContaining([{ method: "order", args: ["likes", { ascending: false }] }])
            );
        });

        it("applies substring ilike search across listing text fields", async () => {
            const { supabase, calls } = createMockSupabase({ data: [], count: 0 });
            const repo = new ListingRepository(supabase);

            await repo.findPublishedListings({
                limit: 10,
                searchTerm: "Bloo",
            });

            expect(calls).toEqual(
                expect.arrayContaining([
                    {
                        method: "or",
                        args: [
                            "title.ilike.%Bloo%,slug.ilike.%Bloo%,excerpt.ilike.%Bloo%,description.ilike.%Bloo%,description_mcp.ilike.%Bloo%,description_skills.ilike.%Bloo%",
                        ],
                    },
                ])
            );
        });

        it("filters by extension_type when listing_kind is extension", async () => {
            const { supabase, calls } = createMockSupabase({ data: [], count: 0 });
            const repo = new ListingRepository(supabase);

            await repo.findPublishedListings({
                limit: 10,
                extensionType: "mcp",
                listingKind: "extension",
            });

            expect(calls).toEqual(expect.arrayContaining([{ method: "eq", args: ["extension_type", "mcp"] }]));
        });

        it("filters by listing_tag_slugs contains when tagSlugs provided", async () => {
            const { supabase, calls } = createMockSupabase({ data: [], count: 0 });
            const repo = new ListingRepository(supabase);

            await repo.findPublishedListings({
                limit: 10,
                tagSlugs: ["apple", "macos"],
            });

            expect(calls).toEqual(
                expect.arrayContaining([{ method: "contains", args: ["listing_tag_slugs", ["apple", "macos"]] }])
            );
        });
    });

    describe("findPublishedListingBySlug", () => {
        it("matches dual publish flags and listing kind", async () => {
            const listing = { id: "listing-1", slug: "my-extension", listing_kind: "extension" };
            const { supabase, calls } = createMockSupabase({ data: listing, error: null });
            const repo = new ListingRepository(supabase);

            const result = await repo.findPublishedListingBySlug("my-extension", "extension");

            expect(result.data).toEqual(listing);
            expect(calls).toEqual(
                expect.arrayContaining([
                    {
                        method: "match",
                        args: [
                            {
                                slug: "my-extension",
                                is_user_published: true,
                                is_admin_published: true,
                            },
                        ],
                    },
                    { method: "eq", args: ["listing_kind", "extension"] },
                ])
            );
        });

        it("returns null when listing is not found (PGRST116)", async () => {
            const { supabase } = createMockSupabase({
                data: null,
                error: { code: "PGRST116", message: "not found" },
            });
            const repo = new ListingRepository(supabase);

            const result = await repo.findPublishedListingBySlug("missing-slug");

            expect(result.data).toBeNull();
        });
    });

    describe("findAdminListings", () => {
        it("orders pending approval first when sortByKey is is_admin_published", async () => {
            const { supabase, calls } = createMockSupabase({ data: [], count: 0 });
            const repo = new ListingRepository(supabase);

            await repo.findAdminListings({
                limit: 10,
                sortByKey: "is_admin_published",
            });

            expect(calls).toEqual(
                expect.arrayContaining([
                    { method: "order", args: ["is_admin_published", { ascending: true }] },
                    { method: "order", args: ["is_user_published", { ascending: false }] },
                ])
            );
        });

        it("falls back to created_at for invalid admin sort key", async () => {
            const { supabase, calls } = createMockSupabase({ data: [], count: 0 });
            const repo = new ListingRepository(supabase);

            await repo.findAdminListings({
                limit: 10,
                sortByKey: "not_allowed",
            });

            expect(calls).toEqual(
                expect.arrayContaining([{ method: "order", args: ["created_at", { ascending: false }] }])
            );
        });
    });
});
