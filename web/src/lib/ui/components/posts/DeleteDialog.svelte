<script lang="ts">
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		open?: boolean;
		title?: string;
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
	};

	let {
		open = $bindable(false),
		title = 'Are you sure?',
		description = 'Are you sure you want to close this? Unsaved changes will be lost.',
		confirmLabel = 'Yes, close',
		cancelLabel = 'Cancel',
		onConfirm,
		onCancel
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{description}</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-4 flex flex-wrap gap-2">
			<Button type="button" variant="primary" onclick={onConfirm}>
				{confirmLabel}</Button>
			<Button type="button" variant="secondary" onclick={onCancel}>
				{cancelLabel}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
