<script lang="ts">
	import { preloadStripe } from '$lib/billing';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		clientSecret: string;
		onSucceeded: () => void;
		onFailed: (message: string) => void;
	};

	let { clientSecret, onSucceeded, onFailed }: Props = $props();

	let busy = $state(false);
	let started = $state(false);

	async function confirmAuthentication(): Promise<void> {
		if (busy) return;
		busy = true;
		try {
			const stripe = await preloadStripe();
			if (!stripe) {
				onFailed('Stripe could not be loaded. Refresh the page and try again.');
				return;
			}
			const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
			if (error) {
				onFailed(error.message ?? 'Authentication failed. Try again or update your payment method.');
				return;
			}
			if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
				onSucceeded();
				return;
			}
			onFailed('Payment was not completed. Update your payment method and try again.');
		} catch {
			onFailed('Something went wrong while confirming payment. Try again.');
		} finally {
			busy = false;
		}
	}

	$effect(() => {
		if (started) return;
		started = true;
		void confirmAuthentication();
	});
</script>

<div class="flex w-full flex-col items-center gap-4 text-center">
	<span class="loading loading-spinner loading-lg text-primary" class:hidden={!busy}></span>
	<p class="text-sm text-base-content/70">
		Your bank may need you to verify this charge. Complete the prompt from your card issuer.
	</p>
	<Button variant="outline" class="w-full" disabled={busy} onclick={() => void confirmAuthentication()}>
		Retry verification
	</Button>
</div>
