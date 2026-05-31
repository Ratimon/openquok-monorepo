import type {
	BillingPresenter,
	SubscribeResult
} from '$lib/billing/Billing.presenter.svelte';
import type {
	BillingCurrentViewModel,
	BillingPlanViewModel,
	GetBillingPresenter
} from '$lib/billing/GetBilling.presenter.svelte';
import type { PaidSubscriptionTier, SubscriptionPeriod, SubscriptionTier } from 'openquok-common';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import { teamMemberDowngradeWarning } from '$lib/billing/utils/planChangeWarnings';
import { ConversionTrackEvent, fireProductEvent, trackConversion } from '$lib/product-analytics';
import {
	hasPurchaseBeenTrackedForCheckout,
	markPurchaseTrackedForCheckout
} from '$lib/product-analytics/utils/purchaseCheckoutDedupe';
import { authenticationRepository } from '$lib/user-auth/index';
import { toast } from '$lib/ui/sonner';

export type HostedCheckoutReturnResult =
	| 'success'
	| 'already_active'
	| 'unauthorized'
	| 'pending_confirmation';

/**
 * Page presenter for account billing: loads pricing via {@link GetBillingPresenter},
 * delegates checkout and portal to {@link BillingPresenter}, and wires product analytics on subscribe.
 */
export class ProtectedBillingPagePresenter {
	loading = $state(true);
	plansVm = $state<BillingPlanViewModel[]>([]);
	currentVm = $state<BillingCurrentViewModel | null>(null);
	billingEnabled = $state(false);

	private loadInFlight: Promise<void> | null = null;
	private subscriptionUpdatedNotified = false;

	constructor(
		private readonly getBillingPresenter: GetBillingPresenter,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		readonly billingPresenter: BillingPresenter
	) {
		this.billingPresenter.bindReloadPricing(() => this.load());
	}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	async load(): Promise<void> {
		if (this.loadInFlight) {
			return this.loadInFlight;
		}
		this.loadInFlight = this.loadInternal().finally(() => {
			this.loadInFlight = null;
		});
		return this.loadInFlight;
	}

	private async loadInternal(): Promise<void> {
		this.loading = true;
		try {
			const orgId = this.organizationId;
			const pricingVm = await this.getBillingPresenter.loadBillingPricingVmStateless(
				orgId || undefined
			);
			this.plansVm = pricingVm.plansVm;
			this.currentVm = pricingVm.currentVm;
			this.billingEnabled = pricingVm.billingEnabled;
		} finally {
			this.loading = false;
		}
	}

	alignWorkspaceForCheckoutReturn(checkoutId: string): Promise<void> {
		return this.billingPresenter.alignWorkspaceForCheckoutReturn(checkoutId);
	}

	pollCheckout(checkoutId: string): Promise<boolean> {
		return this.billingPresenter.pollCheckout(checkoutId);
	}

	openPortal(): Promise<void> {
		return this.billingPresenter.openPortal();
	}

	reactivateSubscription(): Promise<void> {
		return this.billingPresenter.reactivateSubscription();
	}

	previewProration(tier: PaidSubscriptionTier, period: SubscriptionPeriod): Promise<number> {
		const organizationId = this.organizationId;
		if (!organizationId) return Promise.resolve(0);
		return this.billingPresenter.previewProration(organizationId, tier, period);
	}

	private currentPaidPlanVm(): BillingPlanViewModel | undefined {
		const tier: SubscriptionTier | null | undefined =
			this.currentVm?.subscription?.tier ?? this.currentVm?.tier;
		if (!tier || tier === 'FREE') return undefined;
		return this.plansVm.find((row) => row.tier === tier);
	}

	teamMemberDowngradeWarningForTier(targetTier: PaidSubscriptionTier): string | null {
		const targetPlan = this.plansVm.find((row) => row.tier === targetTier);
		return teamMemberDowngradeWarning(targetPlan, this.currentPaidPlanVm());
	}

	cancelTeamMemberDowngradeWarning(): string | null {
		const freePlan = this.plansVm.find((row) => row.tier === 'FREE');
		return teamMemberDowngradeWarning(freePlan, this.currentPaidPlanVm());
	}

	/**
	 * Plan checkout and changes (POST /billing/subscribe): hosted redirect for new subscribers,
	 * in-place Stripe update when a subscription already exists. Embedded checkout lives on FirstBilling only.
	 */
	async subscribeWithTracking(
		tier: PaidSubscriptionTier,
		period: SubscriptionPeriod
	): Promise<SubscribeResult> {
		const planVm = this.plansVm.find((row) => row.tier === tier);
		const price = planVm ? (period === 'MONTHLY' ? planVm.monthPrice : planVm.yearPrice) : 0;
		await trackConversion(ConversionTrackEvent.InitiateCheckout, {
			authenticated: true,
			additional: { value: price }
		});
		return this.billingPresenter.subscribe(tier, period);
	}

	onPurchaseComplete(): void {
		fireProductEvent('purchase', undefined, authenticationRepository.currentUser);
	}

	notifySubscriptionUpdated(): void {
		if (this.subscriptionUpdatedNotified) return;
		this.subscriptionUpdatedNotified = true;
		toast.success('Subscription updated.');
	}

	private notifyPurchaseComplete(checkoutId: string): void {
		const id = checkoutId.trim();
		if (!id || hasPurchaseBeenTrackedForCheckout(id)) return;
		markPurchaseTrackedForCheckout(id);
		this.notifySubscriptionUpdated();
		this.onPurchaseComplete();
		void trackConversion(ConversionTrackEvent.Purchase, { authenticated: true });
	}

	/** After Stripe hosted or embedded checkout redirect (`?checkout=`). */
	async completeHostedCheckoutReturn(checkoutId: string): Promise<HostedCheckoutReturnResult> {
		await this.workspaceSettingsPresenter.load({ includeTeam: false });
		await this.alignWorkspaceForCheckoutReturn(checkoutId);
		await this.load();

		if (!this.workspaceSettingsPresenter.canManageSentInvitesInCurrentWorkspace) {
			toast.error('Only the workspace owner can complete checkout for this workspace.');
			return 'unauthorized';
		}

		const tierAfterLoad = this.currentVm?.tier ?? 'FREE';
		const alreadyActive =
			Boolean(this.currentVm?.subscription?.id) ||
			(tierAfterLoad !== 'FREE' && tierAfterLoad !== null);
		if (alreadyActive) {
			this.notifyPurchaseComplete(checkoutId);
			return 'already_active';
		}

		const confirmed = await this.pollCheckout(checkoutId);
		if (confirmed) {
			this.notifyPurchaseComplete(checkoutId);
			return 'success';
		}

		toast.error('We could not confirm your subscription yet. Refresh the page in a moment.');
		return 'pending_confirmation';
	}

	finishTrial(): Promise<void> {
		return this.billingPresenter.finishTrial();
	}

	pollTrialFinished(): Promise<boolean> {
		return this.billingPresenter.pollTrialFinished();
	}

	checkRetentionOffer(): Promise<boolean> {
		return this.billingPresenter.checkRetentionOffer();
	}

	applyRetentionDiscount(): Promise<boolean> {
		return this.billingPresenter.applyRetentionDiscount();
	}

	cancelWithFeedback(feedback: string): Promise<boolean> {
		return this.billingPresenter.cancelWithFeedback(feedback);
	}
}
