<script lang="ts">
	import type { BillingPlanViewModel } from '$lib/billing';
	import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	import {
		billingPresenter,
		firstBillingGatePresenter,
		tierDisplayName
	} from '$lib/billing';
	import { icons } from '$data/icons';
	import { signoutPresenter, SignoutStatus } from '$lib/user-auth/index';
	import { workspaceSettingsPresenter, WorkspaceSettingsStatus } from '$lib/settings';
	import BillingFaq from '$lib/ui/components/billing/BillingFaq.svelte';
	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';
	import BillingPlanFeatures from '$lib/ui/components/billing/BillingPlanFeatures.svelte';
	import EmbeddedBilling from '$lib/ui/components/billing/EmbeddedBilling.svelte';
	import FirstBillingHero from '$lib/ui/components/billing/FirstBillingHero.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import HeaderWorkspaceSwitcher from '$lib/ui/components/workspaces/HeaderWorkspaceSwitcher.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ThemeSwitcher, { ensureDefaultTheme } from '$lib/ui/daisyui/ThemeSwitcher.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		companyName?: string;
	};

	let { companyName = 'Openquok' }: Props = $props();

	let period = $state<SubscriptionPeriod>('MONTHLY');
	let selectedTier = $state<PaidSubscriptionTier>('SOLO');
	let checkoutSecret = $state<string | null>(null);
	let checkoutLoading = $state(false);
	let checkoutLoadFailed = $state(false);
	let checkoutErrorMessage = $state<string | null>(null);
	let checkoutRequestId = 0;

	const pricingVm = $derived(firstBillingGatePresenter.pricingVm);
	const paidPlans = $derived(
		(pricingVm?.plansVm ?? []).filter((plan) => plan.tier !== 'FREE')
	);
	const selectedPlan = $derived(
		paidPlans.find((plan) => plan.tier === selectedTier) ?? paidPlans[0] ?? null
	);
	const allowTrial = $derived(pricingVm?.currentVm?.billing?.allowTrial ?? false);
	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const headerWorkspaces = $derived(workspaceSettingsPresenter.workspacesVm);
	const headerWorkspacesLoading = $derived(
		workspaceSettingsPresenter.status === WorkspaceSettingsStatus.LOADING &&
			headerWorkspaces.length === 0
	);
	const workspaceReady = $derived(
		Boolean(organizationId) &&
			workspaceSettingsPresenter.status !== WorkspaceSettingsStatus.LOADING
	);
	const awaitingWorkspace = $derived(!workspaceReady);

	async function refreshCheckoutSecret(): Promise<void> {
		if (!workspaceReady || !selectedTier) {
			checkoutSecret = null;
			checkoutLoadFailed = false;
			checkoutErrorMessage = null;
			checkoutLoading = false;
			return;
		}

		const requestId = ++checkoutRequestId;
		checkoutLoading = true;
		checkoutLoadFailed = false;
		checkoutErrorMessage = null;

		try {
			const result = await billingPresenter.loadEmbeddedCheckoutSecret(selectedTier, period);
			if (requestId !== checkoutRequestId) return;

			if (result.clientSecret) {
				checkoutSecret = result.clientSecret;
				checkoutLoadFailed = false;
			} else if (!checkoutSecret) {
				checkoutLoadFailed = true;
				checkoutErrorMessage = result.errorMessage;
			}
		} catch {
			if (requestId !== checkoutRequestId) return;
			if (!checkoutSecret) {
				checkoutLoadFailed = true;
				checkoutErrorMessage = 'Could not start checkout. Try again.';
			}
		} finally {
			if (requestId === checkoutRequestId) {
				checkoutLoading = false;
			}
		}
	}

	function handleSwitchWorkspace(workspaceId: string): void {
		workspaceSettingsPresenter.switchWorkspace(workspaceId);
		void firstBillingGatePresenter.evaluate();
	}

	async function handleSignOut(): Promise<void> {
		try {
			await signoutPresenter.signout();
			const status = signoutPresenter.status;
			if (status === SignoutStatus.SUCCESS && signoutPresenter.showToastMessage) {
				toast.success(signoutPresenter.toastMessage);
			}
			if (status !== SignoutStatus.SUCCESS && signoutPresenter.showToastMessage) {
				toast.error(signoutPresenter.toastMessage);
			}
		} catch {
			toast.error('An error occurred while signing out. Please try again later.');
		} finally {
			signoutPresenter.showToastMessage = false;
			await invalidateAll();
		}
	}

	function planPrice(plan: BillingPlanViewModel): number {
		return period === 'YEARLY' ? plan.yearPrice : plan.monthPrice;
	}

	$effect(() => {
		workspaceReady;
		organizationId;
		selectedTier;
		period;
		void refreshCheckoutSecret();
	});

	$effect(() => {
		const firstPaidTier = paidPlans[0]?.tier;
		if (!firstPaidTier) return;
		if (!paidPlans.some((plan) => plan.tier === selectedTier)) {
			selectedTier = firstPaidTier as PaidSubscriptionTier;
		}
	});

	onMount(() => {
		ensureDefaultTheme('forest');
		if (headerWorkspaces.length === 0) {
			void workspaceSettingsPresenter.load({ includeTeam: false });
		}
	});
</script>

<div class="flex min-h-screen flex-col bg-base-200 pb-16">
	<header
		class="flex h-[92px] items-center border-b border-base-300 bg-base-100 px-4 md:px-8 lg:px-20"
	>
		<div class="flex flex-1 items-center text-xl font-semibold tracking-tight">
			{companyName}
		</div>
		<div class="flex items-center gap-4 text-base-content/70">
			<HeaderWorkspaceSwitcher
				workspaces={headerWorkspaces}
				currentWorkspaceId={organizationId}
				loading={headerWorkspacesLoading}
				onSwitchWorkspace={handleSwitchWorkspace}
			/>
			<ThemeSwitcher />
			<div class="hidden h-5 w-px bg-base-300 sm:block"></div>
			<Button
				class="gap-2"
				variant="red"
				size="sm"
				onclick={() => void handleSignOut()}
			>
				<AbstractIcon name={icons.LogOut.name} class="size-4" width="16" height="16" />
				<span class="hidden sm:inline">
					Sign out
				</span>
			</Button>
		</div>
	</header>

	<div class="flex flex-1 flex-col px-4 md:px-8 lg:flex-row lg:px-20">
		<section class="flex flex-1 flex-col py-8 lg:pe-10 lg:pt-10">
			<div class="mb-8 lg:hidden">
				<FirstBillingHero {allowTrial} />
			</div>

			{#if awaitingWorkspace || (checkoutLoading && !checkoutSecret)}
				<div class="flex flex-1 items-center justify-center py-16">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			{:else if checkoutLoadFailed || !checkoutSecret}
				<div
					class="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center"
					role="alert"
				>
					<p class="text-base text-base-content/80">
						{checkoutErrorMessage ??
							'We could not start checkout for this plan. Check your Stripe configuration and try again.'}
					</p>
					<Button variant="primary" onclick={() => void refreshCheckoutSecret()}>
						Retry checkout
					</Button>
				</div>
			{:else}
				<EmbeddedBilling
					clientSecret={checkoutSecret}
					showCoupon={period === 'MONTHLY'}
					checkoutUpdating={checkoutLoading}
				/>
			{/if}
		</section>

		<aside
			class="flex flex-col border-base-300 py-8 lg:w-[min(100%,520px)] lg:border-l lg:ps-10 lg:pt-10"
		>
			<div class="hidden lg:block">
				<FirstBillingHero {allowTrial} />
			</div>

			<div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
				<h2 class="flex-1 text-2xl font-bold">Choose a plan</h2>
				<BillingPeriodToggle
					{period}
					onPeriodChange={(next) => {
						period = next;
					}}
				/>
			</div>

			<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each paidPlans as plan (plan.tier)}
					<button
						type="button"
						class={cn(
							'flex min-h-[124px] cursor-pointer flex-col rounded-2xl border p-4 text-left transition-colors',
							selectedTier === plan.tier
								? 'border-primary bg-primary/5'
								: 'border-base-300 bg-base-100 hover:border-base-content/20'
						)}
						onclick={() => {
							selectedTier = plan.tier as PaidSubscriptionTier;
						}}
					>
						<div class="text-lg font-medium">{tierDisplayName(plan.tier)}</div>
						<div class="mt-2 flex items-end gap-1">
							<span class="text-3xl font-semibold md:text-4xl">${planPrice(plan)}</span>
							<span class="pb-1 text-sm text-base-content/60">
								{period === 'MONTHLY' ? '/ month' : '/ year'}
							</span>
						</div>
					</button>
				{/each}
			</div>

			{#if selectedPlan}
				<div class="mt-10 flex flex-col gap-4">
					<h3 class="text-2xl font-bold">Features</h3>
					<BillingPlanFeatures planVm={selectedPlan} />
				</div>
			{/if}

			<div class="hidden lg:block">
				<BillingFaq {allowTrial} />
			</div>
		</aside>
	</div>
</div>
