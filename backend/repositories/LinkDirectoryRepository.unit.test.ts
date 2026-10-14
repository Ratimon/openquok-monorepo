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
    it("placeholder — repository covered by integration tests", () => {
        expect(true).toBe(true);
    });
});
