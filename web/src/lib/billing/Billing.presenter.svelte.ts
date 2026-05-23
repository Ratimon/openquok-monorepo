import type { BillingRepository } from '$lib/billing/Billing.repository.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import { stripePriceIdForTier } from '$lib/billing/constants/config';
import { ApiError, messageFromApiError } from '$lib/core/HttpGateway';
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
				try {
					await this.reloadPricing?.();
					toast.success('Subscription updated.');
				} catch {
					toast.error(
						'Subscription changed, but billing details failed to refresh. Reload the page.'
					);
				}
				return;
			}
			toast.error('Checkout could not be started. Try again or contact support.');
		} catch (error) {
			if (error instanceof ApiError) {
				toast.error(
					messageFromApiError(error, 'Checkout failed. Check your plan and Stripe configuration.')
				);
			} else {
				toast.error('Checkout failed. Try again.');
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

	async pollCheckout(checkoutId: string): Promise<boolean> {
		if (!checkoutId) return false;

		for (let attempt = 0; attempt < 30; attempt++) {
			const workspaceId = this.organizationId;
			let poll = { status: 0, organizationId: undefined as string | undefined };
			try {
				poll = await this.billingRepository.checkCheckout(workspaceId, checkoutId);
			} catch {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				continue;
			}
			if (poll.status === 2) {
				const confirmedOrgId = poll.organizationId?.trim();
				if (confirmedOrgId && confirmedOrgId !== workspaceId) {
					await this.workspaceSettingsPresenter.switchWorkspace(confirmedOrgId);
				}
				try {
					await this.reloadPricing?.();
				} catch {
					// Subscription is confirmed; UI refresh can fail without failing the poll.
				}
				return true;
			}
			if (poll.status === 1) return false;
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}

		try {
			await this.reloadPricing?.();
		} catch {
			// best-effort refresh after polling timeout
		}
		return false;
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
