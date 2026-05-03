<script lang="ts">
	import type { SetProgrammerModel } from '$lib/sets';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		open?: boolean;
		sets: SetProgrammerModel[];
		onPick: (row: SetProgrammerModel) => void;
		onContinueWithout: () => void;
		onDismiss: () => void;
	};

	let {
		open = $bindable(false),
		sets,
		onPick,
		onContinueWithout,
		onDismiss
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Select a set</Dialog.Title>
			<Dialog.Description>
				Load a saved combination of channels and draft content, or continue without one.
			</Dialog.Description>
		</Dialog.Header>

		<div class="max-h-60 space-y-2 overflow-y-auto py-3">
			{#each sets as row (row.id)}
				<button
					type="button"
					class="border-base-300 hover:bg-base-200/80 w-full rounded-lg border px-3 py-2.5 text-left transition-colors"
					onclick={() => onPick(row)}
				>
					<div class="text-base-content font-medium">
						{row.name}</div>
				</button>
			{/each}
		</div>

		<Dialog.Footer class="flex flex-col gap-2 sm:flex-row sm:justify-between">
			<Button type="button" variant="ghost" class="order-2 sm:order-1" onclick={() => onDismiss()}>
				Cancel
			</Button>
			<Button type="button" variant="secondary" class="order-1 sm:order-2" onclick={() => onContinueWithout()}>
				Continue without set
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
