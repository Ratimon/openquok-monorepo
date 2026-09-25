import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { DocsMcpSearchIndexEntry, DocsMcpSearchIndexFile } from './searchIndex.types';

const indexPath = join(dirname(fileURLToPath(import.meta.url)), 'generated/searchIndex.json');

let cached: DocsMcpSearchIndexEntry[] | null = null;

export function loadDocsSearchIndex(): DocsMcpSearchIndexEntry[] {
	if (cached) return cached;
	try {
		const raw = readFileSync(indexPath, 'utf8');
		const parsed = JSON.parse(raw) as DocsMcpSearchIndexFile;
		cached = Array.isArray(parsed.entries) ? parsed.entries : [];
		return cached;
	} catch {
		cached = [];
		return cached;
	}
}

/** @internal test helper */
export function resetDocsSearchIndexCacheForTests(): void {
	cached = null;
}
