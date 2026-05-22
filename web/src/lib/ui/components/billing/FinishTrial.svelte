<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		onClose: () => void;
		onFinishTrial: () => Promise<void>;
		onPollFinished: () => Promise<boolean>;
	};

	let { onClose, onFinishTrial, onPollFinished }: Props = $props();

	let finished = $state(false);
	let open = $state(true);

	async function pollUntilFinished(): Promise<void> {
		for (let attempt = 0; attempt < 60; attempt++) {
			if (await onPollFinished()) {
				finished = true;
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}

	$effect(() => {
		void onFinishTrial().then(() => pollUntilFinished());
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
			{#if !finished}
				<span class="loading loading-spinner loading-lg text-primary"></span>
				<p class="text-center text-sm text-base-content/70">
					We are confirming your subscription. This may take a moment.
				</p>
			{:else}
				<p class="text-center text-base-content">
					Your trial has finished successfully and your subscription is active.
				</p>
				<div class="flex w-full gap-2">
					<Button variant="primary" class="flex-1" onclick={onClose}>Close</Button>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
