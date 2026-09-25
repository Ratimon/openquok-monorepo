import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../errors/InfraError";

const TABLE = "cloud_trial_browser_consumptions";

export class TrialBrowserRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async hasBrowserConsumedTrial(browserSignalId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select("browser_signal_id")
            .eq("browser_signal_id", browserSignalId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to lookup cloud trial browser consumption", {
                cause: error as unknown as Error,
                operation: "hasBrowserConsumedTrial",
                resource: { type: "table", name: TABLE },
            });
        }
        return Boolean(data);
    }

    async recordBrowserTrialConsumption(browserSignalId: string, userId: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE).upsert(
            {
                browser_signal_id: browserSignalId,
                user_id: userId,
                consumed_at: new Date().toISOString(),
            },
            { onConflict: "browser_signal_id", ignoreDuplicates: true }
        );

        if (error) {
            throw new DatabaseError("Failed to record cloud trial browser consumption", {
                cause: error as unknown as Error,
                operation: "recordBrowserTrialConsumption",
                resource: { type: "table", name: TABLE },
            });
        }
    }
}
