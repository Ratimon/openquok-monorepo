import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntegrationPlugRowDto } from "../utils/dtos/PlugDTO";
import { DatabaseError } from "../errors/InfraError";

const PLUGS_TABLE = "plugs";

/** Persistence for `public.plugs` (global / channel-scoped plug rules). */
export class PlugRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async listPlugsByIntegration(organizationId: string, integrationId: string): Promise<IntegrationPlugRowDto[]> {
        const { data, error } = await this.supabase
            .from(PLUGS_TABLE)
            .select("id, organization_id, integration_id, plug_function, data, activated")
            .eq("organization_id", organizationId)
            .eq("integration_id", integrationId)
            .order("created_at", { ascending: true });

        if (error) {
            throw new DatabaseError("Failed to list integration plugs", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: PLUGS_TABLE },
            });
        }
        return (data ?? []) as IntegrationPlugRowDto[];
    }

    async listActivatedPlugsByIntegration(organizationId: string, integrationId: string): Promise<IntegrationPlugRowDto[]> {
        const { data, error } = await this.supabase
            .from(PLUGS_TABLE)
            .select("id, organization_id, integration_id, plug_function, data, activated")
            .eq("organization_id", organizationId)
            .eq("integration_id", integrationId)
            .eq("activated", true);

        if (error) {
            throw new DatabaseError("Failed to list active integration plugs", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: PLUGS_TABLE },
            });
        }
        return (data ?? []) as IntegrationPlugRowDto[];
    }

    async getPlugRowById(plugId: string): Promise<IntegrationPlugRowDto | null> {
        const { data, error } = await this.supabase
            .from(PLUGS_TABLE)
            .select("id, organization_id, integration_id, plug_function, data, activated")
            .eq("id", plugId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to load integration plug", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: PLUGS_TABLE },
            });
        }
        return (data as IntegrationPlugRowDto | null) ?? null;
    }

    async insertPlug(params: {
        organizationId: string;
        integrationId: string;
        plugFunction: string;
        dataJson: string;
    }): Promise<{ id: string; activated: boolean }> {
        const row = {
            organization_id: params.organizationId,
            integration_id: params.integrationId,
            plug_function: params.plugFunction,
            data: params.dataJson,
            activated: true,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await this.supabase
            .from(PLUGS_TABLE)
            .insert(row)
            .select("id, activated")
            .single();

        if (error || !data) {
            throw new DatabaseError("Failed to insert integration plug", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "insert",
                resource: { type: "table", name: PLUGS_TABLE },
            });
        }
        return data as { id: string; activated: boolean };
    }

    async updatePlugData(params: {
        organizationId: string;
        integrationId: string;
        plugId: string;
        dataJson: string;
    }): Promise<{ id: string; activated: boolean } | null> {
        const { data, error } = await this.supabase
            .from(PLUGS_TABLE)
            .update({
                data: params.dataJson,
                updated_at: new Date().toISOString(),
            })
            .eq("organization_id", params.organizationId)
            .eq("integration_id", params.integrationId)
            .eq("id", params.plugId)
            .select("id, activated")
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to update integration plug", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: PLUGS_TABLE },
            });
        }
        return (data as { id: string; activated: boolean } | null) ?? null;
    }

    async deletePlugById(organizationId: string, plugId: string): Promise<{ id: string } | null> {
        const { data, error } = await this.supabase
            .from(PLUGS_TABLE)
            .delete()
            .eq("organization_id", organizationId)
            .eq("id", plugId)
            .select("id")
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to delete integration plug", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: PLUGS_TABLE },
            });
        }
        return data ? { id: (data as { id: string }).id } : null;
    }

    async setPlugActivated(organizationId: string, plugId: string, activated: boolean): Promise<{ id: string } | null> {
        const { data, error } = await this.supabase
            .from(PLUGS_TABLE)
            .update({ activated, updated_at: new Date().toISOString() })
            .eq("organization_id", organizationId)
            .eq("id", plugId)
            .select("id")
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to update plug activation", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: PLUGS_TABLE },
            });
        }
        return data ? { id: (data as { id: string }).id } : null;
    }
}
