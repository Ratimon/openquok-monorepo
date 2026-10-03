import type { SupabaseClient } from "@supabase/supabase-js";

import { DatabaseEntityNotFoundError, DatabaseError } from "../errors/InfraError";
import { LinkDirectoryRepository } from "./LinkDirectoryRepository";

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

    for (const method of ["select", "update", "eq"]) {
        builder[method] = jest.fn(chain(method));
    }

    builder.maybeSingle = jest.fn(() => {
        calls.push({ method: "maybeSingle", args: [] });
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

function createMockSupabase(queryResult: { data?: unknown; error?: unknown }) {
    const calls: QueryCall[] = [];
    const queryBuilder = createThenableQueryBuilder(queryResult, calls);

    const from = jest.fn((table: string) => {
        calls.push({ method: "from", args: [table] });
        return queryBuilder;
    });

    const supabase = { from } as unknown as SupabaseClient;

    return { supabase, calls };
}

describe("LinkDirectoryRepository", () => {
    describe("setUserSavedSiteOutreachCompleted", () => {
        const userId = "user-1";
        const siteId = "site-1";
        const outreachCompletedAt = "2026-03-01T12:00:00.000Z";

        it("updates outreach_completed_at for the matching saved site row", async () => {
            const { supabase, calls } = createMockSupabase({ data: { id: "saved-site-1" }, error: null });
            const repo = new LinkDirectoryRepository(supabase);

            await repo.setUserSavedSiteOutreachCompleted(userId, siteId, outreachCompletedAt);

            expect(calls).toEqual([
                { method: "from", args: ["link_directory_saved_sites"] },
                { method: "update", args: [{ outreach_completed_at: outreachCompletedAt }] },
                { method: "eq", args: ["user_id", userId] },
                { method: "eq", args: ["site_id", siteId] },
                { method: "select", args: ["id"] },
                { method: "maybeSingle", args: [] },
            ]);
        });

        it("throws when no saved site row matches", async () => {
            const { supabase } = createMockSupabase({ data: null, error: null });
            const repo = new LinkDirectoryRepository(supabase);

            await expect(
                repo.setUserSavedSiteOutreachCompleted(userId, siteId, null)
            ).rejects.toBeInstanceOf(DatabaseEntityNotFoundError);
        });

        it("throws DatabaseError when Supabase returns an error", async () => {
            const { supabase } = createMockSupabase({
                data: null,
                error: { message: "update failed" },
            });
            const repo = new LinkDirectoryRepository(supabase);

            await expect(
                repo.setUserSavedSiteOutreachCompleted(userId, siteId, outreachCompletedAt)
            ).rejects.toBeInstanceOf(DatabaseError);
        });
    });
});
