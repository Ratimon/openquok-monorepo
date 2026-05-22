<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import {
		billingPresenter,
		formatPostsPerMonthLimit,
		type BillingPlanDto
	} from '$lib/billing';
	import { ConversionTrackEvent, fireProductEvent, trackConversion } from '$lib/product-analytics';
	import { formatBytes } from '$lib/medias';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { toast } from '$lib/ui/sonner';

	import { PAID_SUBSCRIPTION_TIERS, type PaidSubscriptionTier } from 'openquok-common';

	const p = billingPresenter;
	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const checkoutId = $derived(page.url.searchParams.get('checkout'));

	let period = $state<'MONTHLY' | 'YEARLY'>('MONTHLY');

	const paidTiers = PAID_SUBSCRIPTION_TIERS;

	onMount(() => {
		void p.load().then(() => {
			if (checkoutId) {
				void p.pollCheckout(checkoutId).then(() => {
					fireProductEvent('purchase');
					void trackConversion(ConversionTrackEvent.Purchase, { authenticated: true });
					toast.success('Subscription updated.');
				});
			}
		});
	});

	async function subscribeWithTracking(tier: PaidSubscriptionTier): Promise<void> {
		const price = planPrice(tier);
		await trackConversion(ConversionTrackEvent.InitiateCheckout, {
			authenticated: true,
			additional: { value: price }
		});
		await p.subscribe(tier, period);
	}

	$effect(() => {
		organizationId;
		void p.load();
	});

	function planPrice(tier: PaidSubscriptionTier): number {
		const plan = p.plans.find((row) => row.tier === tier);
		if (!plan) return 0;
		return period === 'MONTHLY' ? plan.monthPrice : plan.yearPrice;
	}

	function planForTier(tier: PaidSubscriptionTier): BillingPlanDto | undefined {
		return p.plans.find((row) => row.tier === tier);
	}

	function tierLabel(tier: string): string {
		if (tier === 'SOLO') return 'Solo';
		if (tier === 'CREATOR') return 'Creator';
		if (tier === 'TEAM') return 'Team';
		if (tier === 'ULTIMATE') return 'Ultimate Pro';
		return tier;
	}
</script>

<div class="mx-auto flex max-w-5xl flex-col gap-8 p-6">
	<header>
		<h1 class="text-2xl font-semibold">Billing</h1>
		<p class="text-base-content/70 mt-1 text-sm">
			Workspace subscription, media storage, and plan limits.
		</p>
	</header>

	{#if p.loading}
		<div class="flex justify-center py-16">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		<section class="border-base-300 bg-base-100 rounded-xl border p-6">
			<h2 class="text-lg font-medium">Current plan</h2>
			{#if p.current}
				<p class="mt-2">
					<span class="badge badge-primary">{tierLabel(p.current.tier)}</span>
					{#if p.current.billing?.isTrialing}
						<span class="badge badge-outline ml-2">Trial</span>
					{/if}
				</p>
				<p class="text-base-content/70 mt-3 text-sm">
					Media storage:
					<strong>{formatBytes(p.current.drive.used)}</strong>
					of
					<strong>{formatBytes(p.current.drive.total)}</strong>
					used
				</p>
				<progress
					class="progress progress-primary mt-2 w-full max-w-md"
					value={p.current.drive.used}
					max={p.current.drive.total}
				></progress>
			{:else}
				<p class="text-base-content/70 mt-2 text-sm">Select a workspace to view billing.</p>
			{/if}

			{#if p.billingEnabled && p.current?.billing?.hasStripeCustomer}
				<button
					type="button"
					class="btn btn-outline btn-sm mt-4"
					disabled={p.checkoutBusy || !organizationId}
					onclick={() => void p.openPortal()}
				>
					Manage payment method
				</button>
			{/if}
		</section>

		{#if !p.billingEnabled}
			<div class="alert alert-info">
				<span>
					Stripe billing is not configured. Set backend <code>STRIPE_*</code> keys and price ids
					to enable checkout.
				</span>
			</div>
		{:else if organizationId}
			<section class="flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<h2 class="text-lg font-medium">Upgrade</h2>
					<div class="join">
						<button
							type="button"
							class="btn join-item btn-sm"
							class:btn-active={period === 'MONTHLY'}
							onclick={() => (period = 'MONTHLY')}>Monthly</button
						>
						<button
							type="button"
							class="btn join-item btn-sm"
							class:btn-active={period === 'YEARLY'}
							onclick={() => (period = 'YEARLY')}>Yearly</button
						>
					</div>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					{#each paidTiers as tier (tier)}
						{@const plan = planForTier(tier)}
						<article class="border-base-300 bg-base-100 flex flex-col rounded-xl border p-5">
							<h3 class="font-semibold">{tierLabel(tier)}</h3>
							<p class="mt-1 text-2xl font-bold">
								${planPrice(tier)}<span class="text-sm font-normal">
									/{period === 'MONTHLY' ? 'mo' : 'yr'}</span
								>
							</p>
							{#if plan}
								<ul class="text-base-content/70 mt-3 flex-1 space-y-1 text-sm">
									<li>{plan.channelPerWorkspace} connected accounts per workspace</li>
									<li>
										{plan.workspaces} workspace{plan.workspaces === 1 ? '' : 's'}
									</li>
									<li>
										{plan.teamMembersPerWorkspace} team member{plan.teamMembersPerWorkspace === 1
											? ''
											: 's'} per workspace
									</li>
									<li>{formatPostsPerMonthLimit(plan.postsPerMonth)} posts / month</li>
									<li>
										Share post preview: {plan.sharePostPreview ? 'Yes' : 'No'}
									</li>
									<li>{formatBytes(plan.mediaStorageBytesPerWorkspace)} cloud storage per workspace</li>
								</ul>
							{/if}
							<button
								type="button"
								class="btn btn-primary btn-sm mt-4"
								disabled={p.checkoutBusy || p.current?.tier === tier}
								onclick={() => void subscribeWithTracking(tier)}
							>
								{p.current?.tier === tier ? 'Current plan' : 'Subscribe'}
							</button>
						</article>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>
