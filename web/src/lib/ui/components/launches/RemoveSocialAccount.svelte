<script lang="ts">
	import { icons } from '$data/icon';
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		open?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	};

	let { open = $bindable(false), onConfirm, onCancel }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="w-[min(92vw,720px)] max-w-[min(92vw,720px)]" showCloseButton={false}>
		<div class="flex items-start justify-between gap-3">
			<Dialog.Header class="space-y-2 text-start">
				<Dialog.Title class="text-2xl font-semibold">Remove Social Account</Dialog.Title>
				<Dialog.Description class="text-base text-base-content/80">
					Are you sure you want to remove this social from scheduling?
				</Dialog.Description>
			</Dialog.Header>
			<button
				type="button"
				class="hover:bg-base-200 rounded-md p-2 text-base-content/70 outline-none focus-visible:ring-2 focus-visible:ring-primary"
				onclick={onCancel}
				aria-label="Close"
			>
				<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
			</button>
		</div>

		<div class="mt-6 flex flex-wrap gap-3">
			<Button type="button" variant="primary" onclick={onConfirm} class="min-w-[120px]">Yes</Button>
			<Button type="button" variant="secondary" onclick={onCancel} class="min-w-[120px]">No</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

