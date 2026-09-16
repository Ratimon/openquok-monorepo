import type { SupabaseClient } from "@supabase/supabase-js";

import { DatabaseError } from "../errors/InfraError";
import type { SocialPostLike } from "../utils/dtos/PostDTO";
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

    for (const method of ["select", "eq", "is", "in", "limit"]) {
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

    describe("listPostGroupsForIntegration", () => {
        const organizationId = "org-1";
        const integrationId = "int-1";

        it("returns distinct post_group ids for non-deleted rows", async () => {
            const { supabase, calls } = createMockSupabase({
                data: [{ post_group: "g1" }, { post_group: "g1" }, { post_group: "g2" }],
                error: null,
            });
            const repo = new PostsRepository(supabase);

            await expect(repo.listPostGroupsForIntegration(organizationId, integrationId)).resolves.toEqual([
                "g1",
                "g2",
            ]);

            expect(calls).toEqual([
                { method: "from", args: ["posts"] },
                { method: "select", args: ["post_group"] },
                { method: "eq", args: ["organization_id", organizationId] },
                { method: "eq", args: ["integration_id", integrationId] },
                { method: "is", args: ["deleted_at", null] },
            ]);
        });

        it("returns an empty list when no rows exist", async () => {
            const { supabase } = createMockSupabase({ data: [], error: null });
            const repo = new PostsRepository(supabase);

            await expect(repo.listPostGroupsForIntegration(organizationId, integrationId)).resolves.toEqual([]);
        });

        it("throws DatabaseError when the query fails", async () => {
            const { supabase } = createMockSupabase({
                data: null,
                error: { message: "connection refused" },
            });
            const repo = new PostsRepository(supabase);

            await expect(repo.listPostGroupsForIntegration(organizationId, integrationId)).rejects.toBeInstanceOf(
                DatabaseError
            );
        });
    });

    describe("createRepeatGroupFromPostGroup", () => {
        const sourceGroup = "source-group";
        const existingGroup = "repeat-group";
        const sourcePostId = "source-post-1";
        const publishDateIso = "2030-07-01T12:00:00.000Z";

        function minimalSourceRow(): SocialPostLike {
            const now = "2030-06-01T12:00:00.000Z";
            return {
                id: sourcePostId,
                state: "PUBLISHED",
                publish_date: now,
                organization_id: "org-1",
                integration_id: "int-1",
                content: "hello",
                delay: 0,
                post_group: sourceGroup,
                title: null,
                description: null,
                parent_post_id: null,
                release_id: "rel-1",
                release_url: null,
                settings: null,
                image: null,
                interval_in_days: 7,
                error: null,
                deleted_at: null,
                created_by_user_id: null,
                note: null,
                is_agent_edited: false,
                is_reviewed: true,
                created_at: now,
                updated_at: now,
            };
        }

        function minimalRepeatRow(): SocialPostLike {
            const now = "2030-06-01T12:00:00.000Z";
            return {
                id: "repeat-post-1",
                state: "QUEUE",
                publish_date: publishDateIso,
                organization_id: "org-1",
                integration_id: "int-1",
                content: "hello",
                delay: 0,
                post_group: existingGroup,
                title: null,
                description: null,
                parent_post_id: sourcePostId,
                release_id: null,
                release_url: null,
                settings: null,
                image: null,
                interval_in_days: 7,
                error: null,
                deleted_at: null,
                created_by_user_id: null,
                note: null,
                is_agent_edited: false,
                is_reviewed: false,
                created_at: now,
                updated_at: now,
            };
        }

        it("returns an existing repeat group when parent_post_id already has a QUEUE child", async () => {
            const { supabase } = createMockSupabase({ data: [{ post_group: existingGroup }], error: null });
            const repo = new PostsRepository(supabase);
            const sourceRow = minimalSourceRow();
            const repeatRow = minimalRepeatRow();

            jest.spyOn(repo, "listPostsByGroup")
                .mockResolvedValueOnce([sourceRow])
                .mockResolvedValueOnce([repeatRow]);
            const insertSpy = jest.spyOn(repo, "insertPostGroup");

            const result = await repo.createRepeatGroupFromPostGroup({
                postGroup: sourceGroup,
                publishDateIso,
            });

            expect(result).toEqual({ postGroup: existingGroup, posts: [repeatRow] });
            expect(insertSpy).not.toHaveBeenCalled();
            insertSpy.mockRestore();
        });
    });
});
