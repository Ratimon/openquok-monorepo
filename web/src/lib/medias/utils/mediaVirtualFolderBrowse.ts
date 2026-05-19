import {
	MEDIA_VIRTUAL_GENERAL,
	MEDIA_VIRTUAL_POSTS,
	normalizeMediaVirtualPath
} from 'openquok-common';

export type MediaVirtualBreadcrumb = { path: string; label: string };

const DEFAULT_TOP_LEVEL_FOLDERS = [MEDIA_VIRTUAL_GENERAL, MEDIA_VIRTUAL_POSTS] as const;

/** Folder label in pickers (always a leading `/`, full virtual path). */
export function folderPickerLabel(virtualPath: string): string {
	return normalizeMediaVirtualPath(virtualPath);
}

export function mediaVirtualBreadcrumbs(virtualPath: string): MediaVirtualBreadcrumb[] {
	const normalized = normalizeMediaVirtualPath(virtualPath);
	const parts = normalized.split('/').filter(Boolean);
	const crumbs: MediaVirtualBreadcrumb[] = [];
	let acc = '';
	for (const part of parts) {
		acc = `${acc}/${part}`;
		crumbs.push({ path: acc, label: folderPickerLabel(acc) });
	}
	return crumbs;
}

/** Root library folders (`/General`, `/Posts`, …). */
export function topLevelVirtualFolders(folderPaths: readonly string[]): string[] {
	const tops = new Set<string>(DEFAULT_TOP_LEVEL_FOLDERS);
	for (const raw of folderPaths) {
		const folder = normalizeMediaVirtualPath(raw);
		const parts = folder.split('/').filter(Boolean);
		if (parts.length >= 1) tops.add(`/${parts[0]}`);
	}
	return [...tops].sort((a, b) => a.localeCompare(b));
}

export function isWithinVirtualFolder(currentPath: string, folderPath: string): boolean {
	const current = normalizeMediaVirtualPath(currentPath);
	const folder = normalizeMediaVirtualPath(folderPath);
	return current === folder || current.startsWith(`${folder}/`);
}

/** Immediate child folder paths under `parentPath`. */
export function childVirtualFolders(
	parentPath: string,
	folderPaths: readonly string[]
): string[] {
	const parent = normalizeMediaVirtualPath(parentPath);
	const children = new Set<string>();

	for (const raw of folderPaths) {
		const folder = normalizeMediaVirtualPath(raw);
		if (folder === parent) continue;
		if (!folder.startsWith(`${parent}/`)) continue;
		const rest = folder.slice(parent.length + 1);
		const segment = rest.split('/')[0];
		if (!segment) continue;
		children.add(`${parent}/${segment}`);
	}

	return [...children].sort((a, b) => a.localeCompare(b));
}

export function collectFolderPathsFromTree(
	entities: ReadonlyArray<{ id: string; type: string }>
): string[] {
	return entities
		.filter((e) => e.type === 'folder')
		.map((e) => normalizeMediaVirtualPath(e.id));
}
