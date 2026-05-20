import {
    planLimitsForTier,
    pricing,
    type SubscriptionPolicy,
    SubscriptionSection,
    type SubscriptionTier,
} from "openquok-common";
import { SubscriptionError } from "../errors/SubscriptionError";
import { config } from "../config/GlobalConfig";
import type { SubscriptionService } from "./SubscriptionService";
import type { OrganizationSubscriptionRow } from "../repositories/SubscriptionRepository";

export type WorkspaceMembershipRole = "user" | "admin" | "superadmin";

export class PermissionsService {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    private billingUrl(): string {
        const frontend = (config.server as { frontendDomainUrl?: string }).frontendDomainUrl ?? "";
        return `${frontend.replace(/\/+$/, "")}/account/billing`;
    }

    async getTierAndLimits(organizationId: string): Promise<{
        tier: SubscriptionTier;
        limits: (typeof pricing)[SubscriptionTier];
        subscription: OrganizationSubscriptionRow | null;
    }> {
        const subscription = await this.subscriptionService.getSubscriptionByOrganizationId(
            organizationId
        );
        const tier = this.subscriptionService.resolveTier(subscription);
        return {
            tier,
            limits: planLimitsForTier(tier),
            subscription,
        };
    }

    /**
     * Enforces subscription limits for the requested policies.
     * When Stripe billing is not configured, all policies pass (local/dev).
     */
    async assertPolicies(
        organizationId: string,
        workspaceRole: WorkspaceMembershipRole,
        policies: SubscriptionPolicy[]
    ): Promise<void> {
        if (policies.length === 0) return;
        if (!this.subscriptionService.billingEnabled()) return;

        const { limits } = await this.getTierAndLimits(organizationId);

        for (const [, section] of policies) {
            if (section === SubscriptionSection.ADMIN) {
                if (workspaceRole !== "admin" && workspaceRole !== "superadmin") {
                    throw new SubscriptionError(
                        "Workspace admin access is required.",
                        section,
                        this.billingUrl()
                    );
                }
                continue;
            }

            if (section === SubscriptionSection.MEDIA_STORAGE_BYTES_PER_WORKSPACE) {
                const drive = await this.subscriptionService.getWorkspaceDriveUsage(organizationId);
                if (drive.used >= drive.total) {
                    throw new SubscriptionError(
                        "Workspace media storage limit reached. Upgrade your plan or delete files.",
                        section,
                        this.billingUrl()
                    );
                }
                continue;
            }

            if (
                section === SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE &&
                limits.team_members_per_workspace < 1
            ) {
                throw new SubscriptionError(
                    "Team members are not included on your current plan.",
                    section,
                    this.billingUrl()
                );
            }

            if (section === SubscriptionSection.SHARE_POST_PREVIEW && !limits.share_post_preview) {
                throw new SubscriptionError(
                    "Shareable post previews are not included on your current plan.",
                    section,
                    this.billingUrl()
                );
            }

            if (section === SubscriptionSection.PUBLIC_API && !limits.public_api) {
                throw new SubscriptionError(
                    "Public API access is not included on your current plan.",
                    section,
                    this.billingUrl()
                );
            }

            // CHANNEL_PER_WORKSPACE, POSTS_PER_MONTH, WORKSPACES: enforced at call sites with counts when wired in.
        }
    }
}
