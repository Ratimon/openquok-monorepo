<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		busy: boolean;
		onOpenChange: (open: boolean) => void;
		onAcceptDiscount: () => void | Promise<void>;
		onContinueCancel: () => void;
	};

	let {
		open = $bindable(false),
		busy,
		onOpenChange,
		onAcceptDiscount,
		onContinueCancel
	}: Props = $props();
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next: boolean) => {
		onOpenChange(next);
	}}
>
	<Dialog.Content class="max-w-lg" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>Before you cancel</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-col gap-5 py-2">
			<p class="text-sm text-base-content/80">
				Would you accept 50% off for 3 months instead?
			</p>
			<div class="flex flex-wrap gap-2.5">
				<Button variant="primary" disabled={busy} onclick={() => void onAcceptDiscount()}>
					Apply 50% discount for 3 months
				</Button>
				<Button variant="red" disabled={busy} onclick={onContinueCancel}>
					Cancel my subscription
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
