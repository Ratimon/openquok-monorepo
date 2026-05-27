import {
    isUnlimitedPlanCap,
    planLimitForSection,
    planLimitsForTier,
    pricing,
    type SubscriptionTier,
    SubscriptionSection,
} from "openquok-common";
import { SubscriptionError } from "../../errors/SubscriptionError";
import { config } from "../../config/GlobalConfig";
import type { SubscriptionService } from "../../services/SubscriptionService";
import type { OrganizationSubscriptionRow } from "../../repositories/SubscriptionRepository";
import type { IntegrationService } from "../../services/IntegrationService";
import type { OrganizationRepository } from "../../repositories/OrganizationRepository";
import type { PostsRepository } from "../../repositories/PostsRepository";
import { resolveSessionChannelsPerWorkspace } from "../../utils/dtos/UserMeDTO";
import {
    GUARD_REGISTRY,
    TEAM_INVITE_DENIED_MESSAGE,
    TEAM_MEMBER_CAP_DENIED_MESSAGE,
} from "./guardRegistry";
import { computePostsBillingMonthStart } from "./postsBilling";
import type {
    SubscriptionGuardContext,
    WorkspaceMembershipRole,
} from "./types";

export { computePostsBillingMonthStart } from "./postsBilling";
export type { WorkspaceMembershipRole } from "./types";

export class SubscriptionGuardService {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly integrationService: IntegrationService,
        private readonly organizationRepository: OrganizationRepository,
        private readonly postsRepository: PostsRepository
    ) {}

    private billingUrl(): string {
        const frontend = (config.server as { frontendDomainUrl?: string }).frontendDomainUrl ?? "";
        return `${frontend.replace(/\/+$/, "")}/account/billing`;
    }

    async getTierAndLimits(
        organizationId: string,
        authUserId?: string
    ): Promise<{
        tier: SubscriptionTier;
        limits: (typeof pricing)[SubscriptionTier];
        subscription: OrganizationSubscriptionRow | null;
    }> {
        const subscription = await this.subscriptionService.getEffectiveSubscription(
            organizationId,
            authUserId
        );
        const tier = this.subscriptionService.resolveTier(subscription);
        return {
            tier,
            limits: planLimitsForTier(tier),
            subscription,
        };
    }

    /**
     * Single entry point for plan capability checks.
     * When Stripe billing is not configured, all checks pass (local/dev).
     */
    async assert(section: SubscriptionSection, ctx: SubscriptionGuardContext): Promise<void> {
        if (!this.subscriptionService.billingEnabled()) return;

        const entry = GUARD_REGISTRY[section];
        if (!entry) return;

        switch (entry.kind) {
            case "role":
                return this.assertAdminRole(section, ctx);
            case "boolean":
                return this.assertWorkspaceBoolean(section, ctx);
            case "account_boolean":
                return this.assertAccountBoolean(section, ctx);
            case "account_quota":
                return this.assertAccountWorkspaceQuota(section, ctx);
            case "usage_bytes":
                return this.assertMediaStorage(section, ctx);
            case "quota":
                return this.assertQuota(section, ctx);
            case "share_post_preview":
                return this.assertSharePostPreview(ctx);
            default:
                return;
        }
    }

    private requireWorkspaceContext(
        ctx: SubscriptionGuardContext
    ): Extract<SubscriptionGuardContext, { organizationId: string }> {
        if (ctx.scope === "account") {
            throw new Error(`Workspace context required for ${ctx.scope}`);
        }
        return ctx;
    }

    private async assertAdminRole(section: SubscriptionSection, ctx: SubscriptionGuardContext): Promise<void> {
        const workspaceCtx = this.requireWorkspaceContext(ctx);
        const role = workspaceCtx.workspaceRole;
        if (role !== "admin" && role !== "owner") {
            throw new SubscriptionError(GUARD_REGISTRY[section].deniedMessage, section, this.billingUrl());
        }
    }

    private async assertWorkspaceBoolean(
        section: SubscriptionSection,
        ctx: SubscriptionGuardContext
    ): Promise<void> {
        const workspaceCtx = this.requireWorkspaceContext(ctx);
        const { limits } = await this.getTierAndLimits(
            workspaceCtx.organizationId,
            workspaceCtx.authUserId
        );
        const cap = planLimitForSection(limits, section);
        if (typeof cap === "boolean" && !cap) {
            throw new SubscriptionError(GUARD_REGISTRY[section].deniedMessage, section, this.billingUrl());
        }
        if (section === SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE) {
            const seatCap = limits.team_members_per_workspace;
            if (seatCap < 1) {
                throw new SubscriptionError(GUARD_REGISTRY[section].deniedMessage, section, this.billingUrl());
            }
        }
    }

    private async assertAccountBoolean(
        section: SubscriptionSection,
        ctx: SubscriptionGuardContext
    ): Promise<void> {
        if (ctx.scope !== "account") {
            const workspaceCtx = this.requireWorkspaceContext(ctx);
            const { limits } = await this.getTierAndLimits(
                workspaceCtx.organizationId,
                workspaceCtx.authUserId
            );
            const cap = planLimitForSection(limits, section);
            if (typeof cap === "boolean" && !cap) {
                throw new SubscriptionError(GUARD_REGISTRY[section].deniedMessage, section, this.billingUrl());
            }
            return;
        }

        const owned = await this.subscriptionService.getOwnedAccountSubscription(ctx.authUserId);
        const viewerTier = owned?.subscription_tier ?? "FREE";
        if (!planLimitsForTier(viewerTier).community_features) {
            throw new SubscriptionError(GUARD_REGISTRY[section].deniedMessage, section, this.billingUrl());
        }
    }

    private async assertAccountWorkspaceQuota(
        section: SubscriptionSection,
        ctx: SubscriptionGuardContext
    ): Promise<void> {
        if (ctx.scope !== "account") return;
        const authUserId = ctx.authUserId;

        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) return;

        const { organizations, memberships } =
            await this.organizationRepository.findOrganizationsByUserId(userId);
        const ownedOrganizationIds = new Set(
            memberships
                .filter((m) => (m.role ?? "").toLowerCase() === "owner")
                .map((m) => m.organizationId)
        );
        const ownedCount = organizations.filter((org) => ownedOrganizationIds.has(org.id)).length;

        const ownedSubscription =
            await this.subscriptionService.getOwnedAccountSubscription(authUserId);
        const workspaceCap = this.subscriptionService.resolveOwnedWorkspaceCap(ownedSubscription);

        if (ownedCount >= workspaceCap) {
            throw new SubscriptionError(
                workspaceCap === 1
                    ? "Your plan includes one workspace. Upgrade to add more."
                    : `Your plan allows up to ${workspaceCap} workspaces. Upgrade to add more.`,
                section,
                this.billingUrl()
            );
        }
    }

    private async assertMediaStorage(
        section: SubscriptionSection,
        ctx: SubscriptionGuardContext
    ): Promise<void> {
        const workspaceCtx = this.requireWorkspaceContext(ctx);
        const additionalBytes =
            workspaceCtx.scope === "workspace" ? (workspaceCtx.additionalBytes ?? 0) : 0;

        if (additionalBytes > 0) {
            const { used, total } = await this.subscriptionService.getWorkspaceDriveUsage(
                workspaceCtx.organizationId,
                workspaceCtx.authUserId
            );
            if (used + additionalBytes > total) {
                throw new SubscriptionError(
                    GUARD_REGISTRY[section].deniedMessage,
                    section,
                    this.billingUrl()
                );
            }
            return;
        }

        const drive = await this.subscriptionService.getWorkspaceDriveUsage(
            workspaceCtx.organizationId,
            workspaceCtx.authUserId
        );
        if (drive.used >= drive.total) {
            throw new SubscriptionError(GUARD_REGISTRY[section].deniedMessage, section, this.billingUrl());
        }
    }

    private async assertQuota(section: SubscriptionSection, ctx: SubscriptionGuardContext): Promise<void> {
        if (section === SubscriptionSection.POSTS_PER_MONTH) {
            return this.assertPostsPerMonth(ctx);
        }
        if (section === SubscriptionSection.CHANNEL_PER_WORKSPACE) {
            return this.assertConnectSocialChannel(ctx);
        }
    }

    private postsBillingPeriodStart(
        subscription: OrganizationSubscriptionRow | null,
        organizationCreatedAt: string
    ): Date {
        return computePostsBillingMonthStart({ subscription, organizationCreatedAt });
    }

    private async assertPostsPerMonth(ctx: SubscriptionGuardContext): Promise<void> {
        const workspaceCtx = this.requireWorkspaceContext(ctx);
        const rowsToAdd =
            workspaceCtx.scope === "workspaceWithDelta"
                ? workspaceCtx.delta
                : workspaceCtx.scope === "workspace"
                  ? (workspaceCtx.delta ?? 1)
                  : 1;
        if (rowsToAdd < 1) return;

        const { limits, subscription } = await this.getTierAndLimits(
            workspaceCtx.organizationId,
            workspaceCtx.authUserId
        );
        const cap = limits.posts_per_month;
        if (isUnlimitedPlanCap(cap, SubscriptionSection.POSTS_PER_MONTH)) return;

        if (cap < 1) {
            throw new SubscriptionError(
                "Scheduled posts are not included on your current plan.",
                SubscriptionSection.POSTS_PER_MONTH,
                this.billingUrl()
            );
        }

        const { organization } = await this.organizationRepository.findOrganizationById(
            workspaceCtx.organizationId
        );
        const periodStart = this.postsBillingPeriodStart(
            subscription,
            organization?.created_at ?? new Date().toISOString()
        );
        const count = await this.postsRepository.countPostsFromDay(
            workspaceCtx.organizationId,
            periodStart
        );

        if (count + rowsToAdd > cap) {
            throw new SubscriptionError(
                `Your plan allows up to ${cap} scheduled posts per billing month. Upgrade to schedule more.`,
                SubscriptionSection.POSTS_PER_MONTH,
                this.billingUrl()
            );
        }
    }

    private async assertConnectSocialChannel(ctx: SubscriptionGuardContext): Promise<void> {
        const workspaceCtx = this.requireWorkspaceContext(ctx);
        const reconnectInternalId =
            workspaceCtx.scope === "workspaceWithReconnect"
                ? workspaceCtx.reconnectInternalId
                : "";

        const { tier, limits, subscription } = await this.getTierAndLimits(
            workspaceCtx.organizationId,
            workspaceCtx.authUserId
        );
        const cap = resolveSessionChannelsPerWorkspace(
            this.subscriptionService.billingEnabled(),
            tier,
            limits,
            subscription
        );
        if (cap < 1) {
            throw new SubscriptionError(
                "Social channels are not included on your current plan.",
                SubscriptionSection.CHANNEL_PER_WORKSPACE,
                this.billingUrl()
            );
        }

        const channels = await this.integrationService.listByOrganization(workspaceCtx.organizationId);
        const isReconnect = reconnectInternalId
            ? channels.some((c) => c.internal_id === reconnectInternalId)
            : false;
        if (isReconnect) return;

        if (channels.length >= cap) {
            throw new SubscriptionError(
                `Your plan allows up to ${cap} connected channels per workspace. Disconnect a channel or upgrade to add more.`,
                SubscriptionSection.CHANNEL_PER_WORKSPACE,
                this.billingUrl()
            );
        }
    }

    private async assertSharePostPreview(ctx: SubscriptionGuardContext): Promise<void> {
        const workspaceCtx = this.requireWorkspaceContext(ctx);
        const organizationId = workspaceCtx.organizationId;

        const tier = await this.subscriptionService.resolveOrganizationPlanTier(organizationId);
        if (!planLimitsForTier(tier).share_post_preview) {
            throw new SubscriptionError(
                "Shareable post previews are not included on this workspace's plan.",
                SubscriptionSection.SHARE_POST_PREVIEW,
                this.billingUrl()
            );
        }

        const authUserId = workspaceCtx.authUserId?.trim();
        if (authUserId) {
            const owned = await this.subscriptionService.getOwnedAccountSubscription(authUserId);
            const viewerTier = owned?.subscription_tier ?? "FREE";
            if (!planLimitsForTier(viewerTier).share_post_preview) {
                throw new SubscriptionError(
                    "Collaboration comments are not included on your current plan.",
                    SubscriptionSection.SHARE_POST_PREVIEW,
                    this.billingUrl()
                );
            }
        }
    }

    async getPostsPerMonthUsage(
        organizationId: string,
        authUserId?: string
    ): Promise<{ used: number; limit: number | null }> {
        if (!this.subscriptionService.billingEnabled()) {
            return { used: 0, limit: null };
        }

        const { limits, subscription } = await this.getTierAndLimits(organizationId, authUserId);
        const cap = limits.posts_per_month;
        if (isUnlimitedPlanCap(cap, SubscriptionSection.POSTS_PER_MONTH)) {
            return { used: 0, limit: null };
        }

        if (cap < 1) {
            return { used: 0, limit: 0 };
        }

        const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
        const periodStart = this.postsBillingPeriodStart(
            subscription,
            organization?.created_at ?? new Date().toISOString()
        );
        const used = await this.postsRepository.countPostsFromDay(organizationId, periodStart);
        return { used, limit: cap };
    }

    async getTeamMembersPerWorkspaceUsage(
        organizationId: string,
        authUserId?: string
    ): Promise<{ used: number; limit: number | null }> {
        if (!this.subscriptionService.billingEnabled()) {
            return { used: 0, limit: null };
        }

        const { limits } = await this.getTierAndLimits(organizationId, authUserId);
        const cap = limits.team_members_per_workspace;
        if (isUnlimitedPlanCap(cap, SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE)) {
            return { used: 0, limit: null };
        }

        if (cap < 1) {
            return { used: 0, limit: 0 };
        }

        const [memberCounts, pendingInvites] = await Promise.all([
            this.organizationRepository.getMemberCounts([organizationId]),
            this.organizationRepository.countPendingInvitesByOrganization(organizationId),
        ]);
        const members = memberCounts[organizationId] ?? 0;
        return { used: members + pendingInvites, limit: cap };
    }

    async isSharePostPreviewEnabledForOrganization(organizationId: string): Promise<boolean> {
        const tier = await this.subscriptionService.resolveOrganizationPlanTier(organizationId);
        return planLimitsForTier(tier).share_post_preview;
    }

    async isCollaborationCommentsEnabledForOrganization(
        organizationId: string,
        authUserId: string
    ): Promise<boolean> {
        if (!(await this.isSharePostPreviewEnabledForOrganization(organizationId))) {
            return false;
        }
        const owned = await this.subscriptionService.getOwnedAccountSubscription(authUserId);
        const viewerTier = owned?.subscription_tier ?? "FREE";
        return planLimitsForTier(viewerTier).share_post_preview;
    }

    async isCommunityFeaturesEnabledForAuthUser(authUserId: string): Promise<boolean> {
        const owned = await this.subscriptionService.getOwnedAccountSubscription(authUserId);
        const viewerTier = owned?.subscription_tier ?? "FREE";
        return planLimitsForTier(viewerTier).community_features;
    }

    async assertTeamInviteCapacity(organizationId: string, authUserId?: string): Promise<void> {
        if (!this.subscriptionService.billingEnabled()) return;

        const { limits } = await this.getTierAndLimits(organizationId, authUserId);
        const cap = limits.team_members_per_workspace;
        if (cap < 1) {
            throw new SubscriptionError(
                GUARD_REGISTRY[SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE].deniedMessage,
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }
        if (isUnlimitedPlanCap(cap, SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE)) return;

        const [memberCounts, pendingInvites] = await Promise.all([
            this.organizationRepository.getMemberCounts([organizationId]),
            this.organizationRepository.countPendingInvitesByOrganization(organizationId),
        ]);
        const members = memberCounts[organizationId] ?? 0;
        if (members + pendingInvites >= cap) {
            throw new SubscriptionError(
                TEAM_INVITE_DENIED_MESSAGE,
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }
    }

    async assertWorkspaceHasSeatForNewMember(
        organizationId: string,
        authUserId?: string
    ): Promise<void> {
        if (!this.subscriptionService.billingEnabled()) return;

        const { limits } = await this.getTierAndLimits(organizationId, authUserId);
        const cap = limits.team_members_per_workspace;
        if (cap < 1) {
            throw new SubscriptionError(
                GUARD_REGISTRY[SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE].deniedMessage,
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }
        if (isUnlimitedPlanCap(cap, SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE)) return;

        const memberCounts = await this.organizationRepository.getMemberCounts([organizationId]);
        const members = memberCounts[organizationId] ?? 0;
        if (members >= cap) {
            throw new SubscriptionError(
                TEAM_MEMBER_CAP_DENIED_MESSAGE,
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }
    }

    async assertMediaStorageAvailable(
        organizationId: string,
        additionalBytes: number,
        authUserId?: string
    ): Promise<void> {
        await this.assert(SubscriptionSection.MEDIA_STORAGE_BYTES_PER_WORKSPACE, {
            scope: "workspace",
            organizationId,
            authUserId,
            additionalBytes,
        });
    }

    async assertPolicies(
        organizationId: string,
        workspaceRole: WorkspaceMembershipRole,
        policies: import("openquok-common").SubscriptionPolicy[],
        authUserId?: string
    ): Promise<void> {
        if (policies.length === 0) return;
        if (!this.subscriptionService.billingEnabled()) return;

        for (const [, section] of policies) {
            if (
                section === SubscriptionSection.CHANNEL_PER_WORKSPACE ||
                section === SubscriptionSection.POSTS_PER_MONTH ||
                section === SubscriptionSection.WORKSPACES
            ) {
                continue;
            }

            await this.assert(section, {
                scope: "workspace",
                organizationId,
                authUserId,
                workspaceRole,
            });
        }
    }
}
