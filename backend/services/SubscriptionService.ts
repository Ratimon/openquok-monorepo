import {
    DEFAULT_MEDIA_STORAGE_QUOTA_BYTES,
    type PaidSubscriptionTier,
    planLimitsForTier,
    pricing,
    type SubscriptionPeriod,
    type SubscriptionTier,
} from "openquok-common";
import type { MediaRepository } from "../repositories/MediaRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type {
    OrganizationSubscriptionRow,
    SubscriptionRepository,
} from "../repositories/SubscriptionRepository";
import { config } from "../config/GlobalConfig";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";

export interface WorkspaceDriveUsage {
    used: number;
    total: number;
    tier: SubscriptionTier;
}

export class SubscriptionService {
    private subscriptionGuard?: SubscriptionGuardService;

    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly mediaRepository: MediaRepository,
        private readonly organizationRepository: OrganizationRepository
    ) {}

    /** Wired after {@link SubscriptionGuardService} is constructed (avoids circular init). */
    setSubscriptionGuard(guard: SubscriptionGuardService): void {
        this.subscriptionGuard = guard;
    }

    billingEnabled(): boolean {
        const stripe = config.stripe as { publishableKey?: string } | undefined;
        return Boolean(stripe?.publishableKey?.trim());
    }

    async getSubscriptionByOrganizationId(
        organizationId: string
    ): Promise<OrganizationSubscriptionRow | null> {
        return this.subscriptionRepository.getSubscriptionByOrganizationId(organizationId);
    }

    /**
     * Paid subscription on organizations the user owns (direct rows only, then inheritance among
     * owned workspaces within the plan workspace cap). Ignores invited/member workspaces.
     */
    async getOwnedAccountSubscription(authUserId: string): Promise<OrganizationSubscriptionRow | null> {
        if (!authUserId?.trim() || !this.billingEnabled()) return null;

        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId.trim());
        if (!userId) return null;

        const { organizations, memberships } =
            await this.organizationRepository.findOrganizationsByUserId(userId);
        const ownedOrganizationIds = new Set(
            memberships
                .filter((m) => (m.role ?? "").toLowerCase() === "owner" && !m.disabled)
                .map((m) => m.organizationId)
        );
        const ownedOrganizationsCount = memberships.filter(
            (m) => (m.role ?? "").toLowerCase() === "owner" && !m.disabled
        ).length;

        let best: OrganizationSubscriptionRow | null = null;
        let bestWorkspaceCap = -1;

        for (const org of organizations) {
            if (!ownedOrganizationIds.has(org.id)) continue;
            const sub = await this.subscriptionRepository.getSubscriptionByOrganizationId(org.id);
            if (!sub) continue;
            const cap = planLimitsForTier(sub.subscription_tier).workspaces;
            if (cap > bestWorkspaceCap) {
                bestWorkspaceCap = cap;
                best = sub;
            }
        }

        if (!best || bestWorkspaceCap < 1) return null;
        if (ownedOrganizationsCount > bestWorkspaceCap) return null;

        return best;
    }

    /**
     * How many workspaces the user may own on their billing account (not the active/shared workspace).
     * FREE / no owned subscription: one workspace (signup default). Billing disabled: CREATOR cap.
     */
    resolveOwnedWorkspaceCap(subscription: OrganizationSubscriptionRow | null): number {
        if (!this.billingEnabled()) {
            return pricing.CREATOR.workspaces;
        }
        const planCap = planLimitsForTier(this.resolveTier(subscription)).workspaces;
        if (planCap >= 1) return planCap;
        return 1;
    }

    /**
     * Resolves the paid subscription that applies to a workspace.
     * When the workspace has no row, inherits from another owned workspace on the same billing
     * account when the user is within the plan workspace cap (owned workspaces only).
     */
    async getEffectiveSubscription(
        organizationId: string,
        authUserId?: string
    ): Promise<OrganizationSubscriptionRow | null> {
        const direct = await this.subscriptionRepository.getSubscriptionByOrganizationId(organizationId);
        if (direct) return direct;
        if (!authUserId?.trim() || !this.billingEnabled()) return null;

        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId.trim());
        if (!userId) return null;

        const { organizations, memberships } = await this.organizationRepository.findOrganizationsByUserId(userId);
        if (!organizations.some((org) => org.id === organizationId)) return null;

        const ownedOrganizationIds = new Set(
            memberships
                .filter((m) => (m.role ?? "").toLowerCase() === "owner" && !m.disabled)
                .map((m) => m.organizationId)
        );
        // Only owned workspaces inherit subscription across the owner's billing account.
        if (!ownedOrganizationIds.has(organizationId)) return null;

        return this.getOwnedAccountSubscription(authUserId);
    }

    resolveTier(subscription: OrganizationSubscriptionRow | null): SubscriptionTier {
        if (subscription?.subscription_tier) {
            return subscription.subscription_tier;
        }
        if (!this.billingEnabled()) {
            return "CREATOR";
        }
        return "FREE";
    }

    /**
     * Tier for workspace-scoped share-preview features (`/p/:postId` comments, copy link).
     * Uses only this organization's subscription row (no account inheritance) so SOLO workspaces
     * stay gated even when the viewer is on a higher plan elsewhere.
     */
    async resolveOrganizationPlanTier(organizationId: string): Promise<SubscriptionTier> {
        const subscription = await this.subscriptionRepository.getSubscriptionByOrganizationId(organizationId);
        if (subscription?.subscription_tier) {
            return subscription.subscription_tier;
        }
        return "FREE";
    }

    getPlanLimitsForOrganization(
        subscription: OrganizationSubscriptionRow | null
    ): (typeof pricing)[SubscriptionTier] {
        return planLimitsForTier(this.resolveTier(subscription));
    }

    async getWorkspaceDriveUsage(
        organizationId: string,
        authUserId?: string
    ): Promise<WorkspaceDriveUsage> {
        const subscription = await this.getEffectiveSubscription(organizationId, authUserId);
        const tier = this.resolveTier(subscription);
        const total =
            planLimitsForTier(tier).media_storage_bytes_per_workspace || DEFAULT_MEDIA_STORAGE_QUOTA_BYTES;
        const items = await this.mediaRepository.listAllMedia(organizationId);
        const used = items.reduce((sum, row) => sum + (row.size ?? 0), 0);
        return {
            used,
            total: Math.max(used, total),
            tier,
        };
    }


    async assertMediaStorageAvailable(
        organizationId: string,
        additionalBytes: number,
        authUserId?: string
    ): Promise<void> {
        if (!this.subscriptionGuard) {
            throw new Error("SubscriptionGuardService is not wired on SubscriptionService");
        }
        await this.subscriptionGuard.assertMediaStorageAvailable(
            organizationId,
            additionalBytes,
            authUserId
        );
    }

    async createOrUpdateFromStripe(params: {
        organizationId: string;
        isTrialing: boolean;
        identifier: string;
        subscriptionTier: PaidSubscriptionTier;
        period: SubscriptionPeriod;
        channelsPerWorkspace: number;
        cancelAt: string | null;
        currentPeriodStart?: string | null;
        currentPeriodEnd?: string | null;
    }): Promise<OrganizationSubscriptionRow> {
        return this.subscriptionRepository.createOrUpdateSubscription({
            organizationId: params.organizationId,
            isTrialing: params.isTrialing,
            identifier: params.identifier,
            subscriptionTier: params.subscriptionTier,
            period: params.period,
            channelsPerWorkspace: params.channelsPerWorkspace,
            cancelAt: params.cancelAt,
            currentPeriodStart: params.currentPeriodStart ?? null,
            currentPeriodEnd: params.currentPeriodEnd ?? null,
        });
    }

    async deleteSubscriptionForCustomer(customerId: string): Promise<void> {
        await this.subscriptionRepository.softDeleteByStripeCustomerId(customerId);
    }

    async grantPaidSubscriptionForAdmin(params: {
        organizationId: string;
        subscriptionTier: PaidSubscriptionTier;
        period?: SubscriptionPeriod;
    }): Promise<OrganizationSubscriptionRow> {
        const limits = pricing[params.subscriptionTier];
        return this.subscriptionRepository.createOrUpdateSubscription({
            organizationId: params.organizationId,
            isTrialing: false,
            identifier: `admin-${Date.now()}`,
            subscriptionTier: params.subscriptionTier,
            period: params.period ?? "MONTHLY",
            channelsPerWorkspace: limits.channel_per_workspace,
            cancelAt: null,
        });
    }
}
