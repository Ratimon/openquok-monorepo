import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "../errors/AppError";
import { DatabaseError } from "../errors/InfraError";

const TABLE = "user_acquisition_responses";
const COLS =
    "id, user_id, source, other_detail, utm, landing_url, referrer, organization_id, subscription_id, skipped, created_at";

export interface AcquisitionSurveyRow {
    id: string;
    user_id: string;
    source: string;
    other_detail: string | null;
    utm: string | null;
    landing_url: string | null;
    referrer: string | null;
    organization_id: string | null;
    subscription_id: string | null;
    skipped: boolean;
    created_at: string;
}

export interface InsertAcquisitionSurveyParams {
    userId: string;
    source: string;
    otherDetail?: string | null;
    utm?: string | null;
    landingUrl?: string | null;
    referrer?: string | null;
    organizationId?: string | null;
    subscriptionId?: string | null;
    skipped: boolean;
}

export class AcquisitionSurveyRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findByUserId(userId: string): Promise<AcquisitionSurveyRow | null> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select(COLS)
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to load acquisition survey response", {
                cause: error as unknown as Error,
                operation: "findByUserId",
                resource: { type: "table", name: TABLE },
            });
        }

        return (data as AcquisitionSurveyRow | null) ?? null;
    }

    async insert(params: InsertAcquisitionSurveyParams): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .insert({
                user_id: params.userId,
                source: params.source,
                other_detail: params.otherDetail ?? null,
                utm: params.utm ?? null,
                landing_url: params.landingUrl ?? null,
                referrer: params.referrer ?? null,
                organization_id: params.organizationId ?? null,
                subscription_id: params.subscriptionId ?? null,
                skipped: params.skipped,
            })
            .select("id")
            .single();

        if (error) {
            if (error.code === "23505") {
                throw new AppError("Acquisition survey already submitted", 409);
            }
            throw new DatabaseError("Failed to insert acquisition survey response", {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE },
            });
        }

        if (!data?.id) {
            throw new DatabaseError("Failed to insert acquisition survey response", {
                operation: "insert",
                resource: { type: "table", name: TABLE },
            });
        }

        return data.id as string;
    }
}
