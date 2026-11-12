export type DirectoryProfileSourceOption = {
	id: string;
	label: string;
	kind: 'main' | 'variant';
};

export type ApiProductProfileRow = {
	id: string;
	name: string;
	profileKind?: string;
	profile_kind?: string;
	parentProfileId?: string | null;
	parent_profile_id?: string | null;
	directorySiteKey?: string | null;
	directory_site_key?: string | null;
	similarityToMainPercent?: number | null;
	similarity_to_main_percent?: number | null;
};

function profileKind(row: ApiProductProfileRow): string {
	return (row.profileKind ?? row.profile_kind ?? 'main').trim();
}

function parentId(row: ApiProductProfileRow): string | null {
	const raw = row.parentProfileId ?? row.parent_profile_id;
	return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

function similarityPct(row: ApiProductProfileRow): number | null {
	const raw = row.similarityToMainPercent ?? row.similarity_to_main_percent;
	return typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : null;
}

function optionLabel(row: ApiProductProfileRow, kind: 'main' | 'variant'): string {
	if (kind === 'main') {
		return `Main profile — ${row.name}`;
	}
	const site = (row.directorySiteKey ?? row.directory_site_key ?? '').trim();
	const pct = similarityPct(row);
	const sitePart = site ? ` (${site})` : '';
	const matchPart = pct !== null ? ` · ${pct}% match` : '';
	return `${row.name}${sitePart}${matchPart}`;
}

/**
 * Main profile plus directory variants for the active submission profile family.
 */
export function buildDirectoryProfileSourceOptions(
	profiles: readonly ApiProductProfileRow[],
	activeProfileId: string | undefined
): { activeId: string | undefined; options: DirectoryProfileSourceOption[] } {
	if (!profiles.length) {
		return { activeId: activeProfileId, options: [] };
	}

	let anchor = activeProfileId
		? profiles.find((row) => row.id === activeProfileId)
		: undefined;
	if (!anchor && activeProfileId) {
		return { activeId: activeProfileId, options: [] };
	}
	if (!anchor) {
		anchor = profiles.find((row) => profileKind(row) !== 'directory_variant') ?? profiles[0];
	}
	if (!anchor) {
		return { activeId: undefined, options: [] };
	}

	const mainId = parentId(anchor) ?? anchor.id;
	const family = profiles.filter(
		(row) => row.id === mainId || parentId(row) === mainId
	);
	if (family.length <= 1) {
		return { activeId: anchor.id, options: [] };
	}

	const mainRow = family.find((row) => row.id === mainId) ?? anchor;
	const options: DirectoryProfileSourceOption[] = [];

	options.push({
		id: mainRow.id,
		label: optionLabel(mainRow, 'main'),
		kind: 'main',
	});

	for (const row of family) {
		if (row.id === mainId) continue;
		if (profileKind(row) !== 'directory_variant') continue;
		options.push({
			id: row.id,
			label: optionLabel(row, 'variant'),
			kind: 'variant',
		});
	}

	options.sort((a, b) => {
		if (a.kind !== b.kind) return a.kind === 'main' ? -1 : 1;
		return a.label.localeCompare(b.label);
	});

	const activeId =
		activeProfileId && options.some((entry) => entry.id === activeProfileId)
			? activeProfileId
			: anchor.id;

	return { activeId, options };
}
