import type { DocMeta, DocsLayoutMode } from '$lib/docs/types';

const HTTP_VERB = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/i;

/** Sidebar badge label for OpenAPI reference pages. */
export function httpMethodBadgeLabel(meta: Pick<DocMeta, 'openapi' | 'docsLayout'>): string | undefined {
	if (!meta.openapi?.trim()) return undefined;
	if (meta.docsLayout === 'standard') return undefined;
	const raw = meta.openapi.trim().split(/\s+/)[0] ?? '';
	if (!HTTP_VERB.test(raw)) return undefined;
	const u = raw.toUpperCase();
	return u === 'DELETE' ? 'DEL' : u;
}

/** True when the page uses the API reference chrome: method in nav, no right TOC/search rail. */
export function isOpenapiReferenceChrome(meta: DocMeta | undefined | null): boolean {
	if (!meta?.openapi?.trim()) return false;
	return meta.docsLayout !== 'standard';
}

export function docsHttpMethodBadgeClass(method: string): string {
	switch (method) {
		case 'GET':
			return 'badge-success border-0 text-[0.65rem] font-semibold uppercase';
		case 'POST':
			return 'badge-info border-0 text-[0.65rem] font-semibold uppercase';
		case 'PUT':
		case 'PATCH':
			return 'badge-warning border-0 text-[0.65rem] font-semibold uppercase';
		case 'DEL':
			return 'badge-error border-0 text-[0.65rem] font-semibold uppercase';
		case 'HEAD':
		case 'OPTIONS':
			return 'badge-ghost border-base-300 text-[0.65rem] font-semibold uppercase';
		default:
			return 'badge-ghost border-base-300 text-[0.65rem] font-semibold uppercase';
	}
}

export function normalizeDocsLayout(raw: unknown): DocsLayoutMode | undefined {
	if (raw === 'reference' || raw === 'standard') return raw;
	return undefined;
}
