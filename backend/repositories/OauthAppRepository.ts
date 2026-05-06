import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../errors/InfraError";

export type OauthAppLike = {
    id: string;
    organization_id: string;
    created_by_user_id: string | null;
    name: string;
    description: string | null;
    picture_id: string | null;
    redirect_url: string;
    client_id: string;
    client_secret_hash: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

export type OauthAuthorizationLike = {
    id: string;
    oauth_app_id: string;
    user_id: string;
    organization_id: string;
    access_token_hash: string | null;
    authorization_code_hash: string | null;
    code_expires_at: string | null;
    revoked_at: string | null;
    created_at: string;
    updated_at: string;
};

const TABLE_APPS = "oauth_apps";
const TABLE_AUTHS = "oauth_authorizations";

export class OauthAppRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getAppByOrganizationId(organizationId: string): Promise<OauthAppLike | null> {
        const { data, error } = await this.supabase
            .from(TABLE_APPS)
            .select("*")
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .maybeSingle();
        if (error) {
            throw new DatabaseError("Failed to resolve oauth app by organization_id", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_APPS },
            });
        }
        return (data as OauthAppLike | null) ?? null;
    }

    async listAppsByOrganization(organizationId: string): Promise<OauthAppLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE_APPS)
            .select("*")
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });
        if (error) {
            throw new DatabaseError("Failed to list oauth apps", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_APPS },
            });
        }
        return (data ?? []) as OauthAppLike[];
    }

    async createApp(input: {
        organizationId: string;
        createdByUserId: string | null;
        name: string;
        description: string | null;
        redirectUrl: string;
        clientId: string;
        clientSecretHash: string;
        pictureId?: string | null;
    }): Promise<OauthAppLike> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_APPS)
            .insert({
                organization_id: input.organizationId,
                created_by_user_id: input.createdByUserId,
                name: input.name,
                description: input.description,
                picture_id: input.pictureId ?? null,
                redirect_url: input.redirectUrl,
                client_id: input.clientId,
                client_secret_hash: input.clientSecretHash,
                deleted_at: null,
                created_at: now,
                updated_at: now,
            })
            .select("*")
            .single();
        if (error || !data) {
            throw new DatabaseError("Failed to create oauth app", {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_APPS },
            });
        }
        return data as OauthAppLike;
    }

    async updateApp(params: {
        organizationId: string;
        oauthAppId: string;
        name?: string;
        description?: string | null;
        pictureId?: string | null;
        redirectUrl?: string;
    }): Promise<OauthAppLike | null> {
        const now = new Date().toISOString();
        const payload: Record<string, unknown> = { updated_at: now };
        if (params.name !== undefined) payload.name = params.name;
        if (params.description !== undefined) payload.description = params.description;
        if (params.pictureId !== undefined) payload.picture_id = params.pictureId;
        if (params.redirectUrl !== undefined) payload.redirect_url = params.redirectUrl;

        const { data, error } = await this.supabase
            .from(TABLE_APPS)
            .update(payload)
            .eq("id", params.oauthAppId)
            .eq("organization_id", params.organizationId)
            .is("deleted_at", null)
            .select("*")
            .maybeSingle();
        if (error) {
            throw new DatabaseError("Failed to update oauth app", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_APPS },
            });
        }
        return (data as OauthAppLike | null) ?? null;
    }

    async updateClientSecretHash(params: { organizationId: string; oauthAppId: string; clientSecretHash: string }): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_APPS)
            .update({ client_secret_hash: params.clientSecretHash, updated_at: now })
            .eq("id", params.oauthAppId)
            .eq("organization_id", params.organizationId)
            .is("deleted_at", null);
        if (error) {
            throw new DatabaseError("Failed to update oauth app client secret hash", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_APPS },
            });
        }
    }

    async deleteApp(organizationId: string, oauthAppId: string): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_APPS)
            .update({ deleted_at: now, updated_at: now })
            .eq("id", oauthAppId)
            .eq("organization_id", organizationId)
            .is("deleted_at", null);
        if (error) {
            throw new DatabaseError("Failed to delete oauth app", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_APPS },
            });
        }
    }

    async findActiveAppByClientId(clientId: string): Promise<OauthAppLike | null> {
        const { data, error } = await this.supabase
            .from(TABLE_APPS)
            .select("*")
            .eq("client_id", clientId)
            .is("deleted_at", null)
            .maybeSingle();
        if (error) {
            throw new DatabaseError("Failed to resolve oauth app by client_id", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_APPS },
            });
        }
        return (data as OauthAppLike | null) ?? null;
    }

    async findAuthorizationByCodeHash(codeHash: string): Promise<OauthAuthorizationLike | null> {
        const { data, error } = await this.supabase
            .from(TABLE_AUTHS)
            .select("*")
            .eq("authorization_code_hash", codeHash)
            .is("revoked_at", null)
            .maybeSingle();
        if (error) {
            throw new DatabaseError("Failed to resolve oauth authorization by code", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
        return (data as OauthAuthorizationLike | null) ?? null;
    }

    async listApprovedAuthorizationsByUserId(userId: string): Promise<OauthAuthorizationLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE_AUTHS)
            .select("*")
            .eq("user_id", userId)
            .is("revoked_at", null)
            .not("access_token_hash", "is", null)
            .order("created_at", { ascending: false });
        if (error) {
            throw new DatabaseError("Failed to list approved oauth authorizations", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
        return (data ?? []) as OauthAuthorizationLike[];
    }

    async revokeAuthorizationByIdAndUserId(params: { authorizationId: string; userId: string }): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_AUTHS)
            .update({ revoked_at: now, updated_at: now, access_token_hash: null, authorization_code_hash: null, code_expires_at: null })
            .eq("id", params.authorizationId)
            .eq("user_id", params.userId)
            .is("revoked_at", null);
        if (error) {
            throw new DatabaseError("Failed to revoke oauth authorization", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
    }

    async revokeAllForApp(oauthAppId: string): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_AUTHS)
            .update({ revoked_at: now, updated_at: now, access_token_hash: null, authorization_code_hash: null, code_expires_at: null })
            .eq("oauth_app_id", oauthAppId)
            .is("revoked_at", null);
        if (error) {
            throw new DatabaseError("Failed to revoke oauth authorizations for app", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
    }

    async upsertAuthorization(input: {
        oauthAppId: string;
        userId: string;
        organizationId: string;
    }): Promise<OauthAuthorizationLike> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(TABLE_AUTHS)
            .upsert(
                {
                    oauth_app_id: input.oauthAppId,
                    user_id: input.userId,
                    organization_id: input.organizationId,
                    updated_at: now,
                },
                { onConflict: "oauth_app_id,user_id,organization_id" }
            )
            .select("*")
            .single();
        if (error || !data) {
            throw new DatabaseError("Failed to upsert oauth authorization", {
                cause: error as unknown as Error,
                operation: "upsert",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
        return data as OauthAuthorizationLike;
    }

    async setAuthorizationCode(params: {
        authorizationId: string;
        codeHash: string;
        expiresAtIso: string;
    }): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_AUTHS)
            .update({
                authorization_code_hash: params.codeHash,
                code_expires_at: params.expiresAtIso,
                updated_at: now,
            })
            .eq("id", params.authorizationId);
        if (error) {
            throw new DatabaseError("Failed to set authorization code", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
    }

    async exchangeCodeForAccessToken(params: {
        oauthAppId: string;
        organizationId: string;
        codeHash: string;
        accessTokenHash: string;
    }): Promise<OauthAuthorizationLike | null> {
        const now = new Date().toISOString();
        // Only exchange if code matches and not expired/revoked.
        const { data, error } = await this.supabase
            .from(TABLE_AUTHS)
            .update({
                access_token_hash: params.accessTokenHash,
                authorization_code_hash: null,
                code_expires_at: null,
                updated_at: now,
            })
            .eq("oauth_app_id", params.oauthAppId)
            .eq("organization_id", params.organizationId)
            .eq("authorization_code_hash", params.codeHash)
            .is("revoked_at", null)
            .gte("code_expires_at", now)
            .select("*")
            .maybeSingle();
        if (error) {
            throw new DatabaseError("Failed to exchange authorization code", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
        return (data as OauthAuthorizationLike | null) ?? null;
    }

    async listAuthorizationsByApp(params: { organizationId: string; oauthAppId: string }): Promise<OauthAuthorizationLike[]> {
        const { data, error } = await this.supabase
            .from(TABLE_AUTHS)
            .select("*")
            .eq("oauth_app_id", params.oauthAppId)
            .eq("organization_id", params.organizationId)
            .order("created_at", { ascending: false });
        if (error) {
            throw new DatabaseError("Failed to list oauth authorizations", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
        return (data ?? []) as OauthAuthorizationLike[];
    }

    async findActiveAuthorizationByAccessTokenHash(accessTokenHash: string): Promise<OauthAuthorizationLike | null> {
        const { data, error } = await this.supabase
            .from(TABLE_AUTHS)
            .select("*")
            .is("revoked_at", null)
            .eq("access_token_hash", accessTokenHash)
            .maybeSingle();
        if (error) {
            throw new DatabaseError("Failed to resolve oauth access token", {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
        return (data as OauthAuthorizationLike | null) ?? null;
    }

    async revokeAuthorizationByAccessTokenHash(params: {
        organizationId: string;
        oauthAppId: string;
        accessTokenHash: string;
    }): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_AUTHS)
            .update({ revoked_at: now, updated_at: now, access_token_hash: null })
            .eq("oauth_app_id", params.oauthAppId)
            .eq("organization_id", params.organizationId)
            .eq("access_token_hash", params.accessTokenHash)
            .is("revoked_at", null);
        if (error) {
            throw new DatabaseError("Failed to revoke oauth authorization", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_AUTHS },
            });
        }
    }
}

