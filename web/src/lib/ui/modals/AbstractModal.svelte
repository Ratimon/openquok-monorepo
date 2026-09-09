<script lang="ts">
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		open?: boolean;
		title?: string;
		description?: string;
		/** Optional secondary line (e.g. item name) shown below the description. */
		itemName?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		loading?: boolean;
		contentClass?: string;
		descriptionClass?: string;
		confirmVariant?: 'red' | 'primary';
		/** When true, cancel appears before confirm (end-aligned on sm+). */
		cancelFirst?: boolean;
		onOpenChange?: (open: boolean) => void;
		onConfirm: () => void;
		onCancel: () => void;
	};

	let {
		open = $bindable(false),
		title = 'Are you sure?',
		description = 'Are you sure you want to close this? Unsaved changes will be lost.',
		itemName,
		confirmLabel = 'Yes, close',
		cancelLabel = 'Cancel',
		loading = false,
		contentClass = 'max-w-sm',
		descriptionClass,
		confirmVariant = 'red',
		cancelFirst = false,
		onOpenChange,
		onConfirm,
		onCancel
	}: Props = $props();

	const confirmButtonClass = $derived(
		confirmVariant === 'primary'
			? 'border-0 bg-primary text-primary-content hover:bg-primary/90'
			: undefined
	);
</script>

<Dialog.Root
	bind:open
	onOpenChange={(nextOpen) => {
		onOpenChange?.(nextOpen);
	}}
>
	<Dialog.Content class={contentClass} showCloseButton={!loading}>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description class={cn('text-base-content/80', descriptionClass)}>
				{description}
				{#if itemName}
					<span class="mt-2 block truncate text-sm font-medium text-base-content" title={itemName}>
						{itemName}
					</span>
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class={cn('gap-2', cancelFirst ? 'sm:justify-end' : 'mt-4 flex flex-wrap gap-2')}>
			{#if cancelFirst}
				<Button type="button" variant="ghost" onclick={onCancel} disabled={loading}>
					{cancelLabel}
				</Button>
				<Button
					type="button"
					variant={confirmVariant === 'primary' ? 'ghost' : 'red'}
					class={confirmButtonClass}
					disabled={loading}
					onclick={onConfirm}
				>
					{#if loading}
						<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
					{:else}
						{confirmLabel}
					{/if}
				</Button>
			{:else}
				<Button
					type="button"
					variant={confirmVariant === 'primary' ? 'ghost' : 'red'}
					class={confirmButtonClass}
					disabled={loading}
					onclick={onConfirm}
				>
					{#if loading}
						<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
					{:else}
						{confirmLabel}
					{/if}
				</Button>
				<Button type="button" variant="ghost" onclick={onCancel} disabled={loading}>
					{cancelLabel}
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
