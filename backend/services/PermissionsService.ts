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
import type { IntegrationService } from "./IntegrationService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";

export type WorkspaceMembershipRole = "user" | "admin" | "superadmin";

export class PermissionsService {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly integrationService: IntegrationService,
        private readonly organizationRepository: OrganizationRepository
    ) {}

    private billingUrl(): string {
        const frontend = (config.server as { frontendDomainUrl?: string }).frontendDomainUrl ?? "";
        return `${frontend.replace(/\/+$/, "")}/account/billing`;
    }

    async getTierAndLimits(organizationId: string): Promise<{
        tier: SubscriptionTier;
        limits: (typeof pricing)[SubscriptionTier];
        subscription: OrganizationSubscriptionRow | null;
    }> {
        const subscription = await this.subscriptionService.getSubscriptionByOrganizationId(organizationId);
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

            if (section === SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE) {
                if (limits.team_members_per_workspace < 1) {
                    throw new SubscriptionError(
                        "Team members are not included on your current plan.",
                        section,
                        this.billingUrl()
                    );
                }
                continue;
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

            // CHANNEL_PER_WORKSPACE, POSTS_PER_MONTH, WORKSPACES: enforced at dedicated entry points.
        }
    }

    /** Before creating a pending email invite — members + pending invites must stay under the seat cap. */
    async assertTeamInviteCapacity(organizationId: string): Promise<void> {
        if (!this.subscriptionService.billingEnabled()) return;

        const { limits } = await this.getTierAndLimits(organizationId);
        const cap = limits.team_members_per_workspace;
        if (cap < 1) {
            throw new SubscriptionError(
                "Team members are not included on your current plan.",
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }

        const [memberCounts, pendingInvites] = await Promise.all([
            this.organizationRepository.getMemberCounts([organizationId]),
            this.organizationRepository.countPendingInvitesByOrganization(organizationId),
        ]);
        const members = memberCounts[organizationId] ?? 0;
        if (members + pendingInvites >= cap) {
            throw new SubscriptionError(
                "Your plan does not include additional workspace seats. Upgrade to invite team members.",
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }
    }

    /** Before adding a new member (invite accept / join link) — active members must be under the seat cap. */
    async assertWorkspaceHasSeatForNewMember(organizationId: string): Promise<void> {
        if (!this.subscriptionService.billingEnabled()) return;

        const { limits } = await this.getTierAndLimits(organizationId);
        const cap = limits.team_members_per_workspace;
        if (cap < 1) {
            throw new SubscriptionError(
                "Team members are not included on your current plan.",
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }

        const memberCounts = await this.organizationRepository.getMemberCounts([organizationId]);
        const members = memberCounts[organizationId] ?? 0;
        if (members >= cap) {
            throw new SubscriptionError(
                "This workspace has reached its team member limit for your current plan.",
                SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE,
                this.billingUrl()
            );
        }
    }

    /**
     * Before persisting a new social channel — respects {@link planLimitsForTier} `channel_per_workspace`.
     * Reconnecting the same provider account (same `internalId`) does not consume an extra slot.
     */
    async assertConnectSocialChannelAllowed(organizationId: string, newAccountInternalId: string): Promise<void> {
        if (!this.subscriptionService.billingEnabled()) return;

        const { limits } = await this.getTierAndLimits(organizationId);
        const cap = limits.channel_per_workspace;
        if (cap < 1) {
            throw new SubscriptionError(
                "Social channels are not included on your current plan.",
                SubscriptionSection.CHANNEL_PER_WORKSPACE,
                this.billingUrl()
            );
        }

        const channels = await this.integrationService.listByOrganization(organizationId);
        const isReconnect = channels.some((c) => c.internal_id === newAccountInternalId);
        if (isReconnect) return;

        if (channels.length >= cap) {
            throw new SubscriptionError(
                `Your plan allows up to ${cap} connected channels per workspace. Disconnect a channel or upgrade to add more.`,
                SubscriptionSection.CHANNEL_PER_WORKSPACE,
                this.billingUrl()
            );
        }
    }
}
