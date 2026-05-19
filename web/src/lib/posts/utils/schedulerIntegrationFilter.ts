import type {
	CalendarIntegrationFilterViewModel,
	ChannelViewModel
} from '$lib/posts/scheduler.types';
import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts/scheduler.types';

function normalizePlatformId(s: string): string {
	return String(s ?? '').trim();
}

function integrationIdsForPlatforms(
	channels: ChannelViewModel[],
	candidateIds: string[],
	selectedPlatformIdentifiers: string[]
): string[] {
	const platforms = new Set(
		selectedPlatformIdentifiers.map(normalizePlatformId).filter(Boolean)
	);
	if (platforms.size === 0) return [];

	const idSet = new Set(candidateIds);
	return channels
		.filter((c) => idSet.has(c.id) && platforms.has(normalizePlatformId(c.identifier)))
		.map((c) => c.id);
}

export function deriveIntegrationFilter(
	channels: ChannelViewModel[],
	allGroups: boolean,
	selectedGroupIds: string[],
	allSocialPlatforms: boolean,
	selectedSocialPlatformIdentifiers: string[]
): CalendarIntegrationFilterViewModel {
	if (allGroups) {
		if (allSocialPlatforms) return { kind: 'all' };

		const integrationIds = integrationIdsForPlatforms(
			channels,
			channels.map((c) => c.id),
			selectedSocialPlatformIdentifiers
		);
		if (integrationIds.length === 0) return { kind: 'none' };
		return { kind: 'integrations', integrationIds };
	}

	const selected = new Set(selectedGroupIds);
	const integrationIds: string[] = [];
	for (const c of channels) {
		const gid = c.group?.id;
		if (gid && selected.has(gid)) integrationIds.push(c.id);
		if (!gid && selected.has(CALENDAR_UNGROUPED_SENTINEL)) integrationIds.push(c.id);
	}
	if (integrationIds.length === 0) return { kind: 'none' };

	if (allSocialPlatforms) {
		return { kind: 'integrations', integrationIds };
	}

	const narrowed = integrationIdsForPlatforms(
		channels,
		integrationIds,
		selectedSocialPlatformIdentifiers
	);
	if (narrowed.length === 0) return { kind: 'none' };
	return { kind: 'integrations', integrationIds: narrowed };
}
