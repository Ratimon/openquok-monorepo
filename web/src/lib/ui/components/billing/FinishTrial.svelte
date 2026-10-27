<script lang="ts">
	import type { FinishTrialResult } from '$lib/billing';

	import { onMount } from 'svelte';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	import BillingPaymentIntentConfirm from '$lib/ui/components/billing/BillingPaymentIntentConfirm.svelte';

	type Phase = 'working' | 'authenticating' | 'success' | 'failed';

	type Props = {
		onClose: () => void;
		onFinishTrial: () => Promise<FinishTrialResult | null>;
		onPollFinished: () => Promise<boolean>;
		onOpenPaymentDetails?: () => void;
	};

	let { onClose, onFinishTrial, onPollFinished, onOpenPaymentDetails }: Props = $props();

	let phase = $state<Phase>('working');
	let failureMessage = $state('');
	let paymentIntentSecret = $state<string | null>(null);
	let open = $state(true);

	async function pollUntilFinished(): Promise<boolean> {
		for (let attempt = 0; attempt < 60; attempt++) {
			if (await onPollFinished()) {
				phase = 'success';
				return true;
			}
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
		return false;
	}

	async function handleFinishTrialResult(result: FinishTrialResult | null): Promise<void> {
		if (!result) {
			phase = 'failed';
			failureMessage =
				'We could not finish your trial. Refresh the page or update your payment method.';
			return;
		}

		if (result.finished) {
			const ok = await pollUntilFinished();
			if (!ok) {
				phase = 'failed';
				failureMessage =
					'Your trial ended but we have not confirmed an active subscription yet. Check Payment details or try again shortly.';
			}
			return;
		}

		if (result.requiresAction && result.clientSecret?.trim()) {
			paymentIntentSecret = result.clientSecret.trim();
			phase = 'authenticating';
			return;
		}

		if (result.paymentFailed) {
			phase = 'failed';
			failureMessage =
				result.message ??
				'We could not charge your payment method. Update your card and try again.';
			return;
		}

		const polled = await pollUntilFinished();
		if (!polled) {
			phase = 'failed';
			failureMessage =
				result.message ??
				'Subscription payment is still processing. Check Payment details or try again.';
		}
	}

	async function afterAuthenticationSucceeded(): Promise<void> {
		phase = 'working';
		paymentIntentSecret = null;
		const ok = await pollUntilFinished();
		if (!ok) {
			phase = 'failed';
			failureMessage =
				'Authentication succeeded but your subscription is not active yet. Update your payment method or try again.';
		}
	}

	function handleOpenPaymentDetails(): void {
		onOpenPaymentDetails?.();
		onClose();
	}

	onMount(() => {
		void onFinishTrial().then((result) => handleFinishTrialResult(result));
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next: boolean) => {
		if (!next) onClose();
	}}
>
	<Dialog.Content class="max-w-lg" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>Finishing trial</Dialog.Title>
		</Dialog.Header>
		<div class="flex min-h-48 flex-col items-center justify-center gap-4 py-4">
			{#if phase === 'working'}
				<span class="loading loading-spinner loading-lg text-primary"></span>
				<p class="text-center text-sm text-base-content/70">
					We are confirming your subscription. This may take a moment.
				</p>
			{:else if phase === 'authenticating' && paymentIntentSecret}
				<BillingPaymentIntentConfirm
					clientSecret={paymentIntentSecret}
					onSucceeded={() => void afterAuthenticationSucceeded()}
					onFailed={(message) => {
						failureMessage = message;
						phase = 'failed';
					}}
				/>
			{:else if phase === 'success'}
				<p class="text-center text-base-content">
					Your trial has finished successfully and your subscription is active.
				</p>
				<div class="flex w-full gap-2">
					<Button variant="primary" class="flex-1" onclick={onClose}>Close</Button>
				</div>
			{:else}
				<p class="text-center text-sm text-base-content">{failureMessage}</p>
				<div class="flex w-full flex-col gap-2 sm:flex-row">
					{#if onOpenPaymentDetails}
						<Button variant="primary" class="flex-1" onclick={handleOpenPaymentDetails}>
							Update payment method
						</Button>
					{/if}
					<Button variant="outline" class="flex-1" onclick={onClose}>Close</Button>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
