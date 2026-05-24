import type { BillingRepository } from '$lib/billing/Billing.repository.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import { stripePriceIdForTier, STRIPE_PUBLISHABLE_KEY } from '$lib/billing/constants/config';
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

	async loadEmbeddedCheckoutSecret(
		tier: PaidSubscriptionTier,
		period: SubscriptionPeriod
	): Promise<{ clientSecret: string | null; errorMessage: string | null }> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return { clientSecret: null, errorMessage: null };
		}

		const stripePriceId = stripePriceIdForTier(tier, period);
		if (!stripePriceId) {
			const message = `Stripe price is not configured for ${tier} (${period.toLowerCase()}). Add VITE_PUBLIC_STRIPE_PRICE_ID_${tier}_${period} to your web env.`;
			toast.error(message);
			return { clientSecret: null, errorMessage: message };
		}

		if (!STRIPE_PUBLISHABLE_KEY) {
			const message =
				'VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured in the web environment.';
			toast.error(message);
			return { clientSecret: null, errorMessage: message };
		}

		try {
			const result = await this.billingRepository.createEmbeddedCheckout({
				organizationId,
				billing: tier,
				period,
				stripePriceId
			});
			const clientSecret = result?.clientSecret?.trim() ?? null;
			if (!clientSecret) {
				const message =
					'Checkout session did not return a client secret. Confirm backend Stripe keys and FRONTEND_DOMAIN_URL.';
				toast.error(message);
				return { clientSecret: null, errorMessage: message };
			}
			return { clientSecret, errorMessage: null };
		} catch (error) {
			const message =
				error instanceof ApiError
					? messageFromApiError(
							error,
							'Could not start embedded checkout. Try again or contact support.'
						)
					: 'Could not start embedded checkout. Try again.';
			toast.error(message);
			return { clientSecret: null, errorMessage: message };
		}
	}

	/** @returns Billing portal URL when in-place upgrade needs a payment method update. */
	async subscribe(
		tier: PaidSubscriptionTier,
		period: SubscriptionPeriod
	): Promise<string | undefined> {
		const organizationId = this.organizationId;
		if (!organizationId) return undefined;

		const stripePriceId = stripePriceIdForTier(tier, period);
		if (!stripePriceId) {
			toast.error(
				`Stripe price is not configured for ${tier} (${period.toLowerCase()}). Add VITE_PUBLIC_STRIPE_PRICE_ID_${tier}_${period} to your web env.`
			);
			return undefined;
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
				return undefined;
			}
			if (resultPm?.portal) {
				return resultPm.portal;
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
				return undefined;
			}
			toast.error('Checkout could not be started. Try again or contact support.');
			return undefined;
		} catch (error) {
			if (error instanceof ApiError) {
				toast.error(
					messageFromApiError(error, 'Checkout failed. Check your plan and Stripe configuration.')
				);
			} else {
				toast.error('Checkout failed. Try again.');
			}
			return undefined;
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
			let poll: { status: number; organizationId?: string } = { status: 0 };
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
				return;
			}
			toast.error('Could not reactivate your subscription. Try again or contact support.');
		} catch (error) {
			if (error instanceof ApiError) {
				toast.error(
					messageFromApiError(
						error,
						'Could not reactivate your subscription. Refresh the page or contact support.'
					)
				);
			} else {
				toast.error('Could not reactivate your subscription. Try again.');
			}
		} finally {
			this.checkoutBusy = false;
		}
	}

	async checkRetentionOffer(): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;
		const offer = await this.billingRepository.checkDiscountOffer(organizationId);
		return Boolean(offer);
	}

	async applyRetentionDiscount(): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;
		this.checkoutBusy = true;
		try {
			const applied = await this.billingRepository
				.applyRetentionDiscount(organizationId);
			if (applied) {
				toast.success('50% discount applied successfully');
				await this.reloadPricing?.();
				return true;
			}
			toast.error('Could not apply the retention discount.');
			return false;
		} finally {
			this.checkoutBusy = false;
		}
	}

	async cancelWithFeedback(feedback: string): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;
		this.checkoutBusy = true;
		try {
			const resultPm = await this.billingRepository.cancelSubscription({
				organizationId,
				feedback: feedback.trim()
			});
			if (resultPm) {
				if (resultPm.cancelAt) {
					toast.success('Subscription set to cancel at period end.');
				} else {
					toast.success('Subscription canceled.');
				}
				await this.reloadPricing?.();
				return true;
			}
			toast.error('Could not cancel your subscription. Try again or contact support.');
			return false;
		} finally {
			this.checkoutBusy = false;
		}
	}
}
