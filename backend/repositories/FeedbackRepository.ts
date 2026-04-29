import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackSchemaType } from "../data/schemas/feedbackSchemas";
import type { FeedbackLike } from "../utils/dtos/FeedbackDTO";
import { DatabaseError } from "../errors/InfraError";

const TABLE = "feedback";
const COLS = "id, feedback_type, url, description, email, is_handled, created_at";

export class FeedbackRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async insert(feedback: FeedbackSchemaType): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .insert({
                feedback_type: feedback.feedback_type,
                url: feedback.url,
                description: feedback.description,
                email: feedback.email ?? null,
            })
            .select(COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error inserting feedback", {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE },
            });
        }
        return data.id as string;
    }

    async updateIsHandled(feedbackId: string, isHandled: boolean): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .update({ is_handled: isHandled })
            .eq("id", feedbackId)
            .select(COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error updating feedback is_handled", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
        return data.id as string;
    }

    async findAll(): Promise<FeedbackLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select(COLS)
            .order("created_at", { ascending: false });

        if (error) {
            throw new DatabaseError("Error listing feedback", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? []).map((row) => ({
            id: row.id,
            feedback_type: row.feedback_type,
            url: row.url,
            description: row.description,
            email: row.email,
            is_handled: row.is_handled,
            created_at: row.created_at,
        }));
    }
}
