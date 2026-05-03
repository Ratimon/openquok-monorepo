<script lang="ts">
	import { icons } from '$data/icons';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		open?: boolean;
		channelName: string;
		busy?: boolean;
		onConfirm: () => void | Promise<void>;
		onCancel: () => void;
	};

	let {
		open = $bindable(false),
		channelName,
		busy = false,
		onConfirm,
		onCancel
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Delete channel?</Dialog.Title>
			<Dialog.Description>
				This disconnects <strong>{channelName}</strong> from this workspace. You can add it again later.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="gap-2 sm:justify-end">
			<Button type="button" variant="ghost" onclick={onCancel} disabled={busy}>
				Cancel</Button>
			<Button
				type="button"
				variant="ghost"
				class="border-0 bg-error text-error-content hover:bg-error/90"
				disabled={busy}
				onclick={() => void onConfirm()}
			>
				{#if busy}
					<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				{:else}
					Remove
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
