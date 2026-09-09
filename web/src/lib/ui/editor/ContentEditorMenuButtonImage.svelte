<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Editor as TiptapEditor } from '@tiptap/core';

	import { MAX_IMAGE_UPLOAD_BYTES } from '$lib/core/Image.repository.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { toast } from '$lib/ui/sonner';

	import ContentEditorImageAltDialog from '$lib/ui/editor/ContentEditorImageAltDialog.svelte';

	type Props = {
		editor: TiptapEditor;
		onInsertLocalImagePreview: (file: File, alt?: string) => void;
		children: Snippet;
	};

	let { editor, onInsertLocalImagePreview, children }: Props = $props();

	let altDialogOpen = $state(false);
	let selectedFile: File | null = $state(null);
	let fileInput: HTMLInputElement | null = $state(null);

	function resetSelection() {
		selectedFile = null;
		if (fileInput) fileInput.value = '';
	}

	function openFilePicker() {
		fileInput?.click();
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
		altDialogOpen = true;
	}

	function handleAltConfirm(alt: string) {
		if (!selectedFile) {
			toast.error('Please choose an image file first.');
			return;
		}
		onInsertLocalImagePreview(selectedFile, alt);
		altDialogOpen = false;
		resetSelection();
	}

	function handleAltCancel() {
		altDialogOpen = false;
		resetSelection();
	}
</script>

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="hidden"
	onchange={onFileChange}
/>

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
	onclick={openFilePicker}
>
	{@render children()}
</Button>

<ContentEditorImageAltDialog
	bind:open={altDialogOpen}
	mode="insert"
	selectedFilename={selectedFile?.name}
	onConfirm={handleAltConfirm}
	onCancel={handleAltCancel}
/>
