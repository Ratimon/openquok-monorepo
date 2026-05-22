import type { BillingRepository } from '$lib/billing/Billing.repository.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import { stripePriceIdForTier } from '$lib/billing/constants/config';
import { toast } from '$lib/ui/sonner';

export class BillingPresenter {
	checkoutBusy = $state(false);

	private reloadPricing: (() => Promise<void>) | null = null;

	constructor(
		private readonly billingRepository: BillingRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	bindReloadPricing(reload: () => Promise<void>): void {
		this.reloadPricing = reload;
	}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
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
			const resultPm = await this.billingRepository.subscribe({
				organizationId,
				billing: tier,
				period,
				stripePriceId
			});
			if (resultPm?.url) {
				window.location.href = resultPm.url;
				return;
			}
			if (resultPm?.updated) {
				await this.reloadPricing?.();
			}
		} finally {
			this.checkoutBusy = false;
		}
	}

	async openPortal(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) return;
		const portalUrl = await this.billingRepository.getPortalUrl(organizationId);
		if (portalUrl) window.location.href = portalUrl;
	}

	async pollCheckout(checkoutId: string): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId || !checkoutId) return;
		const status = await this.billingRepository.checkCheckout(organizationId, checkoutId);
		if (status === 2) {
			await this.reloadPricing?.();
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
			const resultPm = await this.billingRepository.cancelSubscription({
				organizationId,
				feedback: ''
			});
			if (resultPm) {
				toast.success('Subscription reactivated successfully');
				await this.reloadPricing?.();
			}
		} finally {
			this.checkoutBusy = false;
		}
	}
}
