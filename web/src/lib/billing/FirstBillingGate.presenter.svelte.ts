import type { BillingPricingViewModel, GetBillingPresenter } from '$lib/billing/GetBilling.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import {
	isCheckoutIdResolved,
	persistResolvedCheckoutId
} from '$lib/billing/utils/resolvedCheckoutIds';

/**
 * Evaluates whether a free-tier workspace should see the first-billing gate
 * instead of the normal protected app shell.
 * Platform admins bypass the gate in `(protected)/+layout.svelte` (`isPlatformAdmin`).
 *
 * `evaluate()` options:
 * - `force` — refetch billing even when this workspace is already cached (checkout, workspace switch).
 * - `blocking` — kept for call-site compatibility; the layout uses {@link hasResolvedGate} so the
 *   free dashboard never flashes before the first result.
 */
export type FirstBillingGateEvaluateOptions = {
	/** Kept for call-site compatibility; resolution UI keys off {@link hasResolvedGate}. */
	blocking?: boolean;
	/** Skip workspace cache and refetch (checkout return, workspace switch, plan change). */
	force?: boolean;
};

export class FirstBillingGatePresenter {
	loading = $state(true);
	restrictFreeUser = $state(false);
	pricingVm = $state<BillingPricingViewModel | null>(null);
	/** Checkout id already handled this session — avoids `replaceState` (conflicts with PostHog rrweb). */
	resolvedCheckoutId = $state<string | null>(null);
	checkoutReturnInFlightFor = $state<string | null>(null);

	private evaluateInflight: Promise<void> | null = null;
	/** Workspace key last passed through {@link evaluate}; drives {@link hasResolvedGate}. */
	private lastEvaluatedOrganizationKey = $state<string | null>(null);

	constructor(
		private readonly getBillingPresenter: GetBillingPresenter,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	/** True when gate billing context is already loaded for this workspace. */
	hasPricingVmForOrganization(organizationId: string): boolean {
		const orgKey = organizationId.trim();
		if (!orgKey) return false;
		return Boolean(this.pricingVm) && this.lastEvaluatedOrganizationKey === orgKey;
	}

	/**
	 * True after billing has been evaluated for the active workspace (or `__none__`).
	 * Until then the protected layout must not render the free-tier dashboard.
	 * Intentionally ignores in-flight refetches for the same org so FirstBilling is not unmounted.
	 */
	hasResolvedGate(organizationId: string | null | undefined): boolean {
		const orgKey = organizationId?.trim() || '__none__';
		return this.lastEvaluatedOrganizationKey === orgKey;
	}

	/** Sync gate + posts-limit state from billing page loads without another HTTP round-trip. */
	applyPricingVm(pricingVm: BillingPricingViewModel, organizationId?: string): void {
		const orgKey = organizationId?.trim() || '__none__';
		this.lastEvaluatedOrganizationKey = orgKey;
		this.updateFromPricingVm(pricingVm);
		this.loading = false;
	}

	async evaluate(options?: FirstBillingGateEvaluateOptions): Promise<void> {
		const organizationId = this.workspaceSettingsPresenter.currentWorkspaceId ?? undefined;
		const orgKey = organizationId?.trim() || '__none__';

		if (
			!options?.force &&
			this.pricingVm &&
			this.lastEvaluatedOrganizationKey === orgKey
		) {
			this.loading = false;
			return;
		}

		if (this.evaluateInflight) {
			return this.evaluateInflight;
		}

		this.evaluateInflight = this.evaluateInternal(organizationId, orgKey).finally(() => {
			this.evaluateInflight = null;
		});
		return this.evaluateInflight;
	}

	private async evaluateInternal(
		organizationId: string | undefined,
		orgKey: string
	): Promise<void> {
		this.loading = true;
		try {
			if (!organizationId) {
				await this.workspaceSettingsPresenter.load({ includeTeam: false });
			}
			let resolvedOrganizationId =
				this.workspaceSettingsPresenter.currentWorkspaceId ?? undefined;

			// Recover users who signed in via Google (or similar) before default-org creation existed.
			if (
				!resolvedOrganizationId &&
				this.workspaceSettingsPresenter.workspacesVm.length === 0
			) {
				const created = await this.workspaceSettingsPresenter.createWorkspace(
					'My Organization',
					{ silent: true }
				);
				if (created.success) {
					resolvedOrganizationId =
						this.workspaceSettingsPresenter.currentWorkspaceId ?? undefined;
				}
			}

			const resolvedOrgKey = resolvedOrganizationId?.trim() || '__none__';
			const pricingVm = await this.getBillingPresenter.loadBillingPricingVmStateless(
				resolvedOrganizationId
			);
			this.lastEvaluatedOrganizationKey = resolvedOrgKey;
			this.updateFromPricingVm(pricingVm);
		} catch (error) {
			// Still bind this org key so the layout does not spin forever on a failed fetch.
			this.lastEvaluatedOrganizationKey = orgKey;
			throw error;
		} finally {
			this.loading = false;
		}
	}

	private updateFromPricingVm(pricingVm: BillingPricingViewModel): void {
		this.pricingVm = pricingVm;

		const tier = pricingVm.currentVm?.tier ?? 'FREE';
		const hasActiveSubscription =
			Boolean(pricingVm.currentVm?.subscription?.id) ||
			(tier !== 'FREE' && tier !== null);

		this.restrictFreeUser =
			pricingVm.billingEnabled && !hasActiveSubscription && tier === 'FREE';
	}

	/** True while `?checkout=` should bypass the first-billing gate (until marked resolved). */
	isCheckoutBypassed(checkoutId: string | null): boolean {
		if (!checkoutId) return false;
		if (checkoutId === this.resolvedCheckoutId) return false;
		if (isCheckoutIdResolved(checkoutId)) return false;
		return true;
	}

	/** Returns false when this checkout return is already running or finished. */
	tryBeginCheckoutReturn(checkoutId: string): boolean {
		const id = checkoutId.trim();
		if (!id || !this.isCheckoutBypassed(id)) return false;
		if (this.checkoutReturnInFlightFor === id) return false;
		this.checkoutReturnInFlightFor = id;
		return true;
	}

	endCheckoutReturn(): void {
		this.checkoutReturnInFlightFor = null;
	}

	markCheckoutResolved(checkoutId: string): void {
		const id = checkoutId.trim();
		if (!id) return;
		this.resolvedCheckoutId = id;
		persistResolvedCheckoutId(id);
	}
}
