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
import { SubscriptionError } from "../errors/SubscriptionError";
import { SubscriptionSection } from "openquok-common";

export interface WorkspaceDriveUsage {
    used: number;
    total: number;
    tier: SubscriptionTier;
}

export class SubscriptionService {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly mediaRepository: MediaRepository,
        private readonly organizationRepository: OrganizationRepository
    ) {}

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
     * Resolves the paid subscription that applies to a workspace.
     * When the workspace has no row, inherits from another workspace on the same billing account
     * (all non-disabled memberships for the user), if the account is within the plan workspace cap.
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

        const { organizations } = await this.organizationRepository.findOrganizationsByUserId(userId);
        if (!organizations.some((org) => org.id === organizationId)) return null;

        let best: OrganizationSubscriptionRow | null = null;
        let bestWorkspaceCap = -1;

        for (const org of organizations) {
            const sub = await this.subscriptionRepository.getSubscriptionByOrganizationId(org.id);
            if (!sub) continue;
            const cap = planLimitsForTier(sub.subscription_tier).workspaces;
            if (cap > bestWorkspaceCap) {
                bestWorkspaceCap = cap;
                best = sub;
            }
        }

        if (!best || bestWorkspaceCap < 1) return null;
        if (organizations.length > bestWorkspaceCap) return null;

        return best;
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

    getPlanLimitsForOrganization(
        subscription: OrganizationSubscriptionRow | null
    ): (typeof pricing)[SubscriptionTier] {
        return planLimitsForTier(this.resolveTier(subscription));
    }

    async getMediaStorageQuotaBytes(
        organizationId: string,
        authUserId?: string
    ): Promise<number> {
        const subscription = await this.getEffectiveSubscription(organizationId, authUserId);
        return this.getPlanLimitsForOrganization(subscription).media_storage_bytes_per_workspace;
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
        const { used, total } = await this.getWorkspaceDriveUsage(organizationId, authUserId);
        if (used + additionalBytes > total) {
            const frontend = (config.server as { frontendDomainUrl?: string }).frontendDomainUrl ?? "";
            throw new SubscriptionError(
                "Workspace media storage limit reached. Upgrade your plan or delete files.",
                SubscriptionSection.MEDIA_STORAGE_BYTES_PER_WORKSPACE,
                `${frontend.replace(/\/+$/, "")}/account/billing`
            );
        }
    }

    async createOrUpdateFromStripe(params: {
        organizationId: string;
        isTrialing: boolean;
        identifier: string;
        subscriptionTier: PaidSubscriptionTier;
        period: SubscriptionPeriod;
        channelsPerWorkspace: number;
        cancelAt: string | null;
    }): Promise<OrganizationSubscriptionRow> {
        return this.subscriptionRepository.createOrUpdateSubscription({
            organizationId: params.organizationId,
            isTrialing: params.isTrialing,
            identifier: params.identifier,
            subscriptionTier: params.subscriptionTier,
            period: params.period,
            channelsPerWorkspace: params.channelsPerWorkspace,
            cancelAt: params.cancelAt,
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
