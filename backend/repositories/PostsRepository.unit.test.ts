import type { SupabaseClient } from "@supabase/supabase-js";

import { DatabaseError } from "../errors/InfraError";
import { PostsRepository } from "./PostsRepository";

type QueryCall = { method: string; args: unknown[] };

function createThenableQueryBuilder(
    resolveValue: { data?: unknown; error?: unknown },
    calls: QueryCall[]
): Record<string, unknown> {
    const builder: Record<string, unknown> = {};
    const chain =
        (method: string) =>
        (...args: unknown[]) => {
            calls.push({ method, args });
            return builder;
        };

    for (const method of ["select", "eq", "is", "limit"]) {
        builder[method] = jest.fn(chain(method));
    }

    builder.maybeSingle = jest.fn(() => {
        calls.push({ method: "maybeSingle", args: [] });
        return Promise.resolve(resolveValue);
    });

    return builder;
}

function createMockSupabase(queryResult: { data?: unknown; error?: unknown }) {
    const calls: QueryCall[] = [];
    const queryBuilder = createThenableQueryBuilder(queryResult, calls);

    const from = jest.fn((table: string) => {
        calls.push({ method: "from", args: [table] });
        return queryBuilder;
    });

    const supabase = { from } as unknown as SupabaseClient;

    return { supabase, calls, queryBuilder };
}

describe("PostsRepository", () => {
    describe("hasPostsForIntegration", () => {
        const organizationId = "org-1";
        const integrationId = "int-1";

        it("returns true when a non-deleted post row exists", async () => {
            const { supabase, calls } = createMockSupabase({ data: { id: "post-1" }, error: null });
            const repo = new PostsRepository(supabase);

            await expect(repo.hasPostsForIntegration(organizationId, integrationId)).resolves.toBe(true);

            expect(calls).toEqual([
                { method: "from", args: ["posts"] },
                { method: "select", args: ["id"] },
                { method: "eq", args: ["organization_id", organizationId] },
                { method: "eq", args: ["integration_id", integrationId] },
                { method: "is", args: ["deleted_at", null] },
                { method: "limit", args: [1] },
                { method: "maybeSingle", args: [] },
            ]);
        });

        it("returns false when no post row exists", async () => {
            const { supabase } = createMockSupabase({ data: null, error: null });
            const repo = new PostsRepository(supabase);

            await expect(repo.hasPostsForIntegration(organizationId, integrationId)).resolves.toBe(false);
        });

        it("throws DatabaseError when the query fails", async () => {
            const { supabase } = createMockSupabase({
                data: null,
                error: { message: "connection refused" },
            });
            const repo = new PostsRepository(supabase);

            await expect(repo.hasPostsForIntegration(organizationId, integrationId)).rejects.toBeInstanceOf(
                DatabaseError
            );
        });
    });
});
