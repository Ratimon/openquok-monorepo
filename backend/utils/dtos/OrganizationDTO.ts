/**
 * Organization DTO for API responses.
 */

/** DB row shape for organizations table. */
export type OrganizationLike = {
    id: string;
    name: string;
    description: string | null;
    api_key: string | null;
    created_at: string;
    updated_at: string;
};

/** DB row shape for user_organizations table. */
export type UserOrganizationLike = {
    id: string;
    user_id: string;
    organization_id: string;
    role: string;
    disabled: boolean;
    created_at: string;
    updated_at: string;
};

/** DB row shape for organization_invites table. */
export type OrganizationInviteLike = {
    id: string;
    email: string;
    organization_id: string;
    role: string;
    invited_by_user_id: string;
    created_at: string;
    expires_at: string;
};

/** Pending invite with org name (e.g. findPendingInvitesByEmail result). */
export type PendingInviteViewLike = OrganizationInviteLike & { organization_name: string };

export interface OrganizationDTO {
    id: string;
    name: string;
    description: string | null;
    apiKey: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Organization with the current user's role (for list/detail).
 */
export interface OrganizationWithRoleDTO extends OrganizationDTO {
    workspaceRole: "user" | "admin" | "superadmin";
    disabled: boolean;
    memberCount: number;
}

/**
 * Team member within an organization.
 */
export interface OrganizationMemberDTO {
    id: string;
    userId: string;
    organizationId: string;
    workspaceRole: "user" | "admin" | "superadmin";
    disabled: boolean;
    email: string | null;
    fullName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PendingInviteDTO {
    id: string;
    organizationId: string;
    organizationName: string;
    workspaceRole: string;
    expiresAt: string;
}

export function toPendingInviteDTO(row: PendingInviteViewLike): PendingInviteDTO {
    return {
        id: row.id,
        organizationId: row.organization_id,
        organizationName: row.organization_name,
        workspaceRole: row.role,
        expiresAt: row.expires_at,
    };
}

export function toOrganizationDTO(row: OrganizationLike | null): OrganizationDTO | null {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? null,
        apiKey: row.api_key ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function toOrganizationWithRoleDTO(
    org: OrganizationLike,
    membership: { role: string; disabled: boolean },
    memberCount: number
): OrganizationWithRoleDTO {
    const dto = toOrganizationDTO(org)!;
    return {
        ...dto,
        workspaceRole: membership.role as "user" | "admin" | "superadmin",
        disabled: membership.disabled,
        memberCount,
    };
}

export function toOrganizationMemberDTO(
    uo: UserOrganizationLike,
    user: { email: string | null; full_name: string | null } | null
): OrganizationMemberDTO {
    return {
        id: uo.id,
        userId: uo.user_id,
        organizationId: uo.organization_id,
        workspaceRole: uo.role as "user" | "admin" | "superadmin",
        disabled: uo.disabled,
        email: user?.email ?? null,
        fullName: user?.full_name ?? null,
        createdAt: uo.created_at,
        updatedAt: uo.updated_at,
    };
}
