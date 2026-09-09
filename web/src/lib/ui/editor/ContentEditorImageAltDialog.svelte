<script lang="ts">
	import * as Dialog from '$lib/ui/dialog';
	import * as Field from '$lib/ui/field';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Input from '$lib/ui/input/Input.svelte';

	type DialogMode = 'insert' | 'edit';

	type Props = {
		open?: boolean;
		mode: DialogMode;
		initialAlt?: string;
		selectedFilename?: string;
		onConfirm: (alt: string) => void | Promise<void>;
		onCancel: () => void;
	};

	let {
		open = $bindable(false),
		mode,
		initialAlt = '',
		selectedFilename,
		onConfirm,
		onCancel
	}: Props = $props();

	let alt = $state('');

	const title = $derived(mode === 'insert' ? 'Add image' : 'Edit alt text');
	const confirmLabel = $derived(mode === 'insert' ? 'Insert preview' : 'Save');

	$effect(() => {
		if (open) {
			alt = initialAlt ?? '';
		}
	});

	async function submit(e: Event) {
		e.preventDefault();
		await onConfirm(alt.trim());
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{#if mode === 'insert'}
					Upload to blog storage. Add alt text so readers and search engines understand the image.
				{:else}
					Update the description shown to screen readers and search engines.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<form class="mt-4 space-y-4" onsubmit={submit}>
			{#if mode === 'insert' && selectedFilename}
				<p class="text-xs text-base-content/70">
					Selected: {selectedFilename}
				</p>
			{/if}

			<Field.Field>
				<Field.Label for="content-editor-image-alt">Alt text (optional)</Field.Label>
				<Input
					id="content-editor-image-alt"
					type="text"
					autocomplete="off"
					placeholder="Describe what the image shows"
					bind:value={alt}
				/>
				<Field.Description>
					Describe the image for accessibility and SEO. Leave empty only for decorative images.
				</Field.Description>
			</Field.Field>

			{#if mode === 'insert'}
				<p class="text-xs text-base-content/70">
					This inserts a local preview now. The file uploads only when you click Update/Create.
				</p>
			{/if}

			<Dialog.Footer class="gap-2 sm:justify-end">
				<Button type="button" variant="ghost" onclick={() => onCancel()}>
					Cancel
				</Button>
				<Button type="submit">
					{confirmLabel}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
