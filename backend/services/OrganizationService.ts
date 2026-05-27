import type { OrganizationRepository, WorkspaceMembershipRole } from "../repositories/OrganizationRepository";
import type {
    OrganizationInviteLike,
    OrganizationLike,
    PendingInviteViewLike,
    UserOrganizationLike,
} from "../utils/dtos/OrganizationDTO";
import type { UserRepository } from "../repositories/UserRepository";
import type { EmailService } from "./EmailService";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";

import { OrganizationNotFoundError, OrganizationForbiddenError } from "../errors/OrganizationError";
import { UserNotFoundError } from "../errors/UserError";
import { SubscriptionSection } from "openquok-common";
import {
    decodeInviteToken,
    INVITE_TOKEN_TTL_HOURS,
    INVITE_TOKEN_TTL_MS,
    signInviteToken,
    verifyInviteToken,
    type InviteTokenInvalidReason,
} from "../utils/auth/inviteToken";
import { config } from "../config/GlobalConfig";
import { OrganizationInviteEmailTemplate } from "../emails/OrganizationInviteEmailTemplate";
import dayjs from "dayjs";
import { logger } from "../utils/Logger";

const ROLE_LEVEL: Record<string, number> = { user: 0, admin: 1, owner: 2 };

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
        private readonly cacheInvalidator?: CacheInvalidationService,
        private readonly subscriptionGuard?: SubscriptionGuardService
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

        await this.subscriptionGuard?.assertTeamInviteCapacity(organizationId, authUserId);

        const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
        if (!organization) throw new OrganizationNotFoundError(organizationId);
        const secret = (config.auth as { inviteTokenSecret?: string })?.inviteTokenSecret ?? "";
        const token = signInviteToken(
            { email: params.email, organizationId, workspaceRole: params.workspaceRole },
            secret
        );
        const frontendUrl = (config.server as { frontendDomainUrl?: string })?.frontendDomainUrl ?? "";
        const inviteUrl = `${frontendUrl}/join-org?token=${encodeURIComponent(token)}`;
        const expiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_MS).toISOString();
        if (params.sendEmail && this.emailService?.isEnabled) {
            try {
                await this.emailService.send(
                    new OrganizationInviteEmailTemplate(
                        inviteUrl,
                        organization.name,
                        params.workspaceRole,
                        INVITE_TOKEN_TTL_HOURS
                    ),
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
        await this.subscriptionGuard?.assertWorkspaceHasSeatForNewMember(
            payload.organizationId,
            authUserId
        );
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

    /** Validate invite token without consuming; returns org name, role, and invitee email for UI. */
    async validateInviteToken(token: string): Promise<
        | { valid: true; organizationName: string; workspaceRole: string; inviteeEmail: string }
        | { valid: false; reason: InviteTokenInvalidReason | "organization_not_found" }
    > {
        const secret = (config.auth as { inviteTokenSecret?: string })?.inviteTokenSecret ?? "";
        const decoded = decodeInviteToken(token, secret);
        if (!decoded.ok) return { valid: false, reason: decoded.reason };
        const payload = decoded.payload;
        const { organization } = await this.organizationRepository.findOrganizationById(payload.organizationId);
        if (!organization) return { valid: false, reason: "organization_not_found" };
        return {
            valid: true,
            organizationName: organization.name,
            workspaceRole: payload.workspaceRole,
            inviteeEmail: payload.email,
        };
    }

    /** List pending invites sent from a workspace (workspace owner only). */
    async listSentInvitesForOrganization(
        authUserId: string,
        organizationId: string
    ): Promise<OrganizationInviteLike[]> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        this.assertWorkspaceOwner(membership, organizationId);
        const { invites } = await this.organizationRepository.findPendingInvitesByOrganization(
            organizationId
        );
        return invites;
    }

    /** Cancel a pending invite sent from a workspace (workspace owner only). */
    async cancelSentInvite(
        authUserId: string,
        organizationId: string,
        inviteId: string
    ): Promise<void> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        this.assertWorkspaceOwner(membership, organizationId);
        const { invite } = await this.organizationRepository.findInviteById(inviteId);
        if (!invite || invite.organization_id !== organizationId) {
            throw new OrganizationForbiddenError("Invite not found or already cancelled");
        }
        const now = new Date().toISOString();
        if (invite.expires_at <= now) {
            await this.organizationRepository.deleteInvite(inviteId);
            return;
        }
        const { error } = await this.organizationRepository.deleteInvite(inviteId);
        if (error) throw error as Error;
    }

    /** List pending workspace invites for the current user (by email). Returns row shape; controller maps to DTO. */
    async listPendingInvitesForUser(authUserId: string): Promise<PendingInviteViewLike[]> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
        const email = userData?.email?.trim();
        if (!email) return [];
        const { invites } = await this.organizationRepository.findPendingInvitesByEmail(email);
        const result: PendingInviteViewLike[] = [];
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
        await this.subscriptionGuard?.assertWorkspaceHasSeatForNewMember(
            invite.organization_id,
            authUserId
        );
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

    private assertWorkspaceOwner(
        membership: { role: string; disabled: boolean } | null,
        organizationId: string
    ): void {
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        if (membership.role !== "owner") {
            throw new OrganizationForbiddenError("Only workspace owners can manage sent invitations");
        }
    }

    /** List organizations for the authenticated user. Returns aggregate; controller maps to DTO. */
    async listMyOrganizations(authUserId: string): Promise<{
        organizations: OrganizationLike[];
        memberships: { organizationId: string; role: string; disabled: boolean }[];
        memberCounts: Record<string, number>;
    }> {
        const cacheKey = `${CACHE_KEYS.ORG_LIST_BYUSERID}:${authUserId}`;
        const factory = async (): Promise<{
            organizations: OrganizationLike[];
            memberships: { organizationId: string; role: string; disabled: boolean }[];
            memberCounts: Record<string, number>;
        }> => {
            const userId = await this.resolveAuthUserToUserId(authUserId);
            const { organizations, memberships } =
                await this.organizationRepository.findOrganizationsByUserId(userId);

            // Backfill missing programmatic API keys (legacy orgs created before api_key generation existed).
            // Safe: caller is already a member of these orgs.
            const patched: OrganizationLike[] = [];
            for (const org of organizations) {
                if (org.api_key == null) {
                    try {
                        const updated = await this.organizationRepository.ensureApiKeyForOrganization(org.id);
                        patched.push(updated ?? org);
                        continue;
                    } catch {
                        patched.push(org);
                        continue;
                    }
                }
                patched.push(org);
            }

            const orgIds = organizations.map((o) => o.id);
            const memberCounts = await this.organizationRepository.getMemberCounts(orgIds);
            return { organizations: patched, memberships, memberCounts };
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, ORG_CACHE_TTL_SEC);
        }
        return factory();
    }

    /** Get one organization by id; caller must be a member. Returns aggregate or null; controller maps to DTO. */
    async getOrganizationById(authUserId: string, organizationId: string): Promise<{
        organization: OrganizationLike;
        membership: { role: string; disabled: boolean };
        memberCount: number;
    } | null> {
        const cacheKey = `${CACHE_KEYS.ORG_BY_IDS}:${authUserId}:${organizationId}`;
        const factory = async (): Promise<{
            organization: OrganizationLike;
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

    /** Create organization and add the current user as owner. Returns row; controller maps to DTO. */
    async createOrganization(
        authUserId: string,
        params: { name: string; description?: string | null }
    ): Promise<OrganizationLike> {
        await this.subscriptionGuard?.assert(SubscriptionSection.WORKSPACES, {
            scope: "account",
            authUserId,
        });
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { organization, error } = await this.organizationRepository.createOrganization({
            ...params,
            userId,
        });
        if (error) throw error as Error;
        await this._invalidateOrganizationRelatedCaches({ authUserId });
        return organization;
    }

    /** True when the email has at least one non-expired workspace invite (join-by-link / pending invite row). */
    async hasPendingWorkspaceInviteForEmail(email: string): Promise<boolean> {
        const normalized = email?.trim();
        if (!normalized) return false;
        const { invites } = await this.organizationRepository.findPendingInvitesByEmail(normalized);
        return invites.length > 0;
    }

    /**
     * Create a default organization for a newly registered user (createOrgAndUser-style).
     * Used at signup so the user has one org and is owner.
     * Returns the created org row or null on failure or skip (caller should not fail signup).
     */
    async createDefaultOrganizationForNewUser(
        authUserId: string,
        params?: { name?: string; email?: string }
    ): Promise<OrganizationLike | null> {
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

    /** Update organization; requires admin or owner. Returns row; controller maps to DTO. */
    async updateOrganization(
        authUserId: string,
        organizationId: string,
        params: { name?: string; description?: string | null }
    ): Promise<OrganizationLike> {
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
        (UserOrganizationLike & { email: string | null; full_name: string | null })[]
    > {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        const { members } = await this.organizationRepository.getTeam(organizationId);
        return members;
    }

    /** Add a team member; requires admin or owner. Returns added member row; controller maps to DTO. */
    async addTeamMember(
        authUserId: string,
        organizationId: string,
        params: { userId: string; workspaceRole: WorkspaceMembershipRole }
    ): Promise<UserOrganizationLike & { email: string | null; full_name: string | null }> {
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

    /** Remove a team member; requires admin/owner (and cannot remove higher role) or self-remove. */
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

    /** Delete organization; requires owner. */
    async deleteOrganization(authUserId: string, organizationId: string): Promise<void> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        if (membership.role !== "owner") {
            throw new OrganizationForbiddenError("Only the organization owner can delete it");
        }
        const { error } = await this.organizationRepository.deleteOrganization(organizationId);
        if (error) throw error as Error;
        await this._invalidateOrganizationRelatedCaches({ authUserId, organizationId });
    }

    /** Rotate API key; requires admin or owner. Returns row; controller maps to DTO. */
    async rotateApiKey(authUserId: string, organizationId: string): Promise<OrganizationLike> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) {
            throw new OrganizationNotFoundError(organizationId);
        }
        if (this.getRoleLevel(membership.role) < 1) {
            throw new OrganizationForbiddenError("Only admins can rotate the API key");
        }
        const membershipRole = membership.role as WorkspaceMembershipRole;
        await this.subscriptionGuard?.assert(SubscriptionSection.PUBLIC_API, {
            scope: "workspace",
            organizationId,
            authUserId,
            workspaceRole: membershipRole,
        });
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
