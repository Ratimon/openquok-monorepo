import type { SubscriptionPolicy, SubscriptionTier } from "openquok-common";
import { pricing } from "openquok-common";
import type { OrganizationSubscriptionRow } from "../repositories/SubscriptionRepository";
import type { SubscriptionGuardService, WorkspaceMembershipRole } from "../subscription/SubscriptionGuardService";

export { computePostsBillingMonthStart } from "../subscription/postsBilling";
export type { WorkspaceMembershipRole } from "../subscription/SubscriptionGuardService";

/**
 * Facade over {@link SubscriptionGuardService} for legacy call sites.
 * Prefer `subscriptionGuard.assert(SubscriptionSection, ctx)` for new enforcement.
 */
export class PermissionsService {
    constructor(private readonly subscriptionGuard: SubscriptionGuardService) {}

    async getTierAndLimits(
        organizationId: string,
        authUserId?: string
    ): Promise<{
        tier: SubscriptionTier;
        limits: (typeof pricing)[SubscriptionTier];
        subscription: OrganizationSubscriptionRow | null;
    }> {
        return this.subscriptionGuard.getTierAndLimits(organizationId, authUserId);
    }

    /** @deprecated Use `subscriptionGuard.assert` with the matching {@link SubscriptionSection}. */
    async assertPolicies(
        organizationId: string,
        workspaceRole: WorkspaceMembershipRole,
        policies: SubscriptionPolicy[],
        authUserId?: string
    ): Promise<void> {
        return this.subscriptionGuard.assertPolicies(
            organizationId,
            workspaceRole,
            policies,
            authUserId
        );
    }

    /** @deprecated Use `subscriptionGuard.assert(SubscriptionSection.POSTS_PER_MONTH, …)`. */
    async assertPostsPerMonthAllowed(
        organizationId: string,
        rowsToAdd = 1,
        authUserId?: string
    ): Promise<void> {
        return this.subscriptionGuard.assertPostsPerMonthAllowed(
            organizationId,
            rowsToAdd,
            authUserId
        );
    }

    async getPostsPerMonthUsage(
        organizationId: string,
        authUserId?: string
    ): Promise<{ used: number; limit: number | null }> {
        return this.subscriptionGuard.getPostsPerMonthUsage(organizationId, authUserId);
    }

    async getTeamMembersPerWorkspaceUsage(
        organizationId: string,
        authUserId?: string
    ): Promise<{ used: number; limit: number | null }> {
        return this.subscriptionGuard.getTeamMembersPerWorkspaceUsage(organizationId, authUserId);
    }

    async isSharePostPreviewEnabledForOrganization(organizationId: string): Promise<boolean> {
        return this.subscriptionGuard.isSharePostPreviewEnabledForOrganization(organizationId);
    }

    async isCollaborationCommentsEnabledForOrganization(
        organizationId: string,
        authUserId: string
    ): Promise<boolean> {
        return this.subscriptionGuard.isCollaborationCommentsEnabledForOrganization(
            organizationId,
            authUserId
        );
    }

    async isCommunityFeaturesEnabledForAuthUser(authUserId: string): Promise<boolean> {
        return this.subscriptionGuard.isCommunityFeaturesEnabledForAuthUser(authUserId);
    }

    /** @deprecated Use `subscriptionGuard.assert(SubscriptionSection.COMMUNITY_FEATURES, { scope: 'account', authUserId })`. */
    async assertCommunityFeaturesAllowed(authUserId: string): Promise<void> {
        return this.subscriptionGuard.assertCommunityFeaturesAllowed(authUserId);
    }

    /** @deprecated Use `subscriptionGuard.assert(SubscriptionSection.SHARE_POST_PREVIEW, …)`. */
    async assertSharePostPreviewAllowed(organizationId: string, authUserId?: string): Promise<void> {
        return this.subscriptionGuard.assertSharePostPreviewAllowed(organizationId, authUserId);
    }

    async assertTeamInviteCapacity(organizationId: string, authUserId?: string): Promise<void> {
        return this.subscriptionGuard.assertTeamInviteCapacity(organizationId, authUserId);
    }

    async assertWorkspaceHasSeatForNewMember(
        organizationId: string,
        authUserId?: string
    ): Promise<void> {
        return this.subscriptionGuard.assertWorkspaceHasSeatForNewMember(organizationId, authUserId);
    }

    /** @deprecated Use `subscriptionGuard.assert(SubscriptionSection.WORKSPACES, { scope: 'account', authUserId })`. */
    async assertCanCreateWorkspace(authUserId: string): Promise<void> {
        return this.subscriptionGuard.assertCanCreateWorkspace(authUserId);
    }

    /** @deprecated Use `subscriptionGuard.assert(SubscriptionSection.CHANNEL_PER_WORKSPACE, …)`. */
    async assertConnectSocialChannelAllowed(
        organizationId: string,
        newAccountInternalId: string,
        authUserId?: string
    ): Promise<void> {
        return this.subscriptionGuard.assertConnectSocialChannelAllowed(
            organizationId,
            newAccountInternalId,
            authUserId
        );
    }
}
