import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    OrganizationInviteLike,
    OrganizationLike,
    PendingInviteViewLike,
    UserOrganizationLike,
} from "../utils/dtos/OrganizationDTO";
import { DatabaseError } from "../errors/InfraError";
import { makeId } from "../utils/make.is";

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

    private async generateApiKey(): Promise<string> {
        return `opo_${makeId(48)}`;
    }

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
        organizations: OrganizationLike[];
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

        const list = (memberships ?? []) as UserOrganizationLike[];
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

        const orgRows = (orgs ?? []) as OrganizationLike[];
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
        const { data, error } = await this.supabase.rpc(
            "internal_get_org_member_counts" as never,
            { p_org_ids: organizationIds } as never
        );

        if (error) {
            throw new DatabaseError("Failed to get member counts", {
                cause: error as unknown as Error,
                operation: "getMemberCounts",
                resource: { type: "rpc", name: "internal_get_org_member_counts" },
            });
        }

        const rows = (data ?? []) as Array<{ organization_id: string; member_count: number }>;
        const counts: Record<string, number> = {};
        for (const id of organizationIds) {
            counts[id] = 0;
        }
        for (const row of rows) {
            counts[row.organization_id] = row.member_count ?? 0;
        }
        return counts;
    }

    /** Get a single organization by id. */
    async findOrganizationById(organizationId: string): Promise<{
        organization: OrganizationLike | null;
        error: unknown;
    }> {
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .select(ORG_SELECT)
            .eq("id", organizationId)
            .single();
        return { organization: data as OrganizationLike | null, error };
    }

    /** Get membership for a user in an organization. */
    async findMembership(userId: string, organizationId: string): Promise<{
        membership: UserOrganizationLike | null;
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
        return { membership: data as UserOrganizationLike | null, error: null };
    }

    /** Create organization and optionally add first member. */
    async createOrganization(params: {
        name: string;
        description?: string | null;
    }): Promise<{ organization: OrganizationLike; error: unknown }> {
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .insert({
                name: params.name,
                description: params.description ?? null,
                api_key: await this.generateApiKey(),
                updated_at: new Date().toISOString(),
            })
            .select(ORG_SELECT)
            .single();
        return { organization: data as OrganizationLike, error };
    }

    /** Ensure an organization has an API key; writes only when `api_key` is null. */
    async ensureApiKeyForOrganization(organizationId: string): Promise<OrganizationLike | null> {
        const newKey = await this.generateApiKey();
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .update({ api_key: newKey, updated_at: new Date().toISOString() })
            .eq("id", organizationId)
            .is("api_key", null)
            .select(ORG_SELECT)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to ensure organization api key", {
                cause: error as unknown as Error,
                operation: "ensureApiKeyForOrganization",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }
        return (data as OrganizationLike | null) ?? null;
    }

    /** Add user to organization with role. */
    async addMember(params: {
        userId: string;
        organizationId: string;
        role: WorkspaceMembershipRole;
    }): Promise<{ membership: UserOrganizationLike; error: unknown }> {
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
        return { membership: data as UserOrganizationLike, error };
    }

    /** Update organization. */
    async updateOrganization(
        organizationId: string,
        params: { name?: string; description?: string | null }
    ): Promise<{ organization: OrganizationLike | null; error: unknown }> {
        const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (params.name !== undefined) payload.name = params.name;
        if (params.description !== undefined) payload.description = params.description;

        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .update(payload)
            .eq("id", organizationId)
            .select(ORG_SELECT)
            .single();
        return { organization: data as OrganizationLike | null, error };
    }

    /** Get all members of an organization (user_organizations + user profile). */
    async getTeam(organizationId: string): Promise<{
        members: (UserOrganizationLike & { email: string | null; full_name: string | null })[];
        error: unknown;
    }> {
        const { data, error } = await this.supabase.rpc(
            "internal_get_org_team_members" as never,
            { p_organization_id: organizationId } as never
        );

        if (error) {
            throw new DatabaseError("Failed to get team", {
                cause: error as unknown as Error,
                operation: "getTeam",
                resource: { type: "rpc", name: "internal_get_org_team_members" },
            });
        }

        const members = ((data ?? []) as Array<{
            id: string;
            user_id: string;
            organization_id: string;
            role: string;
            disabled: boolean;
            created_at: string;
            updated_at: string;
            email: string | null;
            full_name: string | null;
        }>).map((r) => ({
            id: r.id,
            user_id: r.user_id,
            organization_id: r.organization_id,
            role: r.role,
            disabled: r.disabled,
            created_at: r.created_at,
            updated_at: r.updated_at,
            email: r.email ?? null,
            full_name: r.full_name ?? null,
        })) as (UserOrganizationLike & { email: string | null; full_name: string | null })[];

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
    async findOrganizationByApiKey(apiKey: string): Promise<OrganizationLike | null> {
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
        return (data as OrganizationLike) ?? null;
    }

    /** Generate and set a new api_key for the organization. */
    async rotateApiKey(organizationId: string): Promise<{
        organization: OrganizationLike | null;
        error: unknown;
    }> {
        const newKey = await this.generateApiKey();
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .update({ api_key: newKey, updated_at: new Date().toISOString() })
            .eq("id", organizationId)
            .select(ORG_SELECT)
            .single();
        return { organization: data as OrganizationLike | null, error };
    }

    /** Insert a pending invite (when admin sends invite by email). */
    async insertInvite(params: {
        email: string;
        organizationId: string;
        role: "user" | "admin";
        invitedByUserId: string;
        expiresAt: string;
    }): Promise<{ invite: OrganizationInviteLike; error: unknown }> {
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
        return { invite: data as OrganizationInviteLike, error };
    }

    /** List pending invites for an email (not yet accepted, not expired), with org name. */
    async findPendingInvitesByEmail(email: string): Promise<{
        invites: PendingInviteViewLike[];
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

        const rows = (data ?? []) as OrganizationInviteLike[];
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
    async findInviteById(inviteId: string): Promise<{ invite: OrganizationInviteLike | null; error: unknown }> {
        const { data, error } = await this.supabase
            .from(INVITES_TABLE)
            .select()
            .eq("id", inviteId)
            .single();
        return { invite: data as OrganizationInviteLike | null, error };
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
