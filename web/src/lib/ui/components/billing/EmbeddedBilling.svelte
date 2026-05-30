<script lang="ts">
	import type {
		Stripe,
		StripeCheckoutLoadActionsSuccess,
		StripeCheckoutSession,
		StripePaymentElement
	} from '@stripe/stripe-js';

	import dayjs from 'dayjs';
	import { loadStripe } from '@stripe/stripe-js';
	import { onDestroy, onMount, tick } from 'svelte';

	import { icons } from '$data/icons';
	import { STRIPE_PUBLISHABLE_KEY } from '$lib/billing/constants/config';
	import {
		embeddedCheckoutAppearance,
		isDarkCheckoutTheme
	} from '$lib/billing/stripe/embeddedCheckoutAppearance';
	import { cn } from '$lib/ui/helpers/common';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	

	type Props = {
		clientSecret: string;
		showCoupon?: boolean;
		checkoutUpdating?: boolean;
	};

	let { clientSecret, showCoupon = false, checkoutUpdating = false }: Props = $props();

	let paymentMountEl = $state<HTMLDivElement | null>(null);
	let stripe = $state<Stripe | null>(null);
	let paymentElement = $state<StripePaymentElement | null>(null);
	let actions = $state<StripeCheckoutLoadActionsSuccess | null>(null);
	let session = $state<StripeCheckoutSession | null>(null);
	let paymentReady = $state(false);
	let submitting = $state(false);
	let mountedSecret = $state<string | null>(null);
	let mountError = $state<string | null>(null);
	let couponCode = $state('');
	let couponApplying = $state(false);
	let showCouponInput = $state(false);
	let appliedCoupon = $state<string | null>(null);
	let summarySession = $state<StripeCheckoutSession | null>(null);

	const preAppliedCode = $derived(session?.discountAmounts?.[0]?.promotionCode ?? null);
	const effectiveCoupon = $derived(appliedCoupon ?? preAppliedCode);

	const displaySession = $derived(session ?? summarySession);

	const lineItem = $derived(displaySession?.lineItems?.[0] ?? null);
	const dueToday = $derived(displaySession?.total?.total?.amount ?? '$0.00');
	const nextBillingTotal = $derived(displaySession?.recurring?.dueNext?.total?.amount ?? null);
	const nextBillingDate = $derived.by(() => {
		const trialEnd = displaySession?.recurring?.trial?.trialEnd;
		return trialEnd ? dayjs(trialEnd * 1000).format('MMMM D, YYYY') : null;
	});
	const billingInterval = $derived(
		displaySession?.recurring?.interval === 'year' ? 'Yearly' : 'Monthly'
	);
	const trialEndLabel = $derived.by(() => {
		const trialEnd = displaySession?.recurring?.trial?.trialEnd;
		return trialEnd ? dayjs(trialEnd * 1000).format('MMMM D, YYYY') : null;
	});
	const submitLabel = $derived(
		displaySession?.recurring?.trial?.trialEnd
			? 'Pay $0 today — start your free trial'
			: 'Pay now'
	);
	const canSubmit = $derived(Boolean(session?.canConfirm) && !submitting && !checkoutUpdating);
	const showSummary = $derived(Boolean(displaySession) && (paymentReady || summarySession));

	async function teardownCheckout(keepSummary = false): Promise<void> {
		paymentElement?.unmount();
		paymentElement = null;
		actions = null;
		if (!keepSummary) {
			session = null;
			summarySession = null;
		}
		paymentReady = false;
		mountedSecret = null;
		mountError = null;
	}

	async function mountCheckout(secret: string): Promise<void> {
		if (!stripe || !secret) return;
		const keepSummary = mountedSecret !== null;
		await teardownCheckout(keepSummary);
		if (keepSummary) {
			appliedCoupon = null;
			showCouponInput = false;
			couponCode = '';
		}
		mountError = null;

		await tick();
		if (!paymentMountEl) {
			mountError = 'Payment form could not be mounted. Refresh the page and try again.';
			return;
		}

		try {
			const sdk = stripe.initCheckoutElementsSdk({
				clientSecret: secret,
				elementsOptions: { appearance: embeddedCheckoutAppearance(isDarkCheckoutTheme()) }
			});

			sdk.on('change', (nextSession) => {
				session = nextSession;
				summarySession = nextSession;
			});

			const loadResult = await sdk.loadActions();
			if (loadResult.type === 'error') {
				const message = loadResult.error.message;
				mountError = message;
				toast.error(message);
				return;
			}

			actions = loadResult.actions;
			session = loadResult.actions.getSession();
			summarySession = session;

			const element = sdk.createPaymentElement({
				fields: { billingDetails: { address: 'if_required' } },
				layout: 'tabs'
			});
			element.on('ready', () => {
				paymentReady = true;
			});
			element.mount(paymentMountEl);

			paymentElement = element;
			mountedSecret = secret;
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Could not load the payment form.';
			mountError = message;
			toast.error(message);
		}
	}

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!actions || submitting) return;
		submitting = true;
		const result = await actions.confirm();
		if (result.type === 'error') {
			toast.error(result.error.message);
		}
		submitting = false;
	}

	async function applyCoupon(code?: string): Promise<void> {
		const trimmed = (code ?? couponCode).trim();
		if (!trimmed || !actions) return;
		couponApplying = true;
		const result = await actions.applyPromotionCode(trimmed);
		if (result.type === 'error') {
			toast.error(result.error.message);
		} else {
			appliedCoupon = trimmed;
			couponCode = '';
			showCouponInput = false;
			toast.success('Coupon applied.');
		}
		couponApplying = false;
	}

	async function removeCoupon(): Promise<void> {
		if (!actions) return;
		couponApplying = true;
		const result = await actions.removePromotionCode();
		if (result.type === 'error') {
			toast.error(result.error.message);
		} else {
			appliedCoupon = null;
			toast.success('Coupon removed.');
		}
		couponApplying = false;
	}

	$effect(() => {
		if (!clientSecret || !stripe || !paymentMountEl) return;
		if (mountedSecret === clientSecret) return;
		void mountCheckout(clientSecret);
	});

	onMount(async () => {
		if (!STRIPE_PUBLISHABLE_KEY) {
			toast.error('Stripe publishable key is not configured.');
			return;
		}
		stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
	});

	onDestroy(() => {
		void teardownCheckout();
	});
</script>

<form class="flex flex-1 flex-col pt-6 lg:pt-0" onsubmit={handleSubmit}>
	<div>
		<h2 class="mb-8 text-2xl font-bold">Payment</h2>
		<div class="relative">
			{#if mountError}
				<div class="alert alert-error text-sm" role="alert">
					<span>{mountError}</span>
				</div>
			{/if}
			<div bind:this={paymentMountEl} class="min-h-[220px]"></div>
			{#if (!paymentReady || checkoutUpdating) && !mountError && clientSecret}
				<div
					class="absolute inset-0 flex items-center justify-center rounded-lg bg-base-100/80 backdrop-blur-[1px]"
				>
					<span class="loading loading-spinner loading-md text-primary"></span>
				</div>
			{/if}
		</div>
	</div>

	{#if showSummary && displaySession}
		<div class="relative mt-10">
			{#if checkoutUpdating || !paymentReady}
				<div
					class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-base-100/70 backdrop-blur-[1px]"
				>
					<span class="loading loading-spinner loading-md text-primary"></span>
				</div>
			{/if}
			<h3 class="mb-4 text-2xl font-bold">Order summary</h3>
			<div class="flex flex-col gap-3 rounded-xl border border-base-300 p-5">
				<div class="flex items-center justify-between gap-4">
					<div class="flex flex-col">
						<span class="font-semibold">{lineItem?.name ?? 'Subscription'}</span>
						<span class="text-sm text-base-content/60">{billingInterval}</span>
					</div>
					<span class="font-medium">{lineItem?.unitAmount?.amount ?? '$0.00'}</span>
				</div>

				{#if displaySession.discountAmounts?.[0]}
					{@const discount = displaySession.discountAmounts[0]}
					<div class="flex items-center justify-between gap-4 font-semibold">
						<span class="font-medium">
							{discount.displayName || discount.promotionCode}
							{#if discount.percentOff}
								({discount.percentOff}% off)
							{/if}
						</span>
						<span class="font-medium">
							{discount.amount !== '$0.00' ? `-${discount.amount}` : 'Applied'}
						</span>
					</div>
				{/if}

				<div class="my-1 border-t border-base-300"></div>

				<div class="flex items-center justify-between gap-4">
					<span class="font-semibold">Due today</span>
					<span class="text-lg font-bold">{dueToday}</span>
				</div>

				{#if nextBillingTotal && nextBillingDate}
					<p class="text-sm text-base-content/60">
						Then {nextBillingTotal} on {nextBillingDate}
					</p>
				{/if}

				<p class="text-xs">
					<strong>
						Cancel anytime from billing settings without contacting support and you will not be
						charged again after cancellation.
					</strong>
				</p>
			</div>
		</div>

		{#if showCoupon && paymentReady}
			{#if effectiveCoupon}
				<div class="mt-10 flex flex-col gap-2">
					<div
						class="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4"
					>
						<div class="flex-1">
							<span class="font-semibold text-primary">{effectiveCoupon}</span>
							<span class="ml-2 text-sm text-base-content/70">applied</span>
						</div>
						<button
							type="button"
							class="text-sm font-medium text-base-content/50 hover:text-base-content disabled:opacity-50"
							disabled={couponApplying}
							onclick={() => void removeCoupon()}
						>
							Remove
						</button>
					</div>
				</div>
			{:else if !showCouponInput}
				<div class="mt-10">
					<button
						type="button"
						class="text-base font-medium text-base-content/60 transition-colors hover:text-base-content"
						onclick={() => {
							showCouponInput = true;
						}}
					>
						Have a discount coupon?
					</button>
				</div>
			{:else}
				<div class="mt-10 flex flex-col gap-3">
					<div class="flex items-center gap-3">
						<h4 class="text-lg font-semibold">Discount coupon</h4>
						<button
							type="button"
							class="text-sm text-base-content/50 hover:text-base-content"
							onclick={() => {
								showCouponInput = false;
								couponCode = '';
							}}
						>
							Cancel
						</button>
					</div>
					<div class="flex flex-col gap-3 sm:flex-row">
						<input
							type="text"
							class="input input-bordered h-11 flex-1"
							placeholder="Enter coupon code"
							disabled={couponApplying}
							bind:value={couponCode}
							onkeydown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									void applyCoupon();
								}
								if (event.key === 'Escape') {
									showCouponInput = false;
									couponCode = '';
								}
							}}
						/>
						<Button
							type="button"
							variant="primary"
							disabled={couponApplying || !couponCode.trim()}
							onclick={() => void applyCoupon()}
						>
							{couponApplying ? 'Applying…' : 'Apply'}
						</Button>
					</div>
				</div>
			{/if}
		{/if}

		<div
			class={cn(
				'mt-8 flex flex-col gap-4 border-t border-base-300 pt-6 lg:sticky lg:bottom-0 lg:bg-base-100',
				'lg:flex-row lg:items-center lg:justify-between'
			)}
		>
			{#if trialEndLabel}
				<p class="text-sm text-base-content/70">
					Your 7-day trial is <span class="font-semibold text-base-content">100% free</span> ending
					<span class="font-semibold text-base-content">{trialEndLabel}</span>.
					Cancel anytime from billing settings.
				</p>
			{/if}
			<Button type="submit" variant="primary" disabled={!canSubmit} class="w-full sm:w-auto">
				{submitting ? 'Processing…' : submitLabel}
			</Button>
		</div>

		<div class="mt-6 flex items-center gap-1 text-base font-semibold">
			<span>Secure payments processed by</span>
			<AbstractIcon
				name={icons.Stripe.name}
				class="mt-1 text-[#635BFF]"
				width="47"
				height="20"
				focusable="false"
			/>
		</div>
	{/if}
</form>
