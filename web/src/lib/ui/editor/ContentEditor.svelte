<script lang="ts">
	import type { Editor as TiptapEditor } from '@tiptap/core';
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { Placeholder } from '@tiptap/extensions';
	import StarterKit from '@tiptap/starter-kit';

	import { BLOG_IMAGES_BUCKET } from '$lib/blogs/constants/config';
	import {
		buildBlogInlineImageSrc,
		normalizeBlogContentLinks,
		normalizeBlogInlineImagesInHtml,
		prepareBlogContentForDisplay,
		stripContentEditorMarkupFromBlogHtml
	} from '$lib/blogs/utils';
	import { imageRepository } from '$lib/core/index';
	import { cn } from '$lib/ui/helpers/common';
	import { toast } from '$lib/ui/sonner';

	import ContentEditorMenu from '$lib/ui/editor/ContentEditorMenu.svelte';
	import {
		ContentEditorBlogImage,
		flushPendingBlogImageAlts,
		isBlogImageAltEditing
	} from '$lib/ui/editor/extensions/contentEditorBlogImage';
	import { ContentEditorCodeBlock } from '$lib/ui/editor/extensions/contentEditorCodeBlock';

	let element: HTMLElement;
	let editor = $state<TiptapEditor>();
	/** Bumps on TipTap transactions so the toolbar re-renders without reassigning `editor` (which retriggers $effects). */
	let toolbarRevision = $state(0);

	let currentContent = $state('');
	let currentLength = $state(0);
	/** Last HTML/text pushed to the parent — avoids duplicate onChange during TipTap normalization. */
	let lastNotifiedContent: string | null = null;
	let acceptingEditorUpdates = false;
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
					codeBlock: false,
					link: {
						openOnClick: false
						// rel/target applied in normalizeBlogContentLinks (ExternalLink-aligned)
					}
				}),
				ContentEditorCodeBlock.configure({
					HTMLAttributes: {
						class: 'blog-editor-code-block'
					}
				}),
				Placeholder.configure({
					placeholder: placeholder || 'Write something...'
				}),
				ContentEditorBlogImage.configure({
					HTMLAttributes: {
						class:
							'mx-auto block h-auto w-auto max-h-[min(70vh,26rem)] max-w-full rounded-md border border-base-300'
					}
				})
			],
			content:
				outputType === 'html'
					? normalizeBlogInlineImagesInHtml(prepareBlogContentForDisplay(content || ''))
					: (content || ''),
			editorProps: {
				attributes: {
					class: cn(
						'text-sm bg-base-100 border border-base-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]',
						className
					)
				},
				handlePaste: (_view, event) => {
					if (outputType !== 'html' || !editor) return false;

					const richHtml = event.clipboardData?.getData('text/html')?.trim();
					if (richHtml) return false;

					const plain = event.clipboardData?.getData('text/plain')?.trim();
					if (!plain || !/<\/?[a-z][\s\S]*>/i.test(plain)) return false;

					event.preventDefault();
					editor.commands.insertContent(prepareBlogContentForDisplay(plain));
					return true;
				}
			},
			onUpdate: () => {
				handleUpdate();
			},
			onTransaction: ({ transaction }) => {
				if (!acceptingEditorUpdates) return;
				// Re-render toolbar active states; skip while typing alt (selection noise only).
				if (transaction.docChanged || (transaction.selectionSet && !isBlogImageAltEditing())) {
					toolbarRevision += 1;
				}
			}
		});

		// Initialize content length
		currentContent = content || '';
		currentLength = editor.getText().length;
		lastNotifiedContent = content || '';
		acceptingEditorUpdates = true;
	});

	function collectBlobSrcsFromEditorDoc(): Set<string> {
		const blobSrcs = new Set<string>();
		if (!editor) return blobSrcs;

		editor.state.doc.descendants((node) => {
			if (node.type.name !== 'image') return;
			const src = String(node.attrs.src ?? '').trim();
			if (src.startsWith('blob:')) blobSrcs.add(src);
		});

		return blobSrcs;
	}

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
		for (const src of collectBlobSrcsFromEditorDoc()) {
			stillUsed.add(src);
		}
		for (const [blobUrl] of pendingInlineImageFiles) {
			if (!stillUsed.has(blobUrl)) {
				pendingInlineImageFiles.delete(blobUrl);
				URL.revokeObjectURL(blobUrl);
			}
		}
	}

	function sanitizeContentForPersistence(html: string): string {
		if (!html.trim()) return html;
		let next = stripContentEditorMarkupFromBlogHtml(html);
		if (typeof document !== 'undefined') {
			const doc = document.createElement('div');
			doc.innerHTML = next;
			for (const img of Array.from(doc.querySelectorAll('img'))) {
				const storagePath = (img.getAttribute('data-storage-path') ?? '').trim();
				if (storagePath && storagePath !== 'null' && storagePath !== 'undefined') {
					img.setAttribute('src', buildBlogInlineImageSrc(storagePath));
				}
			}
			next = doc.innerHTML;
		}
		return normalizeBlogContentLinks(next);
	}

	function insertLocalImagePreview(file: File, alt?: string): void {
		if (!editor) return;
		const blobUrl = URL.createObjectURL(file);
		pendingInlineImageFiles.set(blobUrl, file);
		editor
			.chain()
			.focus()
			.insertContent({
				type: 'image',
				attrs: { src: blobUrl, alt: alt?.trim() ?? '', storagePath: null }
			})
			.run();
	}

	export function hasPendingInlineImages(): boolean {
		return pendingInlineImageFiles.size > 0;
	}

	export function getCurrentContent(): string {
		if (!editor) return currentContent;
		if (outputType === 'html') {
			flushPendingBlogImageAlts();
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
		flushPendingBlogImageAlts();
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
			editor.commands.setContent(nextHtml, { emitUpdate: false });
			currentContent = nextHtml;
			currentLength = editor.getText().length;
			lastNotifiedContent = nextHtml;
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

		currentContent = newContent;
		currentLength = editor.getText().length;
		if (outputType === 'html') {
			cleanupRemovedPendingBlobUrls(newContent);
		}
		if (!acceptingEditorUpdates || newContent === lastNotifiedContent) return;
		lastNotifiedContent = newContent;
		onChange(newContent);
	}

	/** Replace editor body from outside (e.g. AI draft). Not wired to the `content` prop echo. */
	export function applyDynamicContent(raw: string): void {
		if (!editor) return;
		const effective =
			outputType === 'html' ? normalizeBlogInlineImagesInHtml(raw) : raw;
		acceptingEditorUpdates = false;
		editor.commands.setContent(effective, { emitUpdate: false });
		currentContent = raw;
		currentLength = editor.getText().length;
		lastNotifiedContent = raw;
		acceptingEditorUpdates = true;
	}

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
		<ContentEditorMenu
			editor={editor}
			toolbarRevision={toolbarRevision}
			onInsertLocalImagePreview={insertLocalImagePreview}
		/>
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

	/* Inline images: cap height so mobile UI screenshots stay readable, not column-wide */
	:global(.content-editor .ProseMirror img),
	:global(.content-editor .content-editor-image-img) {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: min(70vh, 26rem);
		margin-inline: auto;
		border-radius: 0.375rem;
		object-fit: contain;
	}

	:global(.content-editor .content-editor-image-wrap) {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
		max-width: 100%;
		margin: 0.5rem auto;
	}

	:global(.content-editor .content-editor-image-media) {
		position: relative;
		width: fit-content;
		max-width: 100%;
		margin-inline: auto;
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

	:global(.content-editor .content-editor-image-alt-field) {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	:global(.content-editor .content-editor-image-alt-label) {
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.25;
		color: oklch(var(--bc) / 0.75);
	}

	:global(.content-editor .content-editor-image-alt-input) {
		width: 100%;
		padding: 0.375rem 0.5rem;
		border-radius: 0.375rem;
		border: 1px solid oklch(var(--bc) / 0.18);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.75rem;
		line-height: 1.25;
	}

	:global(.content-editor .content-editor-image-alt-input::placeholder) {
		color: oklch(var(--bc) / 0.45);
	}

	:global(.content-editor .content-editor-image-alt-input:focus-visible) {
		outline: 2px solid oklch(var(--p));
		outline-offset: 1px;
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

	/* Blockquotes */
	:global(.content-editor .ProseMirror blockquote),
	:global(.content-editor blockquote) {
		margin: 1rem 0;
		padding: 0.875rem 1rem;
		border-left: 0.25rem solid oklch(var(--p));
		border-radius: 0.5rem;
		background: oklch(var(--b2));
		color: oklch(var(--bc) / 0.88);
		font-style: italic;
	}

	:global(.content-editor .ProseMirror blockquote p),
	:global(.content-editor blockquote p) {
		margin: 0;
	}

	/* Code blocks */
	:global(.content-editor .ProseMirror pre),
	:global(.content-editor pre) {
		margin: 1rem 0;
		padding: 0.875rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid oklch(var(--bc) / 0.15);
		background: oklch(var(--b2));
		overflow-x: auto;
	}

	:global(.content-editor .ProseMirror pre code),
	:global(.content-editor pre code) {
		display: block;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
			'Courier New', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		color: oklch(var(--bc));
		background: transparent;
		padding: 0;
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

