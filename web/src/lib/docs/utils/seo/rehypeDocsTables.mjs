/**
 * Wrap markdown tables so public HTML ids match JSON-LD `Table.cssSelector`.
 * Keep `DOCS_TABLE_SCROLL_CLASS` / `doc-table-N` in sync with `extractDocsTablesFromRaw.ts`.
 */

export const DOCS_TABLE_SCROLL_CLASS = 'docs-table-scroll';

export function docsTableAnchorId(index) {
	return `doc-table-${index + 1}`;
}

function classList(properties) {
	const raw = properties?.className;
	if (Array.isArray(raw)) return raw.map(String);
	if (typeof raw === 'string') return raw.split(/\s+/).filter(Boolean);
	return [];
}

function isTableScrollWrapper(node) {
	return (
		node?.type === 'element' &&
		node.tagName === 'div' &&
		classList(node.properties).includes(DOCS_TABLE_SCROLL_CLASS)
	);
}

function walk(node, state) {
	if (!node || !Array.isArray(node.children)) return;

	for (let i = 0; i < node.children.length; i += 1) {
		const child = node.children[i];
		if (child?.type === 'element' && child.tagName === 'table' && !isTableScrollWrapper(node)) {
			const id = docsTableAnchorId(state.index);
			state.index += 1;
			node.children[i] = {
				type: 'element',
				tagName: 'div',
				properties: {
					className: [DOCS_TABLE_SCROLL_CLASS],
					id
				},
				children: [child]
			};
			continue;
		}
		walk(child, state);
	}
}

/** mdsvex rehype plugin: stamp `#doc-table-N` on each HTML table. */
export function rehypeDocsTables() {
	return (tree) => {
		walk(tree, { index: 0 });
	};
}
