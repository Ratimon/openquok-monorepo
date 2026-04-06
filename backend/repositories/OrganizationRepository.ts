import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../errors/InfraError";

/** DB row shape for organizations table. */
export type OrganizationRow = {
    id: string;
    name: string;
    description: string | null;
    api_key: string | null;
    created_at: string;
    updated_at: string;
};

/** DB row shape for user_organizations table. */
export type UserOrganizationRow = {
    id: string;
    user_id: string;
    organization_id: string;
    role: string;
    disabled: boolean;
    created_at: string;
    updated_at: string;
};

/** DB row shape for organization_invites table. */
export type OrganizationInviteRow = {
    id: string;
    email: string;
    organization_id: string;
    role: string;
    invited_by_user_id: string;
    created_at: string;
    expires_at: string;
};

/** Pending invite with org name (e.g. findPendingInvitesByEmail result). */
export type PendingInviteViewRow = OrganizationInviteRow & { organization_name: string };

const ORGS_TABLE = "organizations";
const USER_ORGS_TABLE = "user_organizations";
const INVITES_TABLE = "organization_invites";

const ORG_SELECT = "id, name, description, api_key, created_at, updated_at";
const USER_ORG_SELECT =
    "id, user_id, organization_id, role, disabled, created_at, updated_at";

export type WorkspaceMembershipRole = "user" | "admin" | "superadmin";
// Backward-compat alias (internal). Prefer WorkspaceMembershipRole.
export type OrgRole = WorkspaceMembershipRole;

export class OrganizationRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /** Find public.users.id by auth_id (Supabase auth user id).
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
    async findUserIdByAuthId(authId: string): Promise<{ userId: string | null; error: unknown }> {
        const { data, error } = await this.supabase.rpc("internal_find_user_id_by_auth_id" as never, {
            p_auth_id: authId,
        } as never);
        if (error) {
            throw new DatabaseError("Failed to resolve user by auth id", {
                cause: error as unknown as Error,
                operation: "findUserIdByAuthId",
                resource: { type: "table", name: "users" },
            });
        }
        return { userId: (data as string) ?? null, error: null };
    }

    /** List organizations the user belongs to (non-disabled memberships). */
    async findOrganizationsByUserId(userId: string): Promise<{
        organizations: OrganizationRow[];
        memberships: { organizationId: string; role: string; disabled: boolean }[];
        error: unknown;
    }> {
        const { data: memberships, error: uoError } = await this.supabase
            .from(USER_ORGS_TABLE)
            .select(USER_ORG_SELECT)
            .eq("user_id", userId)
            .eq("disabled", false);

        if (uoError) {
            throw new DatabaseError("Failed to list user organizations", {
                cause: uoError as unknown as Error,
                operation: "findOrganizationsByUserId",
                resource: { type: "table", name: USER_ORGS_TABLE },
            });
        }

        const list = (memberships ?? []) as UserOrganizationRow[];
        if (list.length === 0) {
            return { organizations: [], memberships: [], error: null };
        }

        const orgIds = [...new Set(list.map((m) => m.organization_id))];
        const { data: orgs, error: orgError } = await this.supabase
            .from(ORGS_TABLE)
            .select(ORG_SELECT)
            .in("id", orgIds);

        if (orgError) {
            throw new DatabaseError("Failed to load organizations", {
                cause: orgError as unknown as Error,
                operation: "findOrganizationsByUserId",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }

        const orgRows = (orgs ?? []) as OrganizationRow[];
        const membershipMap = list.map((m) => ({
            organizationId: m.organization_id,
            role: m.role,
            disabled: m.disabled,
        }));

        return {
            organizations: orgRows,
            memberships: membershipMap,
            error: null,
        };
    }

    /** Get member counts (non-disabled) per organization id. */
    async getMemberCounts(organizationIds: string[]): Promise<Record<string, number>> {
        if (organizationIds.length === 0) {
            return {};
        }
        const { data, error } = await this.supabase
            .from(USER_ORGS_TABLE)
            .select("organization_id")
            .in("organization_id", organizationIds)
            .eq("disabled", false);

        if (error) {
            throw new DatabaseError("Failed to get member counts", {
                cause: error as unknown as Error,
                operation: "getMemberCounts",
                resource: { type: "table", name: USER_ORGS_TABLE },
            });
        }

        const rows = (data ?? []) as { organization_id: string }[];
        const counts: Record<string, number> = {};
        for (const id of organizationIds) {
            counts[id] = 0;
        }
        for (const row of rows) {
            counts[row.organization_id] = (counts[row.organization_id] ?? 0) + 1;
        }
        return counts;
    }

    /** Get a single organization by id. */
    async findOrganizationById(organizationId: string): Promise<{
        organization: OrganizationRow | null;
        error: unknown;
    }> {
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .select(ORG_SELECT)
            .eq("id", organizationId)
            .single();
        return { organization: data as OrganizationRow | null, error };
    }

    /** Get membership for a user in an organization. */
    async findMembership(userId: string, organizationId: string): Promise<{
        membership: UserOrganizationRow | null;
        error: unknown;
    }> {
        const { data, error } = await this.supabase
            .from(USER_ORGS_TABLE)
            .select(USER_ORG_SELECT)
            .eq("user_id", userId)
            .eq("organization_id", organizationId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to load membership", {
                cause: error as unknown as Error,
                operation: "findMembership",
                resource: { type: "table", name: USER_ORGS_TABLE },
            });
        }
        return { membership: data as UserOrganizationRow | null, error: null };
    }

    /** Create organization and optionally add first member. */
    async createOrganization(params: {
        name: string;
        description?: string | null;
    }): Promise<{ organization: OrganizationRow; error: unknown }> {
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .insert({
                name: params.name,
                description: params.description ?? null,
                updated_at: new Date().toISOString(),
            })
            .select(ORG_SELECT)
            .single();
        return { organization: data as OrganizationRow, error };
    }

    /** Add user to organization with role. */
    async addMember(params: {
        userId: string;
        organizationId: string;
        role: WorkspaceMembershipRole;
    }): Promise<{ membership: UserOrganizationRow; error: unknown }> {
        const { data, error } = await this.supabase
            .from(USER_ORGS_TABLE)
            .insert({
                user_id: params.userId,
                organization_id: params.organizationId,
                role: params.role,
                disabled: false,
                updated_at: new Date().toISOString(),
            })
            .select(USER_ORG_SELECT)
            .single();
        return { membership: data as UserOrganizationRow, error };
    }

    /** Update organization. */
    async updateOrganization(
        organizationId: string,
        params: { name?: string; description?: string | null }
    ): Promise<{ organization: OrganizationRow | null; error: unknown }> {
        const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (params.name !== undefined) payload.name = params.name;
        if (params.description !== undefined) payload.description = params.description;

        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .update(payload)
            .eq("id", organizationId)
            .select(ORG_SELECT)
            .single();
        return { organization: data as OrganizationRow | null, error };
    }

    /** Get all members of an organization (user_organizations + user profile). */
    async getTeam(organizationId: string): Promise<{
        members: (UserOrganizationRow & { email: string | null; full_name: string | null })[];
        error: unknown;
    }> {
        const { data: uoList, error: uoError } = await this.supabase
            .from(USER_ORGS_TABLE)
            .select(USER_ORG_SELECT)
            .eq("organization_id", organizationId);

        if (uoError) {
            throw new DatabaseError("Failed to get team", {
                cause: uoError as unknown as Error,
                operation: "getTeam",
                resource: { type: "table", name: USER_ORGS_TABLE },
            });
        }

        const rows = (uoList ?? []) as UserOrganizationRow[];
        if (rows.length === 0) {
            return { members: [], error: null };
        }

        const userIds = [...new Set(rows.map((r) => r.user_id))];
        const { data: userList, error: userError } = await this.supabase
            .from("users")
            .select("id, email, full_name")
            .in("id", userIds);

        if (userError) {
            throw new DatabaseError("Failed to get users for team", {
                cause: userError as unknown as Error,
                operation: "getTeam",
                resource: { type: "table", name: "users" },
            });
        }

        const userMap = new Map(
            (userList ?? []).map((u: { id: string; email: string | null; full_name: string | null }) => [
                u.id,
                { email: u.email, full_name: u.full_name },
            ])
        );

        const members = rows.map((r) => ({
            ...r,
            email: userMap.get(r.user_id)?.email ?? null,
            full_name: userMap.get(r.user_id)?.full_name ?? null,
        }));

        return { members, error: null };
    }

    /** Remove member from organization. */
    async removeMember(
        userId: string,
        organizationId: string
    ): Promise<{ error: unknown }> {
        const { error } = await this.supabase
            .from(USER_ORGS_TABLE)
            .delete()
            .eq("user_id", userId)
            .eq("organization_id", organizationId);
        return { error };
    }

    /** Delete organization (cascade deletes user_organizations). */
    async deleteOrganization(organizationId: string): Promise<{ error: unknown }> {
        const { error } = await this.supabase
            .from(ORGS_TABLE)
            .delete()
            .eq("id", organizationId);
        return { error };
    }

    /** Resolve organization by programmatic API key (Authorization header value). */
    async findOrganizationByApiKey(apiKey: string): Promise<OrganizationRow | null> {
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .select(ORG_SELECT)
            .eq("api_key", apiKey)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to resolve organization by API key", {
                cause: error as unknown as Error,
                operation: "findOrganizationByApiKey",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }
        return (data as OrganizationRow) ?? null;
    }

    /** Generate and set a new api_key for the organization. */
    async rotateApiKey(organizationId: string): Promise<{
        organization: OrganizationRow | null;
        error: unknown;
    }> {
        const crypto = await import("node:crypto");
        const newKey = `co_${crypto.randomBytes(24).toString("hex")}`;
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .update({ api_key: newKey, updated_at: new Date().toISOString() })
            .eq("id", organizationId)
            .select(ORG_SELECT)
            .single();
        return { organization: data as OrganizationRow | null, error };
    }

    /** Insert a pending invite (when admin sends invite by email). */
    async insertInvite(params: {
        email: string;
        organizationId: string;
        role: "user" | "admin";
        invitedByUserId: string;
        expiresAt: string;
    }): Promise<{ invite: OrganizationInviteRow; error: unknown }> {
        const { data, error } = await this.supabase
            .from(INVITES_TABLE)
            .insert({
                email: params.email.toLowerCase().trim(),
                organization_id: params.organizationId,
                role: params.role,
                invited_by_user_id: params.invitedByUserId,
                expires_at: params.expiresAt,
            })
            .select()
            .single();
        return { invite: data as OrganizationInviteRow, error };
    }

    /** List pending invites for an email (not yet accepted, not expired), with org name. */
    async findPendingInvitesByEmail(email: string): Promise<{
        invites: PendingInviteViewRow[];
        error: unknown;
    }> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(INVITES_TABLE)
            .select()
            .ilike("email", email.trim())
            .gt("expires_at", now);

        if (error) {
            throw new DatabaseError("Failed to list pending invites", {
                cause: error as unknown as Error,
                operation: "findPendingInvitesByEmail",
                resource: { type: "table", name: INVITES_TABLE },
            });
        }

        const rows = (data ?? []) as OrganizationInviteRow[];
        if (rows.length === 0) return { invites: [], error: null };

        const orgIds = [...new Set(rows.map((r) => r.organization_id))];
        const { data: orgs, error: orgError } = await this.supabase
            .from(ORGS_TABLE)
            .select("id, name")
            .in("id", orgIds);

        if (orgError) {
            throw new DatabaseError("Failed to load organizations for invites", {
                cause: orgError as unknown as Error,
                operation: "findPendingInvitesByEmail",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }

        const nameByOrgId = new Map(
            (orgs ?? []).map((o: { id: string; name: string }) => [o.id, o.name])
        );
        const invites = rows.map((r) => ({
            ...r,
            organization_name: nameByOrgId.get(r.organization_id) ?? "",
        }));
        return { invites, error: null };
    }

    /** Get a single invite by id. */
    async findInviteById(inviteId: string): Promise<{ invite: OrganizationInviteRow | null; error: unknown }> {
        const { data, error } = await this.supabase
            .from(INVITES_TABLE)
            .select()
            .eq("id", inviteId)
            .single();
        return { invite: data as OrganizationInviteRow | null, error };
    }

    /** Delete one invite by id. */
    async deleteInvite(inviteId: string): Promise<{ error: unknown }> {
        const { error } = await this.supabase.from(INVITES_TABLE).delete().eq("id", inviteId);
        return { error };
    }

    /** Delete all invites for a given email + organization (e.g. after accept via token). */
    async deleteInvitesByEmailAndOrganization(
        email: string,
        organizationId: string
    ): Promise<{ error: unknown }> {
        const { error } = await this.supabase
            .from(INVITES_TABLE)
            .delete()
            .ilike("email", email.trim())
            .eq("organization_id", organizationId);
        return { error };
    }

    /** Active members with email and per-user notification email preferences. */
    async listMembersForNotificationEmails(organizationId: string): Promise<
        Array<{
            userId: string;
            email: string | null;
            sendSuccessEmails: boolean;
            sendFailureEmails: boolean;
        }>
    > {
        const { data: uoList, error: uoError } = await this.supabase
            .from(USER_ORGS_TABLE)
            .select("user_id")
            .eq("organization_id", organizationId)
            .eq("disabled", false);

        if (uoError) {
            throw new DatabaseError("Failed to list members for notifications", {
                cause: uoError as unknown as Error,
                operation: "listMembersForNotificationEmails",
                resource: { type: "table", name: USER_ORGS_TABLE },
            });
        }

        const userIds = [...new Set((uoList ?? []).map((r: { user_id: string }) => r.user_id))];
        if (userIds.length === 0) return [];

        const { data: userList, error: userError } = await this.supabase
            .from("users")
            .select("id, email, send_success_emails, send_failure_emails")
            .in("id", userIds);

        if (userError) {
            throw new DatabaseError("Failed to load users for notification emails", {
                cause: userError as unknown as Error,
                operation: "listMembersForNotificationEmails",
                resource: { type: "table", name: "users" },
            });
        }

        return (userList ?? []).map(
            (u: {
                id: string;
                email: string | null;
                send_success_emails: boolean | null;
                send_failure_emails: boolean | null;
            }) => ({
                userId: u.id,
                email: u.email,
                sendSuccessEmails: u.send_success_emails !== false,
                sendFailureEmails: u.send_failure_emails !== false,
            })
        );
    }
}
