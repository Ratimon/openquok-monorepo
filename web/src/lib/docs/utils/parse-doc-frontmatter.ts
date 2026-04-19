import type { DocMeta } from '$lib/docs/types';

/** Minimal YAML subset for docs frontmatter (title, order, nested `sidebar.label`, etc.). */
function unquote(s: string): string {
	const t = s.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		return t.slice(1, -1);
	}
	return t;
}

function coerceScalar(raw: string): unknown {
	const s = raw.trim();
	if (s === 'true') return true;
	if (s === 'false') return false;
	if (/^-?\d+$/.test(s)) return parseInt(s, 10);
	if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
	return unquote(s);
}

function parseFrontmatterBlock(block: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const lines = block.split(/\r?\n/);

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const top = /^(\w+):\s*(.*)$/.exec(line);
		if (!top) continue;
		const [, key, rest] = top;
		const trimmed = rest.trim();

		if (key === 'sidebar' && trimmed === '') {
			const sub = /^  (\w+):\s*(.*)$/.exec(lines[i + 1] ?? '');
			if (sub?.[1] === 'label') {
				result.sidebar = { label: unquote(sub[2].trim()) };
				i++;
			}
			continue;
		}

		result[key] = coerceScalar(trimmed);
	}

	return result;
}

/**
 * Reads the first YAML frontmatter block in a markdown file (same source as mdsvex `metadata`).
 */
export function docMetaFromRawSource(raw: string): DocMeta {
	const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
	if (!m) {
		return { title: '', description: '' };
	}

	const data = parseFrontmatterBlock(m[1]);
	const sidebarRaw = data.sidebar;

	return {
		title: typeof data.title === 'string' ? data.title : String(data.title ?? ''),
		description:
			typeof data.description === 'string' ? data.description : String(data.description ?? ''),
		order: typeof data.order === 'number' ? data.order : undefined,
		sidebar:
			sidebarRaw && typeof sidebarRaw === 'object' && sidebarRaw !== null && 'label' in sidebarRaw
				? { label: String((sidebarRaw as { label?: unknown }).label ?? '') }
				: undefined,
		draft: data.draft === true,
		lastUpdated: typeof data.lastUpdated === 'string' ? data.lastUpdated : undefined
	};
}
