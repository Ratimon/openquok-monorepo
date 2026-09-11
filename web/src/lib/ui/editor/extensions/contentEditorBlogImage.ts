import type { Editor } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';

/** Pending alt sync callbacks registered by each inline image node view (flush on blur/save). */
const pendingAltSyncCallbacks = new Set<() => void>();

let blogImageAltEditingCount = 0;

/** True while any inline image alt `<input>` in the blog editor has focus. */
export function isBlogImageAltEditing(): boolean {
	return blogImageAltEditingCount > 0;
}

function beginBlogImageAltEditing() {
	blogImageAltEditingCount += 1;
}

function endBlogImageAltEditing() {
	blogImageAltEditingCount = Math.max(0, blogImageAltEditingCount - 1);
}

/** Push pending alt values from node-view inputs into the ProseMirror doc (call before getHTML). */
export function flushPendingBlogImageAlts(): void {
	for (const sync of pendingAltSyncCallbacks) {
		sync();
	}
}

function syncAltToDocument(editor: Editor, getPos: () => number | undefined, alt: string) {
	const pos = getPos();
	if (typeof pos !== 'number') return;
	const node = editor.state.doc.nodeAt(pos);
	if (!node || node.type.name !== 'image') return;
	if ((node.attrs.alt ?? '') === alt) return;

	const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
		...node.attrs,
		alt
	});
	tr.setMeta('addToHistory', false);
	editor.view.dispatch(tr);
}

function nodeViewTarget(mutation: { target?: Node | null }): Node | null {
	return mutation.target ?? null;
}

/**
 * Blog/content editor image: visible preview + inline remove control + alt field.
 * Serialized HTML stays a plain `<img>` (attrs only); the wrapper exists only in the editor node view.
 */
export const ContentEditorBlogImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			alt: {
				default: '',
				parseHTML: (element) => element.getAttribute('alt') ?? '',
				renderHTML: (attributes) => ({ alt: attributes.alt ?? '' })
			},
			storagePath: {
				default: null,
				parseHTML: (element) => {
					const v = element.getAttribute('data-storage-path');
					if (!v || v === 'null' || v === 'undefined') return null;
					return v;
				},
				renderHTML: (attributes) =>
					attributes.storagePath ? { 'data-storage-path': String(attributes.storagePath) } : {}
			}
		};
	},

	addNodeView() {
		return ({ node, editor, getPos }) => {
			const wrap = document.createElement('div');
			wrap.className = 'content-editor-image-wrap';
			wrap.draggable = true;
			wrap.contentEditable = 'false';
			wrap.dataset.nodeView = 'blog-image';

			const img = document.createElement('img');
			img.className = 'content-editor-image-img';
			img.draggable = false;
			img.alt = node.attrs.alt ?? '';
			if (node.attrs.title) img.title = String(node.attrs.title);
			if (node.attrs.width != null) img.width = Number(node.attrs.width);
			if (node.attrs.height != null) img.height = Number(node.attrs.height);
			if (node.attrs.storagePath) img.setAttribute('data-storage-path', String(node.attrs.storagePath));
			img.src = node.attrs.src ?? '';

			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'content-editor-image-delete';
			btn.setAttribute('aria-label', 'Remove image');
			btn.textContent = '×';
			btn.draggable = false;
			btn.addEventListener('mousedown', (e) => e.preventDefault());
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				const pos = getPos();
				if (typeof pos !== 'number') return;
				const tr = editor.state.tr.delete(pos, pos + node.nodeSize);
				editor.view.dispatch(tr);
				editor.commands.focus();
			});

			const altInputId = `content-editor-image-alt-${Math.random().toString(36).slice(2, 9)}`;

			const altLabel = document.createElement('label');
			altLabel.className = 'content-editor-image-alt-label';
			altLabel.textContent = 'Alt text';
			altLabel.htmlFor = altInputId;

			const altInput = document.createElement('input');
			altInput.type = 'text';
			altInput.id = altInputId;
			altInput.className = 'content-editor-image-alt-input';
			altInput.placeholder = 'Describe this image for SEO and accessibility';
			altInput.value = node.attrs.alt ?? '';
			altInput.setAttribute('aria-label', 'Image alt text');

			const stopBubble = (e: Event) => e.stopPropagation();

			for (const eventName of ['mousedown', 'mouseup', 'click', 'keydown', 'keyup', 'beforeinput', 'input', 'pointerdown'] as const) {
				altInput.addEventListener(eventName, stopBubble);
				altLabel.addEventListener(eventName, stopBubble);
			}

			const flushAlt = () => syncAltToDocument(editor, getPos, altInput.value);

			const altField = document.createElement('div');
			altField.className = 'content-editor-image-alt-field';
			altField.appendChild(altLabel);
			altField.appendChild(altInput);

			altField.addEventListener(
				'focusin',
				() => {
					beginBlogImageAltEditing();
				},
				true
			);
			altField.addEventListener(
				'focusout',
				(e) => {
					const next = e.relatedTarget;
					if (next instanceof Node && altField.contains(next)) return;
					endBlogImageAltEditing();
					flushAlt();
				},
				true
			);

			pendingAltSyncCallbacks.add(flushAlt);

			wrap.addEventListener('click', (e) => {
				if (e.target === altInput || e.target === altLabel || e.target === btn || altField.contains(e.target as Node)) {
					return;
				}
				const pos = getPos();
				if (typeof pos === 'number') {
					editor.commands.setNodeSelection(pos);
				}
			});

			const media = document.createElement('div');
			media.className = 'content-editor-image-media';
			media.appendChild(img);
			media.appendChild(btn);

			wrap.appendChild(media);
			wrap.appendChild(altField);

			const isInsideAltField = (target: EventTarget | null | undefined): boolean => {
				if (!(target instanceof Node)) return false;
				return altField.contains(target);
			};

			return {
				dom: wrap,
				stopEvent(event) {
					return isInsideAltField(event.target);
				},
				ignoreMutation(mutation) {
					const target = nodeViewTarget(mutation);
					// Selection inside the alt field must be ignored or ProseMirror rewrites the doc.
					if (mutation.type === 'selection' && target && isInsideAltField(target)) {
						return true;
					}
					if (target && altField.contains(target)) {
						return true;
					}
					if (mutation.type === 'attributes' && mutation.target === img) {
						return true;
					}
					return mutation.type !== 'selection';
				},
				update: (updated) => {
					if (updated.type.name !== node.type.name) return false;

					const nextSrc = updated.attrs.src ?? '';
					const currentSrc = img.getAttribute('src') ?? '';
					if (nextSrc && currentSrc !== nextSrc) {
						img.src = nextSrc;
					} else if (!nextSrc && currentSrc.startsWith('blob:')) {
						// Keep local blob preview if the doc attrs briefly lose src during sync.
					}

					if (document.activeElement !== altInput) {
						img.alt = updated.attrs.alt ?? '';
						if (altInput.value !== (updated.attrs.alt ?? '')) {
							altInput.value = updated.attrs.alt ?? '';
						}
					}

					if (updated.attrs.title) {
						img.title = String(updated.attrs.title);
					} else {
						img.removeAttribute('title');
					}
					if (updated.attrs.width != null) {
						img.width = Number(updated.attrs.width);
					} else {
						img.removeAttribute('width');
					}
					if (updated.attrs.height != null) {
						img.height = Number(updated.attrs.height);
					} else {
						img.removeAttribute('height');
					}
					if (updated.attrs.storagePath) {
						img.setAttribute('data-storage-path', String(updated.attrs.storagePath));
					} else {
						img.removeAttribute('data-storage-path');
					}
					return true;
				},
				destroy: () => {
					if (document.activeElement === altInput) {
						endBlogImageAltEditing();
					}
					pendingAltSyncCallbacks.delete(flushAlt);
				}
			};
		};
	}
});
