import type {
    OrganizationRepository,
    OrganizationRow,
    UserOrganizationRow,
    PendingInviteViewRow,
    WorkspaceMembershipRole,
} from "../repositories/OrganizationRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { EmailService } from "./EmailService";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import { OrganizationNotFoundError, OrganizationForbiddenError } from "../errors/OrganizationError";
import { UserNotFoundError } from "../errors/UserError";
import { signInviteToken, verifyInviteToken } from "../utils/inviteToken";
import { config } from "../config/GlobalConfig";
import { OrganizationInviteEmailTemplate } from "../emails/OrganizationInviteEmailTemplate";
import dayjs from "dayjs";
import { logger } from "../utils/Logger";

const ROLE_LEVEL: Record<string, number> = { user: 0, admin: 1, superadmin: 2 };

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    ORG: "org",
    ORG_LIST_BYUSERID: "org:list:byUserId",
    ORG_BY_IDS: "org:byIds",
};

const ORG_CACHE_TTL_SEC = 300;

export class OrganizationService {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly userRepository: UserRepository,
        private readonly emailService?: EmailService,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    /** Invite a team member by email: create signed invite link and optionally send email. */
    async inviteTeamMemberByEmail(
        authUserId: string,
        organizationId: string,
        params: { email: string; workspaceRole: "user" | "admin"; sendEmail: boolean }
    ): Promise<{ url: string; expiresAt: string }> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) throw new OrganizationNotFoundError(organizationId);

        if (this.getRoleLevel(membership.role) < 1) throw new OrganizationForbiddenError("Only admins can invite team members");

        const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
        if (!organization) throw new OrganizationNotFoundError(organizationId);
        const secret = (config.auth as { inviteTokenSecret?: string })?.inviteTokenSecret ?? "";
        const token = signInviteToken(
            { email: params.email, organizationId, workspaceRole: params.workspaceRole },
            secret
        );
        const frontendUrl = (config.server as { frontendDomainUrl?: string })?.frontendDomainUrl ?? "";
        const inviteUrl = `${frontendUrl}/join-org?token=${encodeURIComponent(token)}`;
        const expiresAt = dayjs().add(1, "hour").toISOString();
        if (params.sendEmail && this.emailService?.isEnabled) {
            try {
                await this.emailService.send(
                    new OrganizationInviteEmailTemplate(inviteUrl, organization.name, params.workspaceRole, 1),
                    params.email
                );
            } catch (_) {}
        }
        try {
            const { error } = await this.organizationRepository.insertInvite({
                email: params.email,
                organizationId,
                role: params.workspaceRole,
                invitedByUserId: userId,
                expiresAt,
            });
            if (error) throw new Error(String(error));
        } catch (err) {
            logger.warn({
                msg: "insertInvite failed (pending invites list may be incomplete)",
                organizationId,
                error: err instanceof Error ? err.message : String(err),
            });
        }
        return { url: inviteUrl, expiresAt };
    }

    /** Accept invite token and add current user to the organization. */
    async joinOrganizationByToken(
        authUserId: string,
        token: string
    ): Promise<{ organizationId: string; workspaceRole: "user" | "admin" }> {
        const secret = (config.auth as { inviteTokenSecret?: string })?.inviteTokenSecret ?? "";
        const payload = verifyInviteToken(token, secret);
        if (!payload) throw new OrganizationForbiddenError("Invalid or expired invite token");
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
        if (userData?.email && userData.email.toLowerCase() !== payload.email.toLowerCase()) {
            throw new OrganizationForbiddenError("This invite was sent to a different email. Sign in with that account to accept.");
        }
        const { membership: existing } = await this.organizationRepository.findMembership(userId, payload.organizationId);
        if (existing && !existing.disabled) {
            return { organizationId: payload.organizationId, workspaceRole: payload.workspaceRole };
        }
        const { error } = await this.organizationRepository.addMember({
            userId,
            organizationId: payload.organizationId,
            role: payload.workspaceRole,
        });
        if (error) throw error as Error;
        await this.organizationRepository.deleteInvitesByEmailAndOrganization(
            payload.email,
            payload.organizationId
        );
        await this._invalidateOrganizationRelatedCaches({ authUserId });
        return { organizationId: payload.organizationId, workspaceRole: payload.workspaceRole };
    }

    /** Validate invite token without consuming; returns org name and role for UI. */
    async validateInviteToken(token: string): Promise<{ organizationName: string; workspaceRole: string } | null> {
        const secret = (config.auth as { inviteTokenSecret?: string })?.inviteTokenSecret ?? "";
        const payload = verifyInviteToken(token, secret);
        if (!payload) return null;
        const { organization } = await this.organizationRepository.findOrganizationById(payload.organizationId);
        return organization ? { organizationName: organization.name, workspaceRole: payload.workspaceRole } : null;
    }

    /** List pending workspace invites for the current user (by email). Returns row shape; controller maps to DTO. */
    async listPendingInvitesForUser(authUserId: string): Promise<PendingInviteViewRow[]> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
        const email = userData?.email?.trim();
        if (!email) return [];
        const { invites } = await this.organizationRepository.findPendingInvitesByEmail(email);
        const result: PendingInviteViewRow[] = [];
        for (const inv of invites) {
            const { membership } = await this.organizationRepository.findMembership(userId, inv.organization_id);
            if (membership && !membership.disabled) continue;
            result.push(inv);
        }
        return result;
    }

    /** Accept a pending invite by id (current user must match invite email). */
    async acceptPendingInvite(
        authUserId: string,
        inviteId: string
    ): Promise<{ organizationId: string; workspaceRole: "user" | "admin" }> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
        const userEmail = userData?.email?.trim();
        if (!userEmail) throw new OrganizationForbiddenError("User email not found");
        const { invite } = await this.organizationRepository.findInviteById(inviteId);
        if (!invite) throw new OrganizationForbiddenError("Invite not found or already used");
        if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new OrganizationForbiddenError("This invite was sent to a different email.");
        }
        const now = new Date().toISOString();
        if (invite.expires_at <= now) throw new OrganizationForbiddenError("This invite has expired");
        const { membership: existing } = await this.organizationRepository.findMembership(userId, invite.organization_id);
        if (existing && !existing.disabled) {
            await this.organizationRepository.deleteInvite(inviteId);
            await this._invalidateOrganizationRelatedCaches({ authUserId });
            return { organizationId: invite.organization_id, workspaceRole: invite.role as "user" | "admin" };
        }
        const { error } = await this.organizationRepository.addMember({
            userId,
            organizationId: invite.organization_id,
            role: invite.role as "user" | "admin",
        });
        if (error) throw error as Error;
        await this.organizationRepository.deleteInvite(inviteId);
        await this._invalidateOrganizationRelatedCaches({ authUserId });
        return { organizationId: invite.organization_id, workspaceRole: invite.role as "user" | "admin" };
    }
    /** Resolve auth user id (Supabase auth.uid()) to public.users id. */
    private async resolveAuthUserToUserId(authUserId: string): Promise<string> {
        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) {
            throw new UserNotFoundError(authUserId);
        }
        return userId;
    }

    /** Get role level for permission checks. */
    private getRoleLevel(role: string): number {
        return ROLE_LEVEL[role] ?? -1;
    }

    /** List organizations for the authenticated user. Returns aggregate; controller maps to DTO. */
    async listMyOrganizations(authUserId: string): Promise<{
        organizations: OrganizationRow[];
        memberships: { organizationId: string; role: string; disabled: boolean }[];
        memberCounts: Record<string, number>;
    }> {
        const cacheKey = `${CACHE_KEYS.ORG_LIST_BYUSERID}:${authUserId}`;
        const factory = async (): Promise<{
            organizations: OrganizationRow[];
            memberships: { organizationId: string; role: string; disabled: boolean }[];
            memberCounts: Record<string, number>;
        }> => {
            const userId = await this.resolveAuthUserToUserId(authUserId);
            const { organizations, memberships } =
                await this.organizationRepository.findOrganizationsByUserId(userId);
            const orgIds = organizations.map((o) => o.id);
            const memberCounts = await this.organizationRepository.getMemberCounts(orgIds);
            return { organizations, memberships, memberCounts };
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, ORG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /** Get one organization by id; caller must be a member. Returns aggregate or null; controller maps to DTO. */
    async getOrganizationById(authUserId: string, organizationId: string): Promise<{
        organization: OrganizationRow;
        membership: { role: string; disabled: boolean };
        memberCount: number;
    } | null> {
        const cacheKey = `${CACHE_KEYS.ORG_BY_IDS}:${authUserId}:${organizationId}`;
        const factory = async (): Promise<{
            organization: OrganizationRow;
            membership: { role: string; disabled: boolean };
            memberCount: number;
        } | null> => {
            const userId = await this.resolveAuthUserToUserId(authUserId);
            const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
            if (!membership || membership.disabled) {
                return null;
            }
            const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
            if (!organization) return null;
            const memberCounts = await this.organizationRepository.getMemberCounts([organizationId]);
            return {
                organization,
                membership: { role: membership.role, disabled: membership.disabled },
                memberCount: memberCounts[organizationId] ?? 0,
            };
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, ORG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /** Create organization and add the current user as superadmin. Returns row; controller maps to DTO. */
    async createOrganization(
        authUserId: string,
        params: { name: string; description?: string | null }
    ): Promise<OrganizationRow> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { organization, error } = await this.organizationRepository.createOrganization(params);
        if (error) throw error as Error;
        await this.organizationRepository.addMember({
            userId,
            organizationId: organization.id,
            role: "superadmin",
        });
        await this._invalidateOrganizationRelatedCaches({ authUserId });
        return organization;
    }

    /**
     * Create a default organization for a newly registered user (createOrgAndUser-style).
     * Used at signup and OAuth registration so the user has one org and is superadmin.
     * Returns the created org row or null on failure (caller should not fail signup).
     */
    async createDefaultOrganizationForNewUser(
        authUserId: string,
        params?: { name?: string }
    ): Promise<OrganizationRow | null> {
        try {
            return await this.createOrganization(authUserId, {
                name: params?.name?.trim() || "My Organization",
                description: null,
            });
        } catch (err) {
            logger.warn({
                msg: "createDefaultOrganizationForNewUser failed",
                authUserId,
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    }

    /** Update organization; requires admin or superadmin. Returns row; controller maps to DTO. */
    async updateOrganization(
        authUserId: string,
        organizationId: string,
        params: { name?: string; description?: string | null }
    ): Promise<OrganizationRow> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        if (this.getRoleLevel(membership.role) < 1) {
            throw new OrganizationForbiddenError("Only admins can update the organization");
        }
        const { organization, error } = await this.organizationRepository.updateOrganization(
            organizationId,
            params
        );
        if (error) throw error as Error;
        if (!organization) throw new OrganizationNotFoundError(organizationId);
        await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
        return organization;
    }

    /** Get team members; requires membership. Returns row shape; controller maps to DTO. */
    async getTeam(authUserId: string, organizationId: string): Promise<
        (UserOrganizationRow & { email: string | null; full_name: string | null })[]
    > {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        const { members } = await this.organizationRepository.getTeam(organizationId);
        return members;
    }

    /** Add a team member; requires admin or superadmin. Returns added member row; controller maps to DTO. */
    async addTeamMember(
        authUserId: string,
        organizationId: string,
        params: { userId: string; workspaceRole: WorkspaceMembershipRole }
    ): Promise<UserOrganizationRow & { email: string | null; full_name: string | null }> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        if (this.getRoleLevel(membership.role) < 1) {
            throw new OrganizationForbiddenError("Only admins can add team members");
        }
        const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
        if (!organization) throw new OrganizationNotFoundError(organizationId);

        const { membership: newMembership, error } = await this.organizationRepository.addMember({
            userId: params.userId,
            organizationId,
            role: params.workspaceRole,
        });
        if (error) throw error as Error;
        const { members } = await this.organizationRepository.getTeam(organizationId);
        const added = members.find((m) => m.user_id === params.userId);
        await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
        return added ?? { ...newMembership, email: null, full_name: null };
    }

    /** Remove a team member; requires admin/superadmin (and cannot remove higher role) or self-remove. */
    async removeTeamMember(
        authUserId: string,
        organizationId: string,
        targetUserId: string
    ): Promise<void> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership: myMembership } = await this.organizationRepository.findMembership(
            userId,
            organizationId
        );
        if (!myMembership || myMembership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }

        const isSelf = userId === targetUserId;
        if (isSelf) {
            await this.organizationRepository.removeMember(targetUserId, organizationId);
            await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
            return;
        }

        if (this.getRoleLevel(myMembership.role) < 1) {
            throw new OrganizationForbiddenError("Only admins can remove team members");
        }

        const { membership: targetMembership } = await this.organizationRepository.findMembership(
            targetUserId,
            organizationId
        );
        if (!targetMembership) {
            throw new OrganizationNotFoundError("User is not a member of this organization");
        }
        if (this.getRoleLevel(targetMembership.role) >= this.getRoleLevel(myMembership.role)) {
            throw new OrganizationForbiddenError("You cannot remove a member with equal or higher role");
        }

        const { error } = await this.organizationRepository.removeMember(targetUserId, organizationId);
        if (error) throw error as Error;
        await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
    }

    /** Delete organization; requires superadmin. */
    async deleteOrganization(authUserId: string, organizationId: string): Promise<void> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        if (membership.role !== "superadmin") {
            throw new OrganizationForbiddenError("Only the organization superadmin can delete it");
        }
        const { error } = await this.organizationRepository.deleteOrganization(organizationId);
        if (error) throw error as Error;
        await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
    }

    /** Rotate API key; requires admin or superadmin. Returns row; controller maps to DTO. */
    async rotateApiKey(authUserId: string, organizationId: string): Promise<OrganizationRow> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        if (this.getRoleLevel(membership.role) < 1) {
            throw new OrganizationForbiddenError("Only admins can rotate the API key");
        }
        const { organization, error } = await this.organizationRepository.rotateApiKey(organizationId);
        if (error) throw error as Error;
        if (!organization) throw new OrganizationNotFoundError(organizationId);
        await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
        return organization;
    }

    /**
     * Invalidate caches for list (listMyOrganizations) and by-id (getOrganizationById).
     * Uses same keys as read: ORG_LIST_BYUSERID:authUserId, ORG_BY_IDS:authUserId:organizationId.
     */
    private async _invalidateOrganizationRelatedCaches(params: {
        authUserId?: string;
        organizationId?: string;
    }): Promise<void> {
        if (!this.cacheInvalidator) return;
        const { authUserId, organizationId } = params;
        try {
            if (authUserId) {
                await this.cacheInvalidator.invalidateKey(
                    `${CACHE_KEYS.ORG_LIST_BYUSERID}:${authUserId}`
                );
            }
            if (organizationId) {
                if (authUserId) {
                    await this.cacheInvalidator.invalidateKey(
                        `${CACHE_KEYS.ORG_BY_IDS}:${authUserId}:${organizationId}`
                    );
                }
                await this.cacheInvalidator.invalidatePattern(
                    `${CACHE_KEYS.ORG_BY_IDS}:*:${organizationId}`
                );
            }
            logger.debug({
                msg: "Invalidated organization related caches",
                authUserId,
                organizationId,
            });
        } catch (error) {
            logger.error({
                msg: "Error invalidating organization related caches",
                authUserId,
                organizationId,
                error: String(error),
            });
        }
    }
}
