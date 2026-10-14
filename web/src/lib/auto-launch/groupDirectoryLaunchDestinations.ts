import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';

export type DirectoryLaunchPickerGroup = {
	id: string;
	title: string;
	description: string | null;
	siteDomainRating: number | null;
	variants: AutoLaunchDestinationDto[];
};

export type DirectoryLaunchPickerItem =
	| { kind: 'group'; group: DirectoryLaunchPickerGroup }
	| { kind: 'single'; destination: AutoLaunchDestinationDto };

function groupKeyForDestination(destination: AutoLaunchDestinationDto): string | null {
	const key = destination.pickerGroupKey?.trim();
	return key || null;
}

function groupTitleForVariants(variants: AutoLaunchDestinationDto[]): string {
	for (const variant of variants) {
		const title = variant.pickerGroupTitle?.trim();
		if (title) return title;
	}
	const first = variants[0];
	return first?.siteTitle ?? 'Listing options';
}

function sortVariants(a: AutoLaunchDestinationDto, b: AutoLaunchDestinationDto): number {
	return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
}

/**
 * Collapse destinations that share `pickerGroupKey` (configured in secret-admin auto-fill editor).
 */
export function buildDirectoryLaunchPickerItems(
	destinations: AutoLaunchDestinationDto[]
): DirectoryLaunchPickerItem[] {
	const singles: AutoLaunchDestinationDto[] = [];
	const groupBuckets = new Map<string, AutoLaunchDestinationDto[]>();

	for (const destination of destinations) {
		const groupId = groupKeyForDestination(destination);
		if (!groupId) {
			singles.push(destination);
			continue;
		}
		const bucket = groupBuckets.get(groupId) ?? [];
		bucket.push(destination);
		groupBuckets.set(groupId, bucket);
	}

	const items: DirectoryLaunchPickerItem[] = [];

	for (const [groupId, variants] of groupBuckets) {
		const sorted = [...variants].sort(sortVariants);
		if (sorted.length === 1) {
			singles.push(sorted[0]);
			continue;
		}
		const first = sorted[0];
		items.push({
			kind: 'group',
			group: {
				id: groupId,
				title: groupTitleForVariants(sorted),
				description:
					first.shortDescription ??
					'Choose how you want to list on this directory (e.g. free queue vs paid slot).',
				siteDomainRating: first.siteDomainRating,
				variants: sorted
			}
		});
	}

	for (const destination of singles.sort(sortVariants)) {
		items.push({ kind: 'single', destination });
	}

	items.sort((a, b) => {
		const labelA = a.kind === 'group' ? a.group.title : a.destination.name;
		const labelB = b.kind === 'group' ? b.group.title : b.destination.name;
		return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
	});

	return items;
}
