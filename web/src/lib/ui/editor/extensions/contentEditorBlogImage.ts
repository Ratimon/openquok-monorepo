import { Image } from '@tiptap/extension-image';

/**
 * Blog/content editor image: visible preview + inline remove control.
 * Serialized HTML stays a plain `<img>` (attrs only); the wrapper exists only in the editor node view.
 */
export const ContentEditorBlogImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
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

			wrap.appendChild(img);
			wrap.appendChild(btn);

			return {
				dom: wrap,
				update: (updated) => {
					if (updated.type.name !== node.type.name) return false;
					const nextSrc = updated.attrs.src ?? '';
					if (img.getAttribute('src') !== nextSrc) {
						img.src = nextSrc;
					}
					img.alt = updated.attrs.alt ?? '';
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
				}
			};
		};
	}
});
