import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../errors/InfraError";

/** Table `public.integrations` — connected channels (snake_case columns). */
const TABLE = "integrations";

export type IntegrationRow = {
    id: string;
    organization_id: string;
    internal_id: string;
    name: string;
    picture: string | null;
    provider_identifier: string;
    type: string;
    token: string;
    disabled: boolean;
    token_expiration: string | null;
    refresh_token: string | null;
    profile: string | null;
    deleted_at: string | null;
    in_between_steps: boolean;
    refresh_needed: boolean;
    posting_times: string;
    custom_instance_details: string | null;
    additional_settings: string;
    customer_id: string | null;
    root_internal_id: string | null;
    created_at: string;
    updated_at: string;
};

export class IntegrationRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async listByOrganization(organizationId: string): Promise<IntegrationRow[]> {
        const { data, error } = await this.supabase.rpc("internal_list_integrations_by_org", {
            p_organization_id: organizationId,
        });

        if (error) {
            throw new DatabaseError("Failed to list integrations", {
                cause: error as unknown as Error,
                operation: "rpc:internal_list_integrations_by_org",
                resource: { type: "table", name: TABLE },
            });
        }
        return (data ?? []) as IntegrationRow[];
    }

    async getById(organizationId: string, id: string): Promise<IntegrationRow | null> {
        const { data, error } = await this.supabase.rpc("internal_get_integration_by_org_and_id", {
            p_organization_id: organizationId,
            p_integration_id: id,
        });

        if (error) {
            throw new DatabaseError("Failed to load integration", {
                cause: error as unknown as Error,
                operation: "rpc:internal_get_integration_by_org_and_id",
                resource: { type: "table", name: TABLE },
            });
        }
        const rows = (data ?? []) as IntegrationRow[];
        return rows[0] ?? null;
    }

    async upsertIntegration(params: {
        organizationId: string;
        internalId: string;
        name: string;
        picture?: string | null;
        providerIdentifier: string;
        integrationType: "social" | "article";
        token: string;
        refreshToken: string;
        expiresInSeconds?: number;
        profile?: string | null;
        inBetweenSteps: boolean;
        additionalSettingsJson: string;
        customInstanceDetails?: string | null;
        postingTimesJson: string;
        rootInternalId: string | null;
    }): Promise<IntegrationRow> {
        const tokenExpiration =
            params.expiresInSeconds != null && params.expiresInSeconds > 0
                ? new Date(Date.now() + params.expiresInSeconds * 1000).toISOString()
                : null;

        const row = {
            organization_id: params.organizationId,
            internal_id: params.internalId,
            name: params.name,
            picture: params.picture ?? null,
            provider_identifier: params.providerIdentifier,
            type: params.integrationType,
            token: params.token,
            refresh_token: params.refreshToken || null,
            token_expiration: tokenExpiration,
            profile: params.profile ?? null,
            in_between_steps: params.inBetweenSteps,
            refresh_needed: false,
            deleted_at: null,
            posting_times: params.postingTimesJson,
            custom_instance_details: params.customInstanceDetails ?? null,
            additional_settings: params.additionalSettingsJson,
            root_internal_id: params.rootInternalId,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await this.supabase
            .from(TABLE)
            .upsert(row, { onConflict: "organization_id,internal_id" })
            .select("*")
            .single();

        if (error || !data) {
            throw new DatabaseError("Failed to upsert integration", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "upsert",
                resource: { type: "table", name: TABLE },
            });
        }
        return data as IntegrationRow;
    }

    async disableChannel(organizationId: string, id: string): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE)
            .update({ disabled: true, updated_at: new Date().toISOString() })
            .eq("organization_id", organizationId)
            .eq("id", id);

        if (error) {
            throw new DatabaseError("Failed to disable integration", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
    }

    async enableChannel(organizationId: string, id: string): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE)
            .update({ disabled: false, updated_at: new Date().toISOString() })
            .eq("organization_id", organizationId)
            .eq("id", id);

        if (error) {
            throw new DatabaseError("Failed to enable integration", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
    }

    async setPostingTimes(organizationId: string, integrationId: string, postingTimesJson: string): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE)
            .update({ posting_times: postingTimesJson, updated_at: new Date().toISOString() })
            .eq("organization_id", organizationId)
            .eq("id", integrationId)
            .is("deleted_at", null);

        if (error) {
            throw new DatabaseError("Failed to update posting times", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
    }

    async setRefreshNeeded(organizationId: string, integrationId: string, needed: boolean): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE)
            .update({ refresh_needed: needed, updated_at: new Date().toISOString() })
            .eq("organization_id", organizationId)
            .eq("id", integrationId);

        if (error) {
            throw new DatabaseError("Failed to update refresh_needed", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
    }

    /** Update a channel by primary key (e.g. completing Instagram Business account selection). */
    async updateIntegrationById(
        organizationId: string,
        integrationId: string,
        params: {
            internalId: string;
            name: string;
            picture: string | null;
            token: string;
            refreshToken: string;
            profile: string | null;
            inBetweenSteps: boolean;
            rootInternalId: string | null;
            expiresInSeconds?: number;
        }
    ): Promise<IntegrationRow> {
        const tokenExpiration =
            params.expiresInSeconds != null && params.expiresInSeconds > 0
                ? new Date(Date.now() + params.expiresInSeconds * 1000).toISOString()
                : null;

        const { data, error } = await this.supabase
            .from(TABLE)
            .update({
                internal_id: params.internalId,
                name: params.name,
                picture: params.picture,
                token: params.token,
                refresh_token: params.refreshToken || null,
                token_expiration: tokenExpiration,
                profile: params.profile,
                in_between_steps: params.inBetweenSteps,
                root_internal_id: params.rootInternalId,
                refresh_needed: false,
                updated_at: new Date().toISOString(),
            })
            .eq("organization_id", organizationId)
            .eq("id", integrationId)
            .is("deleted_at", null)
            .select("*")
            .single();

        if (error || !data) {
            throw new DatabaseError("Failed to update integration", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "update",
                resource: { type: "table", name: TABLE },
            });
        }
        return data as IntegrationRow;
    }

    /** @returns whether a row was updated */
    async softDeleteChannel(organizationId: string, id: string, internalId: string): Promise<boolean> {
        const suffix = `${Date.now().toString(36)}`;
        const newInternal = `deleted_${internalId}_${suffix}`.slice(0, 512);
        const { data, error } = await this.supabase.rpc("internal_soft_delete_integration", {
            p_organization_id: organizationId,
            p_integration_id: id,
            p_new_internal_id: newInternal,
        });

        if (error) {
            throw new DatabaseError("Failed to delete integration", {
                cause: error as unknown as Error,
                operation: "rpc:internal_soft_delete_integration",
                resource: { type: "table", name: TABLE },
            });
        }
        return data === true;
    }
}
