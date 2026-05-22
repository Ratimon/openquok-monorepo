import type {
	BillingCurrentDto,
	BillingPlanDto,
	BillingRepository
} from '$lib/billing/Billing.repository.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

import { stripePriceIdForTier } from '$lib/billing/constants/config';
import { workspaceSettingsPresenter } from '$lib/settings';
import { toast } from '$lib/ui/sonner';

export class BillingPresenter {
	loading = $state(true);
	plans = $state<BillingPlanDto[]>([]);
	current = $state<BillingCurrentDto | null>(null);
	billingEnabled = $state(false);
	checkoutBusy = $state(false);

	constructor(private readonly billingRepository: BillingRepository) {}

	get organizationId(): string {
		return workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	async load(): Promise<void> {
		this.loading = true;
		try {
			const [{ plans, billingEnabled }, orgId] = await Promise.all([
				this.billingRepository.listPlans(),
				Promise.resolve(this.organizationId)
			]);
			this.plans = plans;
			this.billingEnabled = billingEnabled;
			if (orgId) {
				this.current = await this.billingRepository.getCurrent(orgId);
			} else {
				this.current = null;
			}
		} finally {
			this.loading = false;
		}
	}

	async subscribe(tier: PaidSubscriptionTier, period: SubscriptionPeriod): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) return;

		const stripePriceId = stripePriceIdForTier(tier, period);
		if (!stripePriceId) {
			toast.error(
				`Stripe price is not configured for ${tier} (${period.toLowerCase()}). Add VITE_PUBLIC_STRIPE_PRICE_ID_${tier}_${period} to your web env.`
			);
			return;
		}

		this.checkoutBusy = true;
		try {
			const result = await this.billingRepository.subscribe({
				organizationId,
				billing: tier,
				period,
				stripePriceId
			});
			if (result?.url) {
				window.location.href = result.url;
				return;
			}
			if (result?.updated) {
				await this.load();
			}
		} finally {
			this.checkoutBusy = false;
		}
	}

	async openPortal(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) return;
		const url = await this.billingRepository.getPortalUrl(organizationId);
		if (url) window.location.href = url;
	}

	async pollCheckout(checkoutId: string): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId || !checkoutId) return;
		const status = await this.billingRepository.checkCheckout(organizationId, checkoutId);
		if (status === 2) {
			await this.load();
		}
	}

	async previewProration(
		organizationId: string,
		tier: PaidSubscriptionTier,
		period: SubscriptionPeriod
	): Promise<number> {
		return this.billingRepository.previewProration({
			organizationId,
			billing: tier,
			period
		});
	}

	async finishTrial(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) return;
		await this.billingRepository.finishTrial(organizationId);
	}

	async pollTrialFinished(): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;
		return this.billingRepository.isTrialFinished(organizationId);
	}

	async reactivateSubscription(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) return;
		this.checkoutBusy = true;
		try {
			const result = await this.billingRepository.cancelSubscription({
				organizationId,
				feedback: ''
			});
			if (result) {
				toast.success('Subscription reactivated successfully');
				await this.load();
			}
		} finally {
			this.checkoutBusy = false;
		}
	}
}
