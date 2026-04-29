import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationLike } from "../utils/dtos/NotificationDTO";
import { DatabaseError } from "../errors/InfraError";

const TABLE = "notifications";

const NOTIFICATION_LIST_SELECT = "id, content, link, created_at";

export class NotificationRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async createNotification(organizationId: string, content: string, link?: string | null): Promise<void> {
        const { error } = await this.supabase.from(TABLE).insert({
            organization_id: organizationId,
            content,
            link: link ?? null,
            updated_at: new Date().toISOString(),
        });
        if (error) {
            throw new DatabaseError("Failed to create notification", {
                cause: error as unknown as Error,
                operation: "createNotification",
                resource: { type: "table", name: TABLE },
            });
        }
    }

    async countSince(organizationId: string, sinceIso: string): Promise<number> {
        const { count, error } = await this.supabase
            .from(TABLE)
            .select("id", { count: "exact", head: true })
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .gt("created_at", sinceIso);

        if (error) {
            throw new DatabaseError("Failed to count notifications", {
                cause: error as unknown as Error,
                operation: "countSince",
                resource: { type: "table", name: TABLE },
            });
        }
        return count ?? 0;
    }

    async listRecentForOrg(organizationId: string, limit: number): Promise<Pick<NotificationLike, "created_at" | "content">[]> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select("created_at, content")
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            throw new DatabaseError("Failed to list notifications", {
                cause: error as unknown as Error,
                operation: "listRecentForOrg",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? []) as Pick<NotificationLike, "created_at" | "content">[];
    }

    async listPaginated(
        organizationId: string,
        page: number,
        pageSize: number
    ): Promise<{
        notifications: Array<Pick<NotificationLike, "id" | "content" | "link" | "created_at">>;
        total: number;
        hasMore: boolean;
    }> {
        const skip = page * pageSize;
        const { data: rows, error: listError, count } = await this.supabase
            .from(TABLE)
            .select(NOTIFICATION_LIST_SELECT, { count: "exact" })
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .range(skip, skip + pageSize - 1);

        if (listError) {
            throw new DatabaseError("Failed to list notifications", {
                cause: listError as unknown as Error,
                operation: "listPaginated",
                resource: { type: "table", name: TABLE },
            });
        }

        const total = count ?? 0;
        const notifications = (rows ?? []) as Array<Pick<NotificationLike, "id" | "content" | "link" | "created_at">>;
        return {
            notifications,
            total,
            hasMore: skip + notifications.length < total,
        };
    }
}
