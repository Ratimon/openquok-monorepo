import { TableKit } from '@tiptap/extension-table';

/** Default grid for the Visual toolbar (header + three body rows). */
export const CONTENT_EDITOR_TABLE_INSERT = {
	rows: 4,
	cols: 3,
	withHeaderRow: true
} as const;

export const contentEditorTableKit = TableKit.configure({
	table: {
		resizable: false,
		HTMLAttributes: {
			class: 'blog-content-table'
		}
	}
});
