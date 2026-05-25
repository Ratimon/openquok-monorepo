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

	import { STRIPE_PUBLISHABLE_KEY } from '$lib/billing/constants/config';
	import {
		embeddedCheckoutAppearance,
		isDarkCheckoutTheme
	} from '$lib/billing/stripe/embeddedCheckoutAppearance';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { toast } from '$lib/ui/sonner';

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

<form class="flex flex-1 flex-col pt-6 lg:pt-12" onsubmit={handleSubmit}>
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
			<svg
				class="mt-1"
				xmlns="http://www.w3.org/2000/svg"
				width="47"
				height="20"
				viewBox="0 0 47 20"
				fill="none"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M45.9725 11.0075H39.7596C39.906 12.4952 40.9929 12.9731 42.2262 12.9731C43.4904 12.9731 44.5079 12.6879 45.3481 12.2408V14.8C44.2819 15.4135 43.0618 15.7078 41.8331 15.6479C38.7421 15.6479 36.5683 13.7208 36.5683 9.88208C36.5683 6.65229 38.4106 4.08542 41.4246 4.08542C44.4463 4.08542 46.0187 6.61375 46.0187 9.86667C46.0187 10.175 45.9879 10.8379 45.9725 11.0075ZM41.4092 6.67542C40.6152 6.67542 39.7365 7.23812 39.7365 8.66417H43.0125C43.0125 7.23812 42.1877 6.67542 41.4092 6.67542ZM31.5656 15.6479C30.4556 15.6479 29.7773 15.1854 29.3302 14.8462L29.3148 18.4152L26.139 19.0858V4.29354H29.0373L29.099 5.07979C29.7712 4.44215 30.6622 4.0863 31.5887 4.08542C33.8242 4.08542 35.9208 6.08958 35.9208 9.78958C35.9208 13.821 33.8396 15.6479 31.5656 15.6479ZM30.8333 6.89896C30.101 6.89896 29.6462 7.16104 29.3148 7.52333L29.3302 12.2408C29.6385 12.58 30.0856 12.8421 30.8333 12.8421C32.005 12.8421 32.7912 11.5702 32.7912 9.85896C32.7912 8.20167 31.9896 6.89896 30.8333 6.89896ZM21.7683 4.29354H24.9519V15.4244H21.7683V4.29354ZM21.7683 0.670625L24.9519 0V2.59L21.7683 3.26833V0.678333V0.670625ZM18.4383 7.87792V15.4244H15.2625V4.29354H18.1146L18.2071 5.23396C18.9779 3.86958 20.5735 4.14708 20.9975 4.29354V7.215C20.5967 7.08396 19.2323 6.88354 18.4383 7.87792ZM11.8477 11.5162C11.8477 13.3894 13.8519 12.8112 14.2527 12.6417V15.2317C13.8287 15.4629 13.0656 15.6479 12.025 15.6479C11.5913 15.6606 11.1595 15.5849 10.756 15.4254C10.3525 15.2659 9.98559 15.026 9.6777 14.7203C9.36981 14.4146 9.12733 14.0494 8.96502 13.647C8.8027 13.2446 8.72395 12.8134 8.73354 12.3796L8.74125 2.22771L11.84 1.56479V4.29354H14.2604V7.01458H11.8477V11.524V11.5162ZM8.06292 12.0558C8.06292 14.3452 6.28229 15.6479 3.64604 15.6479C2.46306 15.647 1.29288 15.403 0.208125 14.931V11.9017C1.27188 12.4798 2.59771 12.9115 3.64604 12.9115C4.35521 12.9115 4.82542 12.7265 4.82542 12.1406C4.82542 10.6144 0 11.1848 0 7.66979C0 5.42667 1.7575 4.08542 4.33208 4.08542C5.38042 4.08542 6.42875 4.23958 7.48479 4.66354V7.65438C6.50888 7.14076 5.42694 6.86103 4.32438 6.83729C3.66146 6.83729 3.21438 7.03 3.21438 7.53104C3.21438 8.95708 8.06292 8.27875 8.06292 12.0635V12.0558Z"
					fill="#635BFF"
				/>
			</svg>
		</div>
	{/if}
</form>
