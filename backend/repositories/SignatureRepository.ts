import type { SupabaseClient } from "@supabase/supabase-js";
import type { SignatureLike } from "../utils/dtos/SignatureDTO";
import { DatabaseError } from "../errors/InfraError";

const TABLE = "signatures";
const COLS = "id, organization_id, title, content, is_default, created_at, updated_at";

export class SignatureRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async listByOrganization(organizationId: string): Promise<SignatureLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select(COLS)
            .eq("organization_id", organizationId)
            .order("updated_at", { ascending: false });

        if (error) {
            throw new DatabaseError("Error listing signatures", {
                cause: error as unknown as Error,
                operation: "listByOrganization",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? []) as unknown as SignatureLike[];
    }

    async findById(signatureId: string): Promise<SignatureLike | null> {
        const { data, error } = await this.supabase.from(TABLE).select(COLS).eq("id", signatureId).maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding signature", {
                cause: error as unknown as Error,
                operation: "findById",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? null) as unknown as SignatureLike | null;
    }

    async clearDefaultForOrganization(organizationId: string): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE)
            .update({ is_default: false, updated_at: new Date().toISOString() })
            .eq("organization_id", organizationId)
            .eq("is_default", true);

        if (error) {
            throw new DatabaseError("Error clearing default signature", {
                cause: error as unknown as Error,
                operation: "clearDefaultForOrganization",
                resource: { type: "table", name: TABLE },
            });
        }
    }

    async insert(params: {
        organizationId: string;
        title: string;
        content: string;
        isDefault: boolean;
    }): Promise<SignatureLike> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE)
            .insert({
                organization_id: params.organizationId,
                title: params.title,
                content: params.content,
                is_default: params.isDefault,
                created_at: now,
                updated_at: now,
            })
            .select(COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error inserting signature", {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE },
            });
        }
        return data as unknown as SignatureLike;
    }

    async update(params: {
        signatureId: string;
        organizationId: string;
        title?: string;
        content?: string;
        isDefault?: boolean;
    }): Promise<SignatureLike | null> {
        const payload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };
        if (params.title !== undefined) payload.title = params.title;
        if (params.content !== undefined) payload.content = params.content;
        if (params.isDefault !== undefined) payload.is_default = params.isDefault;

        const { data, error } = await this.supabase
            .from(TABLE)
            .update(payload)
            .eq("id", params.signatureId)
            .eq("organization_id", params.organizationId)
            .select(COLS)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error updating signature", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? null) as unknown as SignatureLike | null;
    }

    async delete(signatureId: string, organizationId: string): Promise<boolean> {
        const { error, count } = await this.supabase
            .from(TABLE)
            .delete({ count: "exact" })
            .eq("id", signatureId)
            .eq("organization_id", organizationId);

        if (error) {
            throw new DatabaseError("Error deleting signature", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE },
            });
        }
        return (count ?? 0) > 0;
    }
}
