import type { UserMeWorkspaceSession } from "openquok-common";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import type { SubscriptionService } from "./SubscriptionService";
import { OrganizationForbiddenError, OrganizationNotFoundError } from "../errors/OrganizationError";
import {
	resolveSessionPublicApiKey,
	resolveSessionChannelsPerWorkspace,
	workspaceRoleToUserMeRole,
} from "../utils/dtos/UserMeDTO";
import type { WorkspaceMembershipRole } from "../repositories/OrganizationRepository";

export class UserSessionService {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly subscriptionGuard: SubscriptionGuardService,
		private readonly subscriptionService: SubscriptionService,
		private readonly subscriptionRepository: SubscriptionRepository
	) {}

	/**
	 * Build workspace session fields for `GET /users/me?organizationId=…`.
	 * Caller must be a non-disabled member of the organization.
	 */
	async getWorkspaceSession(authUserId: string, organizationId: string): Promise<UserMeWorkspaceSession> {
		const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
		if (!userId) {
			throw new OrganizationForbiddenError("You do not have access to this workspace");
		}

		const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
		if (!membership || membership.disabled) {
			throw new OrganizationNotFoundError(organizationId);
		}

		const workspaceRole = membership.role as WorkspaceMembershipRole;
		const { tier, limits, subscription } = await this.subscriptionGuard.getTierAndLimits(
			organizationId,
			authUserId
		);
		const billingEnabled = this.subscriptionService.billingEnabled();
		const billing = await this.subscriptionRepository.getOrganizationBilling(organizationId);
		const { organization } = await this.organizationRepository.findOrganizationById(organizationId);
		if (!organization) {
			throw new OrganizationNotFoundError(organizationId);
		}

		return {
			orgId: organizationId,
			tier,
			tierPlan: limits,
			channelsPerWorkspace: resolveSessionChannelsPerWorkspace(
				billingEnabled,
				tier,
				limits,
				subscription
			),
			role: workspaceRoleToUserMeRole(workspaceRole),
			publicApi: resolveSessionPublicApiKey({
				workspaceRole,
				planAllowsPublicApi: limits.public_api,
				apiKey: organization.api_key,
			}),
			isLifetime: subscription?.is_lifetime ?? false,
			isTrailing: billing?.is_trialing ?? false,
			allowTrial: billing?.allow_trial ?? false,
			streakSince: null,
			billingEnabled,
		};
	}
}
