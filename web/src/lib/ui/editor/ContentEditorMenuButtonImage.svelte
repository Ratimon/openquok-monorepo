<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Editor as TiptapEditor } from '@tiptap/core';

	import { MAX_IMAGE_UPLOAD_BYTES } from '$lib/core/Image.repository.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { cn } from '$lib/ui/helpers/common';
	import toast from 'svelte-hot-french-toast';

	type Props = {
		editor: TiptapEditor;
		onInsertLocalImagePreview: (file: File) => void;
		children: Snippet;
	};

	let { editor, onInsertLocalImagePreview, children }: Props = $props();

	let open = $state(false);
	let selectedFile: File | null = $state(null);
	let fileInput: HTMLInputElement | null = $state(null);

	function resetDialog() {
		selectedFile = null;
		if (fileInput) fileInput.value = '';
	}

	function closeDialog() {
		open = false;
		resetDialog();
	}

	function onFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Please choose an image file.');
			input.value = '';
			return;
		}
		if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
			toast.error(`Image must be ${MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)} MB or smaller.`);
			input.value = '';
			return;
		}

		selectedFile = file;
	}

	function insertSelectedFileAsPreview() {
		if (!selectedFile) {
			toast.error('Please choose an image file first.');
			return;
		}
		onInsertLocalImagePreview(selectedFile);
		closeDialog();
	}
</script>
<Dialog.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) resetDialog();
	}}
>
	<Button
		type="button"
		variant="outline"
		class={cn(
			'group border-r border-base-300 p-2 first-of-type:rounded-l-md last-of-type:rounded-r-md last-of-type:border-r-0 disabled:cursor-not-allowed disabled:hover:bg-base-200',
			editor.isActive('image')
				? 'bg-base-content text-base-100 hover:bg-base-100 hover:text-base-content'
				: 'bg-base-100 text-base-content hover:bg-base-content hover:text-base-100'
		)}
		title="Image"
		onclick={() => (open = true)}
	>
		{@render children()}
	</Button>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add image</Dialog.Title>
		<Dialog.Description>Upload to blog storage.</Dialog.Description>
		</Dialog.Header>

		<div class="w-full space-y-3 pt-1">
			<input
				bind:this={fileInput}
				type="file"
				accept="image/*"
				class="file-input file-input-bordered w-full"
				onchange={onFileChange}
			/>
			{#if selectedFile}
				<p class="text-xs text-base-content/70">
					Selected: {selectedFile.name}</p>
			{/if}
			<p class="text-xs text-base-content/70">
				This inserts a local preview now. The file uploads only when you click Update/Create.
			</p>
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => closeDialog()}>Cancel</Button>
				<Button type="button" onclick={insertSelectedFileAsPreview}>Insert preview</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
