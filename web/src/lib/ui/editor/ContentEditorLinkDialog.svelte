<script lang="ts">
	import * as Dialog from '$lib/ui/dialog';
	import * as Field from '$lib/ui/field';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Input from '$lib/ui/input/Input.svelte';

	type DialogMode = 'insert' | 'edit';

	type Props = {
		open?: boolean;
		mode: DialogMode;
		initialHref?: string;
		placeholder?: string;
		onConfirm: (href: string) => void | Promise<void>;
		onCancel: () => void;
	};

	let {
		open = $bindable(false),
		mode,
		initialHref = '',
		placeholder = 'https://example.com',
		onConfirm,
		onCancel
	}: Props = $props();

	let href = $state('');

	const title = $derived(mode === 'insert' ? 'Insert link' : 'Edit link');
	const confirmLabel = $derived(mode === 'insert' ? 'Apply link' : 'Save');

	$effect.pre(() => {
		if (!open) return;
		href = initialHref ?? '';
	});

	async function submit(e: Event) {
		e.preventDefault();
		await onConfirm(href);
	}

	function removeLink() {
		void onConfirm('');
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{#if mode === 'insert'}
					Select text in the editor, then enter a full URL (including this site’s pages).
				{:else}
					Update the link destination, or remove the link below.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<form class="mt-4 space-y-4" onsubmit={submit}>
			<Field.Field>
				<Field.Label for="content-editor-link-href">URL</Field.Label>
				<Input
					id="content-editor-link-href"
					type="text"
					inputmode="url"
					autocomplete="off"
					{placeholder}
					bind:value={href}
				/>
				<Field.Description>
					Use a full <code class="text-xs">https://…</code> address, or
					<code class="text-xs">mailto:</code> / <code class="text-xs">tel:</code> links.
				</Field.Description>
			</Field.Field>

			<Dialog.Footer class="flex flex-wrap gap-2 sm:justify-end">
				{#if mode === 'edit'}
					<Button type="button" variant="outline" class="mr-auto" onclick={removeLink}>
						Remove link
					</Button>
				{/if}
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
