import type { SupabaseClient } from "@supabase/supabase-js";
import type { SetLike } from "../utils/dtos/SetDTO";
import { DatabaseError } from "../errors/InfraError";

const TABLE = "sets";
const COLS = "id, organization_id, name, content, created_at, updated_at";

export class SetsRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async listByOrganization(organizationId: string): Promise<SetLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select(COLS)
            .eq("organization_id", organizationId)
            .order("updated_at", { ascending: false });

        if (error) {
            throw new DatabaseError("Error listing sets", {
                cause: error as unknown as Error,
                operation: "listByOrganization",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? []) as unknown as SetLike[];
    }

    async findById(setId: string): Promise<SetLike | null> {
        const { data, error } = await this.supabase.from(TABLE).select(COLS).eq("id", setId).maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding set", {
                cause: error as unknown as Error,
                operation: "findById",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? null) as unknown as SetLike | null;
    }

    async insert(params: { organizationId: string; name: string; content: string }): Promise<SetLike> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE)
            .insert({
                organization_id: params.organizationId,
                name: params.name,
                content: params.content,
                created_at: now,
                updated_at: now,
            })
            .select(COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error inserting set", {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE },
            });
        }
        return data as unknown as SetLike;
    }

    async update(params: {
        setId: string;
        organizationId: string;
        name: string;
        content: string;
    }): Promise<SetLike | null> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE)
            .update({
                name: params.name,
                content: params.content,
                updated_at: now,
            })
            .eq("id", params.setId)
            .eq("organization_id", params.organizationId)
            .select(COLS)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error updating set", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? null) as unknown as SetLike | null;
    }

    async delete(setId: string, organizationId: string): Promise<boolean> {
        const { error, count } = await this.supabase
            .from(TABLE)
            .delete({ count: "exact" })
            .eq("id", setId)
            .eq("organization_id", organizationId);

        if (error) {
            throw new DatabaseError("Error deleting set", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE },
            });
        }
        return (count ?? 0) > 0;
    }
}
