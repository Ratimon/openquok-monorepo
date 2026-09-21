<script lang="ts">
	import type { Editor as TiptapEditor } from '@tiptap/core';

	import { icons } from '$data/icons';

	import { normalizeContentEditorLinkHref } from '$lib/ui/editor/normalizeContentEditorLinkHref';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ContentEditorImageAltDialog from '$lib/ui/editor/ContentEditorImageAltDialog.svelte';
	import ContentEditorMenuButton from '$lib/ui/editor/ContentEditorMenuButton.svelte';
	import ContentEditorMenuButtonImage from '$lib/ui/editor/ContentEditorMenuButtonImage.svelte';
	import {
		BLOG_CODE_BLOCK_LANGUAGES,
		DEFAULT_BLOG_CODE_BLOCK_LANGUAGE,
		type BlogCodeBlockLanguageId
	} from '$lib/ui/editor/extensions/contentEditorCodeBlock';

	type Props = {
		editor: TiptapEditor;
		toolbarRevision?: number;
		onInsertLocalImagePreview: (file: File, alt?: string) => void;
	};

	let { editor, toolbarRevision = 0, onInsertLocalImagePreview }: Props = $props();

	let altDialogOpen = $state(false);
	let imageAlt = $derived.by(() => {
		void toolbarRevision;
		return editor.getAttributes('image').alt ?? '';
	});
	let imageSelected = $derived.by(() => {
		void toolbarRevision;
		return editor.isActive('image');
	});
	let codeBlockActive = $derived.by(() => {
		void toolbarRevision;
		return editor.isActive('codeBlock');
	});
	let codeBlockLanguage = $derived.by(() => {
		void toolbarRevision;
		const language = editor.getAttributes('codeBlock').language;
		return (language as BlogCodeBlockLanguageId | null) ?? DEFAULT_BLOG_CODE_BLOCK_LANGUAGE;
	});

	function handleLinkClick() {
		const { href } = editor.getAttributes('link');
		if (href) {
			const url = window.prompt('Edit link URL:', href);
			if (url === null) return;
			if (url === '') {
				editor.chain().focus().extendMarkRange('link').unsetLink().run();
				return;
			}
			const nextHref = normalizeContentEditorLinkHref(url);
			if (!nextHref) return;
			editor.chain().focus().extendMarkRange('link').setLink({ href: nextHref }).run();
			return;
		}
		const url = window.prompt('Enter link URL:', '/tools/skill-builder');
		if (url === null) return;
		const nextHref = normalizeContentEditorLinkHref(url);
		if (!nextHref) return;
		editor.chain().focus().setLink({ href: nextHref }).run();
	}

	function handleAltEditConfirm(alt: string) {
		editor.chain().focus().updateAttributes('image', { alt }).run();
		altDialogOpen = false;
	}

	function handleAltEditCancel() {
		altDialogOpen = false;
	}

	function handleCodeBlockClick() {
		if (editor.isActive('codeBlock')) {
			editor.chain().focus().toggleCodeBlock().run();
			return;
		}
		editor
			.chain()
			.focus()
			.toggleCodeBlock()
			.updateAttributes('codeBlock', { language: DEFAULT_BLOG_CODE_BLOCK_LANGUAGE })
			.run();
	}

	function handleCodeLanguageChange(event: Event) {
		const next = (event.currentTarget as HTMLSelectElement).value as BlogCodeBlockLanguageId;
		if (!editor.isActive('codeBlock')) {
			editor
				.chain()
				.focus()
				.toggleCodeBlock()
				.updateAttributes('codeBlock', { language: next })
				.run();
			return;
		}
		editor.chain().focus().updateAttributes('codeBlock', { language: next }).run();
	}
</script>

<div class="sticky -top-4 z-10 flex gap-2 rounded-md border border-base-300 bg-info/20 shadow-sm transition-all">
	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
		name="heading"
		title="Heading 2"
		attributes={{ level: 2 }}
	>
		<AbstractIcon name={icons.Heading2.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
		name="heading"
		title="Heading 3"
		attributes={{ level: 3 }}
	>
		<AbstractIcon name={icons.Heading3.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().toggleBlockquote().run()}
		name="blockquote"
		title="Blockquote"
	>
		<AbstractIcon name={icons.TextQuote.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().toggleBold().run()}
		name="bold"
	>
		<AbstractIcon name={icons.Bold.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().toggleItalic().run()}
		name="italic"
	>
		<AbstractIcon name={icons.Italic.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={handleLinkClick}
		name="link"
	>
		<AbstractIcon name={icons.Link.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButtonImage editor={editor} {onInsertLocalImagePreview}>
		<AbstractIcon name={icons.Image.name} width="18" height="18" />
	</ContentEditorMenuButtonImage>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		disabled={!imageSelected}
		onClick={() => (altDialogOpen = true)}
		name="image"
		title="Edit alt text"
	>
		<AbstractIcon name={icons.TextSearch.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		disabled={!imageSelected}
		onClick={() => editor.chain().focus().deleteSelection().run()}
		name="image"
	>
		<AbstractIcon name={icons.Trash.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={handleCodeBlockClick}
		name="codeBlock"
		title="Code block"
	>
		<AbstractIcon name={icons.Code.name} width="18" height="18" />
	</ContentEditorMenuButton>

	{#if codeBlockActive}
		<label class="sr-only" for="blog-editor-code-language">Code language</label>
		<select
			id="blog-editor-code-language"
			class="h-9 min-w-[7.5rem] rounded-md border border-base-300 bg-base-100 px-2 text-xs text-base-content"
			value={codeBlockLanguage}
			onchange={handleCodeLanguageChange}
		>
			{#each BLOG_CODE_BLOCK_LANGUAGES as option (option.id)}
				<option value={option.id}>{option.label}</option>
			{/each}
		</select>
	{/if}

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().toggleBulletList().run()}
		name="bullet-list"
	>
		<AbstractIcon name={icons.List.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().toggleOrderedList().run()}
		name="ordered-list"
	>
		<AbstractIcon name={icons.ListOrdered.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		toolbarRevision={toolbarRevision}
		onClick={() => editor.chain().focus().clearNodes().run()}
		name="clear"
	>
		<AbstractIcon name={icons.Undo2.name} width="18" height="18" />
	</ContentEditorMenuButton>
</div>

<ContentEditorImageAltDialog
	bind:open={altDialogOpen}
	mode="edit"
	initialAlt={imageAlt}
	onConfirm={handleAltEditConfirm}
	onCancel={handleAltEditCancel}
/>

