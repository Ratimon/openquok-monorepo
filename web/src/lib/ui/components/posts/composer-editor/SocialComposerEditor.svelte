<script lang="ts">
	import type { Editor as TiptapEditor } from '@tiptap/core';
	import type { IntegrationEditorMode } from '$lib/integrations/integrationEditorMode';

	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '@tiptap/core';

	import {
		buildComposerEditorExtensions,
		type ComposerMentionExtensionConfig
	} from '$lib/ui/components/posts/composer-editor/buildComposerEditorExtensions';
	import { plainTextToComposerHtml } from '$lib/ui/components/posts/composer-editor/plainTextToComposerHtml';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		mode: IntegrationEditorMode;
		content?: string;
		disabled?: boolean;
		placeholder?: string;
		compact?: boolean;
		comments?: boolean;
		class?: string;
		onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
		mentionConfig?: ComposerMentionExtensionConfig | null;
	};

	let {
		mode,
		content = $bindable(''),
		disabled = false,
		placeholder = 'Write something…',
		compact = false,
		comments = false,
		class: className = '',
		onHistoryChange = undefined,
		mentionConfig = null
	}: Props = $props();

	let element = $state.raw<HTMLElement | undefined>();
	let editor = $state<TiptapEditor | undefined>();
	let lastOutgoingContent = $state<string | null>(null);

	const minHeightClass = $derived(
		compact ? 'min-h-[4.5rem]' : comments ? 'min-h-[140px]' : 'min-h-[140px] sm:min-h-[180px]'
	);

	function normalizeEditorHtml(html: string): string {
		let next = html.replace(/<p><\/p>/g, '');
		if (next === '<p></p>') return '';
		return next;
	}

	function notifyHistoryChange() {
		if (!editor) return;
		onHistoryChange?.({
			canUndo: editor.can().undo(),
			canRedo: editor.can().redo()
		});
	}

	function handleUpdate() {
		if (!editor) return;
		const next = normalizeEditorHtml(editor.getHTML());
		lastOutgoingContent = next;
		content = next;
		notifyHistoryChange();
	}

	onMount(() => {
		const initial = plainTextToComposerHtml(content || '');
		editor = new Editor({
			element,
			extensions: buildComposerEditorExtensions(mode, placeholder, mentionConfig),
			content: initial,
			editable: !disabled,
			editorProps: {
				attributes: {
					class: cn(
						'max-h-[320px] w-full overflow-y-auto border-0 bg-transparent px-3 pt-2 pb-2 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none',
						minHeightClass,
						className
					)
				}
			},
			onUpdate: () => handleUpdate(),
			onTransaction: () => {
				editor = editor;
				notifyHistoryChange();
			}
		});
		notifyHistoryChange();
	});

	$effect(() => {
		if (!editor) return;
		editor.setEditable(!disabled);
	});

	$effect(() => {
		if (!editor || content === undefined) return;
		if (content === lastOutgoingContent) {
			lastOutgoingContent = null;
			return;
		}
		const current = normalizeEditorHtml(editor.getHTML());
		const incoming = normalizeEditorHtml(plainTextToComposerHtml(content || ''));
		if (current !== incoming) {
			editor.commands.setContent(incoming);
			lastOutgoingContent = incoming;
			notifyHistoryChange();
		}
	});

	export function getEditor(): TiptapEditor | undefined {
		return editor;
	}

	export function focusEditor(): void {
		editor?.commands.focus();
	}

	export function insertAtCursor(text: string): void {
		if (!editor || !text) return;
		editor.chain().focus().insertContent(text).run();
	}

	export function appendContent(text: string): void {
		if (!editor || !text) return;
		const doc = editor.getHTML().trim();
		if (!doc) {
			editor.commands.setContent(plainTextToComposerHtml(text));
			return;
		}
		editor.chain().focus('end').insertContent(plainTextToComposerHtml(text)).run();
	}

	export function replaceContent(text: string): void {
		if (!editor) return;
		editor.commands.setContent(plainTextToComposerHtml(text || ''));
	}

	export function canUndo(): boolean {
		return editor?.can().undo() ?? false;
	}

	export function canRedo(): boolean {
		return editor?.can().redo() ?? false;
	}

	export function undo(): void {
		editor?.chain().focus().undo().run();
	}

	export function redo(): void {
		editor?.chain().focus().redo().run();
	}

	onDestroy(() => {
		editor?.destroy();
		editor = undefined;
	});
</script>

<div
	class="social-composer-editor min-w-0 {disabled ? 'pointer-events-none opacity-60' : ''}"
	bind:this={element}
></div>

<style>
	:global(.social-composer-editor .ProseMirror) {
		outline: none;
	}

	:global(.social-composer-editor .ProseMirror p) {
		margin: 0;
	}

	:global(.social-composer-editor .ProseMirror p + p) {
		margin-top: 0.5rem;
	}

	:global(.social-composer-editor .ProseMirror ul),
	:global(.social-composer-editor .ProseMirror ol) {
		padding-left: 1.25rem;
		margin: 0.35rem 0;
	}

	:global(.social-composer-editor .ProseMirror a) {
		color: oklch(var(--p));
		text-decoration: underline;
	}

	:global(.social-composer-editor .ProseMirror h1) {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0.5rem 0 0.25rem;
	}

	:global(.social-composer-editor .ProseMirror h2) {
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0.5rem 0 0.25rem;
	}

	:global(.social-composer-editor .ProseMirror h3) {
		font-size: 1rem;
		font-weight: 600;
		margin: 0.35rem 0 0.2rem;
	}

	:global(.social-composer-editor .ProseMirror .composer-mention) {
		color: oklch(var(--p));
		font-weight: 500;
	}
</style>
