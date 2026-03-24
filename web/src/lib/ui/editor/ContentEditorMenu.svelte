<script lang="ts">
	import type { Editor as TiptapEditor } from '@tiptap/core';

	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ContentEditorMenuButton from '$lib/ui/editor/ContentEditorMenuButton.svelte';
	import ContentEditorMenuButtonImage from '$lib/ui/editor/ContentEditorMenuButtonImage.svelte';

	type Props = {
		editor: TiptapEditor;
		onInsertLocalImagePreview: (file: File) => void;
	};

	let { editor, onInsertLocalImagePreview }: Props = $props();

	function handleLinkClick() {
		const { href } = editor.getAttributes('link');
		if (href) {
			const url = window.prompt('Edit link URL:', href);
			if (url === null) return;
			if (url === '') {
				editor.chain().focus().extendMarkRange('link').unsetLink().run();
			} else {
				editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
			}
		} else {
			const url = window.prompt('Enter link URL:', 'https://');
			if (url === null || url === '') return;
			const href = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
			editor.chain().focus().setLink({ href }).run();
		}
	}
</script>

<div class="sticky -top-4 z-10 flex gap-2 rounded-md border border-base-300 bg-info/20 shadow-sm transition-all">
	<ContentEditorMenuButton
		editor={editor}
		onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
		name="heading"
		attributes={{ level: 2 }}
	>
		<AbstractIcon name={icons.Heading2.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
		name="heading"
		attributes={{ level: 3 }}
	>
		<AbstractIcon name={icons.Heading3.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton editor={editor} onClick={() => editor.chain().focus().toggleBold().run()} name="bold">
		<AbstractIcon name={icons.Bold.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		onClick={() => editor.chain().focus().toggleItalic().run()}
		name="italic"
	>
		<AbstractIcon name={icons.Italic.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton editor={editor} onClick={handleLinkClick} name="link">
		<AbstractIcon name={icons.Link.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButtonImage editor={editor} {onInsertLocalImagePreview}>
		<AbstractIcon name={icons.Image.name} width="18" height="18" />
	</ContentEditorMenuButtonImage>

	<ContentEditorMenuButton
		editor={editor}
		disabled={!editor.isActive('image')}
		onClick={() => editor.chain().focus().deleteSelection().run()}
		name="image"
	>
		<AbstractIcon name={icons.Trash.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		onClick={() => editor.chain().focus().toggleBlockquote().run()}
		name="blockquote"
	>
		<AbstractIcon name={icons.TextQuote.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		onClick={() => editor.chain().focus().toggleBulletList().run()}
		name="bullet-list"
	>
		<AbstractIcon name={icons.List.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton
		editor={editor}
		onClick={() => editor.chain().focus().toggleOrderedList().run()}
		name="ordered-list"
	>
		<AbstractIcon name={icons.ListOrdered.name} width="18" height="18" />
	</ContentEditorMenuButton>

	<ContentEditorMenuButton editor={editor} onClick={() => editor.chain().focus().clearNodes().run()} name="clear">
		<AbstractIcon name={icons.Undo2.name} width="18" height="18" />
	</ContentEditorMenuButton>
</div>

