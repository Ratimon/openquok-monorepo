import type { HttpGateway } from '$lib/core/HttpGateway';
import type { PaidSubscriptionTier, SubscriptionPeriod, SubscriptionTier } from 'openquok-common';
import { UNLIMITED_POSTS_PER_MONTH } from 'openquok-common';

export interface BillingConfig {
	endpoints: {
		plans: string;
		/** Full billing context; uses `showorg` cookie when query is omitted. */
		current: string;
		root: string;
		subscribe: string;
		embedded: string;
		portal: string;
		checkCheckout: (id: string) => string;
		checkDiscount: string;
		applyDiscount: string;
		finishTrial: string;
		isTrialFinished: string;
		prorate: string;
		cancel: string;
	};
}

/** Wire tier row from GET /billing/plans (camelCase after gateway). */
interface BillingPlanWireDto {
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

interface ListBillingPlansResponseDto {
	success: boolean;
	data?: { tiers: BillingPlanWireDto[]; billingEnabled: boolean };
}

export interface BillingPlanProgrammerModel {
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

export interface BillingSubscriptionProgrammerModel {
	id: string;
	tier: PaidSubscriptionTier;
	period: SubscriptionPeriod;
	cancelAt: string | null;
}

export interface BillingCurrentProgrammerModel {
	tier: SubscriptionTier;
	subscription: BillingSubscriptionProgrammerModel | null;
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

export type ListBillingPlansProgrammerModel = {
	plans: BillingPlanProgrammerModel[];
	billingEnabled: boolean;
};

/** Raw GET /billing/current payload before subscription field normalization. */
interface BillingCurrentApiData {
	tier: SubscriptionTier;
	subscription: Record<string, unknown> | null;
	drive: BillingCurrentProgrammerModel['drive'];
	limits: BillingCurrentProgrammerModel['limits'];
	billing: BillingCurrentProgrammerModel['billing'];
	billingEnabled?: boolean;
}

interface BillingCurrentResponseDto {
	success: boolean;
	data?: BillingCurrentApiData;
}

function toBillingPlanPm(dto: BillingPlanWireDto): BillingPlanProgrammerModel {
	return { ...dto };
}

function mapBillingSubscription(
	raw: Record<string, unknown> | null | undefined
): BillingSubscriptionProgrammerModel | null {
	if (!raw || typeof raw !== 'object') return null;
	const tier = (raw.subscription_tier ?? raw.subscriptionTier) as PaidSubscriptionTier | undefined;
	const period = raw.period as SubscriptionPeriod | undefined;
	const id = raw.id;
	if (!tier || !period || typeof id !== 'string') return null;
	const cancelAt = (raw.cancel_at ?? raw.cancelAt) as string | null | undefined;
	return {
		id,
		tier,
		period,
		cancelAt: cancelAt ?? null
	};
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

	async listPlans(): Promise<ListBillingPlansProgrammerModel> {
		const { data: listPlansDto, ok } = await this.httpGateway.get<ListBillingPlansResponseDto>(
			this.config.endpoints.plans,
			undefined,
			{ withCredentials: true }
		);

		if (ok && listPlansDto?.data) {
			const tiers = listPlansDto.data.tiers ?? [];
			return {
				plans: tiers.map(toBillingPlanPm),
				billingEnabled: listPlansDto.data.billingEnabled ?? false
			};
		}
		return { plans: [], billingEnabled: false };
	}

	async getCurrent(organizationId?: string): Promise<BillingCurrentProgrammerModel | null> {
		const query = organizationId?.trim() ? { organizationId: organizationId.trim() } : undefined;
		const { data: currentDto, ok } = await this.httpGateway.get<BillingCurrentResponseDto>(
			this.config.endpoints.current,
			query,
			{ withCredentials: true }
		);

		if (ok && currentDto?.data) {
			const subscription = mapBillingSubscription(currentDto.data.subscription);
			return {
				tier: currentDto.data.tier,
				subscription,
				drive: currentDto.data.drive,
				limits: currentDto.data.limits,
				billing: currentDto.data.billing,
				billingEnabled: currentDto.data.billingEnabled ?? false
			};
		}
		return null;
	}

	async createEmbeddedCheckout(params: {
		organizationId: string;
		billing: PaidSubscriptionTier;
		period: SubscriptionPeriod;
		stripePriceId: string;
	}): Promise<{ clientSecret?: string } | null> {
		const { data: embeddedDto, ok } = await this.httpGateway.post<{
			success: boolean;
			data?: { clientSecret?: string; client_secret?: string };
			message?: string;
		}>(
			this.config.endpoints.embedded,
			{
				organizationId: params.organizationId,
				billing: params.billing,
				period: params.period,
				stripePriceId: params.stripePriceId
			},
			{ withCredentials: true }
		);

		if (!ok || !embeddedDto?.data) return null;

		const payload = embeddedDto.data;
		const clientSecret = (payload.clientSecret ?? payload.client_secret)?.trim();
		return clientSecret ? { clientSecret } : null;
	}

	async subscribe(params: {
		organizationId: string;
		billing: PaidSubscriptionTier;
		period: SubscriptionPeriod;
		stripePriceId: string;
	}): Promise<{ url?: string; updated?: boolean; portal?: string } | null> {
		const { data: subscribeDto, ok } = await this.httpGateway.post<{
			success: boolean;
			data?: { url?: string; updated?: boolean; portal?: string };
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

		if (ok && subscribeDto?.data) return subscribeDto.data;
		return null;
	}

	async getPortalUrl(organizationId: string): Promise<string | null> {
		const { data: portalDto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: { portal: string };
		}>(this.config.endpoints.portal, { organizationId }, { withCredentials: true });

		if (ok && portalDto?.data?.portal) return portalDto.data.portal;
		return null;
	}

	async checkCheckout(
		organizationId: string,
		checkoutId: string
	): Promise<{ status: number; organizationId?: string }> {
		const { data: checkCheckoutDto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: { status: number; organizationId?: string };
		}>(this.config.endpoints.checkCheckout(checkoutId), { organizationId }, { withCredentials: true });

		if (ok && checkCheckoutDto?.data?.status != null) {
			return {
				status: checkCheckoutDto.data.status,
				organizationId: checkCheckoutDto.data.organizationId
			};
		}
		return { status: 0 };
	}

	async checkDiscountOffer(organizationId: string): Promise<string | false> {
		const { data: checkDiscountDto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: { offerCoupon: string | false };
		}>(this.config.endpoints.checkDiscount, { organizationId }, { withCredentials: true });

		if (ok && checkDiscountDto?.data?.offerCoupon) return checkDiscountDto.data.offerCoupon;
		return false;
	}

	async applyRetentionDiscount(organizationId: string): Promise<boolean> {
		const { data: applyDiscountDto, ok } = await this.httpGateway.post<{
			success: boolean;
			data?: { applied: boolean };
		}>(this.config.endpoints.applyDiscount, { organizationId }, { withCredentials: true });

		return Boolean(ok && applyDiscountDto?.data?.applied);
	}

	async previewProration(params: {
		organizationId: string;
		billing: PaidSubscriptionTier;
		period: SubscriptionPeriod;
	}): Promise<number> {
		const { data: prorateDto, ok } = await this.httpGateway.post<{
			success: boolean;
			data?: { price: number };
		}>(
			this.config.endpoints.prorate,
			{
				organizationId: params.organizationId,
				billing: params.billing,
				period: params.period
			},
			{ withCredentials: true }
		);

		if (ok && prorateDto?.data?.price != null) return prorateDto.data.price;
		return 0;
	}

	async finishTrial(organizationId: string): Promise<boolean> {
		const { data: finishTrialDto, ok } = await this.httpGateway.post<{
			success: boolean;
		}>(this.config.endpoints.finishTrial, { organizationId }, { withCredentials: true });

		return Boolean(ok && finishTrialDto?.success);
	}

	async isTrialFinished(organizationId: string): Promise<boolean> {
		const { data: isTrialFinishedDto, ok } = await this.httpGateway.get<{
			success: boolean;
			data?: { finished: boolean };
		}>(this.config.endpoints.isTrialFinished, { organizationId }, { withCredentials: true });

		return Boolean(ok && isTrialFinishedDto?.data?.finished);
	}

	async cancelSubscription(params: {
		organizationId: string;
		feedback?: string;
	}): Promise<{ id: string; cancelAt?: string } | null> {
		const { data: cancelDto, ok } = await this.httpGateway.post<{
			success: boolean;
			data?: { id: string; cancelAt?: string };
		}>(
			this.config.endpoints.cancel,
			{ organizationId: params.organizationId, feedback: params.feedback },
			{ withCredentials: true }
		);

		if (ok && cancelDto?.data) return cancelDto.data;
		return null;
	}
}
