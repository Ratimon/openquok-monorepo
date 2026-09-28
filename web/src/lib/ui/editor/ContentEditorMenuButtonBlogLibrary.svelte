<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Editor as TiptapEditor } from '@tiptap/core';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';

	import BlogImageLibraryModal from '$lib/ui/components/blog-post/BlogImageLibraryModal.svelte';
	import ContentEditorImageAltDialog from '$lib/ui/editor/ContentEditorImageAltDialog.svelte';

	type Props = {
		editor: TiptapEditor;
		onInsertImageFromLibrary: (storagePath: string, alt?: string) => void;
		beforeInlineImageAction?: () => boolean;
		children: Snippet;
	};

	let { editor, onInsertImageFromLibrary, beforeInlineImageAction, children }: Props = $props();

	let libraryOpen = $state(false);
	let altDialogOpen = $state(false);
	let selectedStoragePath = $state('');

	const selectedFilename = $derived(
		selectedStoragePath ? filenameFromStoragePath(selectedStoragePath) : undefined
	);

	function filenameFromStoragePath(storagePath: string): string {
		const trimmed = storagePath.trim();
		const slash = trimmed.lastIndexOf('/');
		return slash >= 0 ? trimmed.slice(slash + 1) : trimmed;
	}

	function openLibrary() {
		if (beforeInlineImageAction && !beforeInlineImageAction()) return;
		libraryOpen = true;
	}

	function handleLibrarySelect(storagePath: string) {
		selectedStoragePath = storagePath;
		altDialogOpen = true;
	}

	function handleAltConfirm(alt: string) {
		const path = selectedStoragePath.trim();
		if (!path) return;
		onInsertImageFromLibrary(path, alt);
		altDialogOpen = false;
		selectedStoragePath = '';
	}

	function handleAltCancel() {
		altDialogOpen = false;
		selectedStoragePath = '';
	}
</script>

<Button
	type="button"
	variant="outline"
	class={cn(
		'group border-r border-base-300 p-2 first-of-type:rounded-l-md last-of-type:rounded-r-md last-of-type:border-r-0 disabled:cursor-not-allowed disabled:hover:bg-base-200',
		editor.isActive('image')
			? 'bg-base-content text-base-100 hover:bg-base-100 hover:text-base-content'
			: 'bg-base-100 text-base-content hover:bg-base-content hover:text-base-100'
	)}
	title="Insert image from blog library"
	onclick={openLibrary}
>
	{@render children()}
</Button>

<BlogImageLibraryModal bind:open={libraryOpen} onSelect={handleLibrarySelect} />

<ContentEditorImageAltDialog
	bind:open={altDialogOpen}
	mode="insert"
	selectedFilename={selectedFilename}
	onConfirm={handleAltConfirm}
	onCancel={handleAltCancel}
/>
