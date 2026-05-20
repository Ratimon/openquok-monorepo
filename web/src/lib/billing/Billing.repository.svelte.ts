import type { HttpGateway } from '$lib/core/HttpGateway';
import type { PaidSubscriptionTier, SubscriptionPeriod, SubscriptionTier } from 'openquok-common';
import { UNLIMITED_POSTS_PER_MONTH } from 'openquok-common';

export interface BillingConfig {
	endpoints: {
		plans: string;
		current: string;
		subscribe: string;
		portal: string;
		checkCheckout: (id: string) => string;
	};
}

export interface BillingPlanDto {
	tier: SubscriptionTier;
	monthPrice: number;
	yearPrice: number;
	mediaStorageBytesPerWorkspace: number;
	channelPerWorkspace: number;
	postsPerMonth: number;
	workspaces: number;
	teamMembersPerWorkspace: number;
	sharePostPreview: boolean;
	communityFeatures: boolean;
	publicApi: boolean;
}

export interface BillingCurrentDto {
	tier: SubscriptionTier;
	drive: { used: number; total: number };
	limits: {
		mediaStorageBytesPerWorkspace: number;
		channelPerWorkspace: number;
		postsPerMonth: number;
		workspaces: number;
		teamMembersPerWorkspace: number;
		sharePostPreview: boolean;
		communityFeatures: boolean;
		publicApi: boolean;
	};
	billing: {
		allowTrial: boolean;
		isTrialing: boolean;
		hasStripeCustomer: boolean;
	} | null;
	billingEnabled: boolean;
}

export function formatPostsPerMonthLimit(n: number): string {
	if (n >= UNLIMITED_POSTS_PER_MONTH) return 'Unlimited';
	return n.toLocaleString();
}

export class BillingRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: BillingConfig
	) {}

	async listPlans(): Promise<{ plans: BillingPlanDto[]; billingEnabled: boolean }> {
		const { data: dto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: { tiers: BillingPlanDto[]; billingEnabled: boolean };
		}>(this.config.endpoints.plans, undefined, { withCredentials: true });

		if (ok && dto?.data) {
			return { plans: dto.data.tiers ?? [], billingEnabled: dto.data.billingEnabled ?? false };
		}
		return { plans: [], billingEnabled: false };
	}

	async getCurrent(organizationId: string): Promise<BillingCurrentDto | null> {
		const { data: dto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: BillingCurrentDto & { billingEnabled?: boolean };
		}>(this.config.endpoints.current, { organizationId }, { withCredentials: true });

		if (ok && dto?.data) {
			return {
				tier: dto.data.tier,
				drive: dto.data.drive,
				limits: dto.data.limits,
				billing: dto.data.billing,
				billingEnabled: dto.data.billingEnabled ?? false
			};
		}
		return null;
	}

	async subscribe(params: {
		organizationId: string;
		billing: PaidSubscriptionTier;
		period: SubscriptionPeriod;
		stripePriceId: string;
	}): Promise<{ url?: string; updated?: boolean } | null> {
		const { data: dto, ok } = await this.httpGateway.post<{
			success: boolean;
			data?: { url?: string; updated?: boolean };
		}>(
			this.config.endpoints.subscribe,
			{
				organizationId: params.organizationId,
				billing: params.billing,
				period: params.period,
				stripePriceId: params.stripePriceId
			},
			{ withCredentials: true }
		);

		if (ok && dto?.data) return dto.data;
		return null;
	}

	async getPortalUrl(organizationId: string): Promise<string | null> {
		const { data: dto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: { portal: string };
		}>(this.config.endpoints.portal, { organizationId }, { withCredentials: true });

		if (ok && dto?.data?.portal) return dto.data.portal;
		return null;
	}

	async checkCheckout(organizationId: string, checkoutId: string): Promise<number> {
		const { data: dto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: { status: number };
		}>(this.config.endpoints.checkCheckout(checkoutId), { organizationId }, { withCredentials: true });

		if (ok && dto?.data?.status != null) return dto.data.status;
		return 0;
	}
}
