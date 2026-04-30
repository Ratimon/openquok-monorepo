<script lang="ts">
	import type { Editor as TiptapEditor } from '@tiptap/core';
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { Placeholder } from '@tiptap/extensions';
	import StarterKit from '@tiptap/starter-kit';

	import { BLOG_IMAGES_BUCKET } from '$lib/blogs/constants/config';
	import {
		buildBlogInlineImageSrc,
		normalizeBlogInlineImagesInHtml
	} from '$lib/blogs/utils';
	import { imageRepository } from '$lib/core/index';
	import { cn } from '$lib/ui/helpers/common';
	import { toast } from '$lib/ui/sonner';

	import ContentEditorMenu from '$lib/ui/editor/ContentEditorMenu.svelte';
	import { ContentEditorBlogImage } from '$lib/ui/editor/extensions/contentEditorBlogImage';

	let element: HTMLElement;
	let editor = $state<TiptapEditor>();

	let currentContent = $state('');
	let currentLength = $state(0);
	/** Avoid wiping the editor when the parent `content` prop has not caught up to our last `onChange` yet. */
	let lastOutgoingContent = $state<string | null>(null);
	/** Blob URL => selected local file (upload later on submit). */
	const pendingInlineImageFiles = new Map<string, File>();

	type Props = {
		content: string;
		dynamicContent?: string;
		onChange: (content: string) => void;
		outputType?: 'html' | 'text';
		class?: string;
		showMenu?: boolean;
		/** Required for inline image upload in the toolbar (blog storage). */
		userId?: string;
		showLength?: boolean;
		maxLength?: number;
		placeholder?: string;
	};

	let {
		content,
		dynamicContent,
		onChange,
		outputType = 'html',
		class: className = '',
		showMenu,
		userId = '',
		showLength,
		maxLength,
		placeholder
	}: Props = $props();

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					link: {
						openOnClick: false,
						HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' }
					}
				}),
				Placeholder.configure({
					placeholder: placeholder || 'Write something...'
				}),
				ContentEditorBlogImage.configure({
					HTMLAttributes: {
						class: 'max-w-full h-auto rounded-md border border-base-300'
					}
				})
			],
			content: outputType === 'html' ? normalizeBlogInlineImagesInHtml(content || '') : (content || ''),
			editorProps: {
				attributes: {
					class: cn(
						'text-sm bg-base-100 border border-base-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]',
						className
					)
				}
			},
			onUpdate: ({ editor }) => {
				handleUpdate();
			},
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			}
		});

		// Initialize content length
		currentContent = content || '';
		currentLength = editor.getText().length;
	});

	function collectBlobSrcsFromHtml(html: string): Set<string> {
		const blobSrcs = new Set<string>();
		if (!html) return blobSrcs;
		const srcRE = /\ssrc\s*=\s*["']([^"']+)["']/gi;
		let match: RegExpExecArray | null;
		while ((match = srcRE.exec(html)) !== null) {
			const src = match[1]?.trim();
			if (src?.startsWith('blob:')) blobSrcs.add(src);
		}
		return blobSrcs;
	}

	function cleanupRemovedPendingBlobUrls(currentHtml: string): void {
		const stillUsed = collectBlobSrcsFromHtml(currentHtml);
		for (const [blobUrl] of pendingInlineImageFiles) {
			if (!stillUsed.has(blobUrl)) {
				pendingInlineImageFiles.delete(blobUrl);
				URL.revokeObjectURL(blobUrl);
			}
		}
	}

	function sanitizeContentForPersistence(html: string): string {
		if (typeof document === 'undefined' || !html.trim()) return html;
		const doc = document.createElement('div');
		doc.innerHTML = html;
		for (const img of Array.from(doc.querySelectorAll('img'))) {
			const storagePath = (img.getAttribute('data-storage-path') ?? '').trim();
			if (storagePath && storagePath !== 'null' && storagePath !== 'undefined') {
				img.setAttribute('src', buildBlogInlineImageSrc(storagePath));
			}
		}
		return doc.innerHTML;
	}

	function insertLocalImagePreview(file: File): void {
		if (!editor) return;
		const blobUrl = URL.createObjectURL(file);
		pendingInlineImageFiles.set(blobUrl, file);
		editor
			.chain()
			.focus()
			.insertContent({
				type: 'image',
				attrs: { src: blobUrl, alt: '', storagePath: null }
			})
			.run();
	}

	export function hasPendingInlineImages(): boolean {
		return pendingInlineImageFiles.size > 0;
	}

	export function getCurrentContent(): string {
		if (!editor) return currentContent;
		if (outputType === 'html') {
			return sanitizeContentForPersistence(editor.getHTML());
		}
		return editor.getText();
	}

	/**
	 * Upload locally inserted preview images and replace `blob:` srcs with storage URLs.
	 * Returns false when upload fails so caller can abort submit.
	 */
	export async function commitPendingInlineImages(): Promise<boolean> {
		if (!editor || pendingInlineImageFiles.size === 0) return true;
		if (!userId) {
			toast.error('Cannot upload content images: user id is missing.');
			return false;
		}

		const html = editor.getHTML();
		const doc = document.createElement('div');
		doc.innerHTML = html;
		const imgs = Array.from(doc.querySelectorAll('img[src]'));
		let uploadedCount = 0;

		for (const img of imgs) {
			const src = (img.getAttribute('src') ?? '').trim();
			if (!src.startsWith('blob:')) continue;
			const file = pendingInlineImageFiles.get(src);
			if (!file) continue;

			const uploadPm = await imageRepository.uploadImage(BLOG_IMAGES_BUCKET, file, userId);
			if (!uploadPm.success || !uploadPm.data?.filePath) {
				toast.error(uploadPm.message || 'Failed to upload an inline content image.');
				return false;
			}

			uploadedCount += 1;
			const uploadedSrc = buildBlogInlineImageSrc(uploadPm.data.filePath);
			img.setAttribute('src', uploadedSrc);
			img.setAttribute('data-storage-path', uploadPm.data.filePath);
			img.setAttribute('alt', '');
			pendingInlineImageFiles.delete(src);
			URL.revokeObjectURL(src);
		}

		if (uploadedCount > 0) {
			toast.success(
				uploadedCount === 1
					? 'Inline image uploaded successfully.'
					: `${uploadedCount} inline images uploaded successfully.`
			);
		}

		const nextHtml = doc.innerHTML;
		if (nextHtml !== html) {
			editor.commands.setContent(nextHtml);
			lastOutgoingContent = nextHtml;
			currentContent = nextHtml;
			currentLength = editor.getText().length;
			onChange(nextHtml);
		}
		return true;
	}

	function handleUpdate() {
		if (!editor) return;

		let newContent = outputType === 'html' ? editor.getHTML() : editor.getText();

		// Clean up empty paragraphs and normalize content
		if (outputType === 'html') {
			// Remove empty paragraphs that only contain <p></p>
			newContent = newContent.replace(/<p><\/p>/g, '');
			// Remove consecutive empty paragraphs
			newContent = newContent.replace(/(<p><\/p>)+/g, '');
			// If content is completely empty, return an empty string
			if (newContent === '<p></p>') {
				newContent = '';
			}
		}

		lastOutgoingContent = newContent;
		currentContent = newContent;
		currentLength = editor.getText().length;
		if (outputType === 'html') {
			cleanupRemovedPendingBlobUrls(newContent);
		}
		onChange(newContent);
	}

	$effect(() => {
		if (editor && dynamicContent) {
			const effective =
				outputType === 'html' ? normalizeBlogInlineImagesInHtml(dynamicContent) : dynamicContent;
			editor.commands.setContent(effective);
			handleUpdate();
		}
	});

	// Watch for content prop changes and update editor
	$effect(() => {
		if (editor && content !== undefined) {
			if (content === lastOutgoingContent) {
				lastOutgoingContent = null;
				return;
			}
			// Get current editor content in the same format as the prop
			const editorContent = outputType === 'html' ? editor.getHTML() : editor.getText();

			// Normalize content for comparison
			// For HTML, compare as-is (whitespace can be meaningful)
			// For text, trim whitespace for comparison
			let normalizedContent: string;
			let normalizedEditorContent: string;

			if (outputType === 'html') {
				// For HTML, normalize empty paragraphs for comparison
				normalizedContent = (content || '').replace(/<p><\/p>/g, '').trim();
				normalizedEditorContent = (editorContent || '').replace(/<p><\/p>/g, '').trim();
			} else {
				normalizedContent = (content || '').trim();
				normalizedEditorContent = (editorContent || '').trim();
			}

			// Only update if content actually changed to avoid unnecessary updates
			if (normalizedContent !== normalizedEditorContent) {
				const effective =
					outputType === 'html' ? normalizeBlogInlineImagesInHtml(content || '') : (content || '');
				editor.commands.setContent(effective);
				currentContent = content || '';
				currentLength = editor.getText().length;
			}
		}
	});

	onDestroy(() => {
		for (const [blobUrl] of pendingInlineImageFiles) {
			URL.revokeObjectURL(blobUrl);
		}
		pendingInlineImageFiles.clear();
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div class="relative">
	{#if editor && showMenu}
		<ContentEditorMenu editor={editor} onInsertLocalImagePreview={insertLocalImagePreview} />
	{/if}

	<div bind:this={element} class="content-editor min-h-[200px]"></div>

	{#if showLength}
		<p class="float-right mr-1 mt-1 text-xs italic text-primary">
			<span class={currentLength > (maxLength || 160) ? 'text-error' : ''}>
				{`${currentLength} / ${maxLength || 160}`}
			</span>
		</p>
	{/if}
</div>

<style>
	/* Set minimum height for the editor */
	:global(.content-editor .ProseMirror) {
		min-height: 100px;
	}

	/* Inline / block images (plain <img> from HTML + node view preview) */
	:global(.content-editor .ProseMirror img),
	:global(.content-editor .content-editor-image-img) {
		max-width: 100%;
		height: auto;
		display: block;
		border-radius: 0.375rem;
	}

	:global(.content-editor .content-editor-image-wrap) {
		position: relative;
		display: block;
		width: fit-content;
		max-width: 100%;
		margin: 0.5rem 0;
	}

	:global(.content-editor .content-editor-image-delete) {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border-radius: 9999px;
		border: 2px solid oklch(var(--bc) / 0.55);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		/* Readable on both light and dark / busy photo backgrounds */
		box-shadow:
			0 0 0 1px oklch(var(--bc) / 0.12),
			0 2px 10px rgb(0 0 0 / 0.35);
	}

	:global(.content-editor .content-editor-image-delete:hover) {
		background: oklch(var(--er) / 0.2);
		border-color: oklch(var(--er) / 0.85);
		color: oklch(var(--er));
		box-shadow:
			0 0 0 1px oklch(var(--er) / 0.35),
			0 2px 10px rgb(0 0 0 / 0.3);
	}

	:global(.content-editor .content-editor-image-delete:focus-visible) {
		outline: 2px solid oklch(var(--p));
		outline-offset: 2px;
	}

	/* Ensure lists display with markers in the editor */
	:global(.content-editor .ProseMirror ul),
	:global(.content-editor ul),
	:global(.content-editor ul[data-type='taskList']) {
		list-style-type: disc !important;
		padding-left: 1.5rem !important;
		margin: 0.5rem 0 !important;
	}

	:global(.content-editor .ProseMirror ul li),
	:global(.content-editor ul li) {
		list-style-type: disc !important;
		margin: 0.25rem 0 !important;
		display: list-item !important;
	}

	:global(.content-editor .ProseMirror ol),
	:global(.content-editor ol) {
		list-style-type: decimal !important;
		padding-left: 1.5rem !important;
		margin: 0.5rem 0 !important;
	}

	:global(.content-editor .ProseMirror ol li),
	:global(.content-editor ol li) {
		list-style-type: decimal !important;
		margin: 0.25rem 0 !important;
		display: list-item !important;
	}

	/* Links */
	:global(.content-editor .ProseMirror a),
	:global(.content-editor a) {
		color: oklch(var(--p));
		text-decoration: underline;
		cursor: pointer;
	}

	:global(.content-editor .ProseMirror a:hover),
	:global(.content-editor a:hover) {
		text-decoration-thickness: 2px;
	}

	/* Nested lists */
	:global(.content-editor .ProseMirror ul ul),
	:global(.content-editor .ProseMirror ol ol),
	:global(.content-editor .ProseMirror ul ol),
	:global(.content-editor .ProseMirror ol ul),
	:global(.content-editor ul ul),
	:global(.content-editor ol ol),
	:global(.content-editor ul ol),
	:global(.content-editor ol ul) {
		margin-top: 0.25rem !important;
		margin-bottom: 0.25rem !important;
	}
</style>

