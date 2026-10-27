<script lang="ts">
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import EmbeddedBilling from '$lib/ui/components/billing/EmbeddedBilling.svelte';

	type Props = {
		expanded?: boolean;
		requiresPaymentUpdate?: boolean;
		checkoutBusy?: boolean;
		setupBusy?: boolean;
		clientSecret?: string | null;
		onToggleExpanded?: () => void;
		onRequestSetup?: () => void | Promise<void>;
		onOpenPortal?: () => void | Promise<void>;
	};

	let {
		expanded = $bindable(false),
		requiresPaymentUpdate = false,
		checkoutBusy = false,
		setupBusy = false,
		clientSecret = null,
		onToggleExpanded,
		onRequestSetup,
		onOpenPortal
	}: Props = $props();

	const sectionBusy = $derived(checkoutBusy || setupBusy);
	const showPaymentForm = $derived(Boolean(clientSecret?.trim()));

	function handleToggle(): void {
		if (onToggleExpanded) {
			onToggleExpanded();
			return;
		}
		expanded = !expanded;
	}
</script>

<section
	class={cn(
		'rounded-lg border border-base-300 bg-base-100/50',
		requiresPaymentUpdate && 'border-warning/50 bg-warning/5'
	)}
	aria-labelledby="billing-payment-details-heading"
>
	<div class="flex flex-wrap items-center justify-between gap-3 p-4">
		<button
			type="button"
			class="flex min-w-0 flex-1 items-start gap-3 text-left"
			aria-expanded={expanded}
			aria-controls="billing-payment-details-panel"
			onclick={handleToggle}
		>
			<AbstractIcon
				name={icons.CreditCard.name}
				class="mt-0.5 size-5 shrink-0 text-primary"
				width="20"
				height="20"
				focusable="false"
			/>
			<div class="min-w-0 space-y-1">
				<h2 id="billing-payment-details-heading" class="text-base font-semibold text-base-content">
					Payment details
				</h2>
				<p class="text-sm text-base-content/70">
					Update your card in-app.
				</p>
			</div>
			<AbstractIcon
				name={expanded ? icons.ChevronUp.name : icons.ChevronDown.name}
				class="mt-1 size-5 shrink-0 text-base-content/50"
				width="20"
				height="20"
				aria-hidden="true"
			/>
		</button>
	</div>

	{#if expanded}
		<div
			id="billing-payment-details-panel"
			class="space-y-4 border-t border-base-300 px-4 pb-4 pt-3"
		>
			<div class="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="primary"
					size="default"
					disabled={sectionBusy}
					onclick={() => void onRequestSetup?.()}
				>
					{#if setupBusy}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Update payment method
				</Button>
				<Button
					type="button"
					variant="outline"
					size="default"
					disabled={sectionBusy}
					onclick={() => void onOpenPortal?.()}
				>
					Invoices &amp; billing history
				</Button>
			</div>

			{#if showPaymentForm && clientSecret}
				<div class="rounded-lg border border-base-300 bg-base-100 p-4">
					<EmbeddedBilling
						{clientSecret}
						checkoutMode="setup"
						hideHeading
						submitLabel="Save payment info"
					/>
				</div>
			{/if}
		</div>
	{/if}
</section>
