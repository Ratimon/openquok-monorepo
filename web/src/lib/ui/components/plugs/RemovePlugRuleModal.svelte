<script lang="ts">
	import { icons } from '$data/icons';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		open?: boolean;
		ruleTitle: string;
		channelSummary: string;
		busy?: boolean;
		onConfirm: () => void | Promise<void>;
		onCancel: () => void;
	};

	let {
		open = $bindable(false),
		ruleTitle,
		channelSummary,
		busy = false,
		onConfirm,
		onCancel
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="w-[min(92vw,480px)] max-w-[min(92vw,480px)]" showCloseButton={false}>
		<div class="flex items-start justify-between gap-3">
			<Dialog.Header class="space-y-2 text-start">
				<Dialog.Title class="text-2xl font-semibold">Remove plug rule?</Dialog.Title>
				<Dialog.Description class="text-base text-base-content/80">
					Remove <strong>{ruleTitle}</strong> for {channelSummary}? You can add a new rule later.
				</Dialog.Description>
			</Dialog.Header>
			<button
				type="button"
				class="hover:bg-base-200 rounded-md p-2 text-base-content/70 outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
				onclick={onCancel}
				disabled={busy}
				aria-label="Close"
			>
				<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
			</button>
		</div>

		<div class="mt-6 flex flex-wrap gap-3">
			<Button
				type="button"
				variant="primary"
				onclick={() => void onConfirm()}
				disabled={busy}
				class="min-w-[120px]"
			>
				{#if busy}
					<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				{:else}
					Remove
				{/if}
			</Button>
			<Button type="button" variant="secondary" onclick={onCancel} disabled={busy} class="min-w-[120px]">
				Cancel
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
