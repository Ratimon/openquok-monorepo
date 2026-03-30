import { docsConfig } from '$lib/docs/constants';

/** Sidebar directory segment: e.g. `how-to-write-docs` for `how-to-write-docs/foo`; empty for index or single-segment slugs. */
export function docSectionKey(slug: string): string {
	const parts = slug.split('/');
	return parts.length > 1 ? parts[0]! : '';
}

export function sidebarLabelForSection(section: string): string {
	if (!section) return '';
	const match = docsConfig.sidebar.find((s) => s.autogenerate?.directory === section);
	if (match) return match.label;
	return section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
