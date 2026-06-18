import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';
import type {
	CalendarIntegrationFilterViewModel,
	ChannelViewModel
} from '$lib/posts/scheduler.types';
import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts/scheduler.types';

// --- Integration / platform filter ---

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

// --- Post type filter ---

/** DB-backed post states in the “Post types” menu (`REPEATING` is synthetic — not `posts.state`). */
const CALENDAR_DB_POST_STATES = new Set(['QUEUE', 'DRAFT', 'PUBLISHED', 'ERROR']);
const CALENDAR_FILTER_REPEATING = 'REPEATING';

/** Repeating row: positive `intervalInDays` or non-empty composer `repeatInterval`. */
function isRepeating(rowVm: CalendarPostRowViewModel): boolean {
	const rawDays = rowVm.intervalInDays ?? null;
	const days =
		typeof rawDays === 'number'
			? rawDays
			: rawDays == null
				? Number.NaN
				: Number(rawDays);
	const intervalOk = Number.isFinite(days) && Math.floor(days) > 0;

	const key = rowVm.repeatInterval;
	const repeatKeyOk =
		key != null &&
		String(key).trim().length > 0 &&
		String(key).trim().toLowerCase() !== 'null';

	return intervalOk || repeatKeyOk;
}

/**
 * Calendar “Post types” filter:
 * - REPEATING on → only repeating rows (∩ selected DB states when any).
 * - REPEATING off + ≥1 DB state → exclude repeating rows.
 * - REPEATING only → repeating rows in any DB state.
 */
function rowMatchesPostTypeFilters(rowVm: CalendarPostRowViewModel, selectedFilters: Set<string>): boolean {
	const selected = new Set(
		[...selectedFilters].map((s) => String(s ?? '').trim().toUpperCase()).filter(Boolean)
	);

	const repeatingOn = selected.has(CALENDAR_FILTER_REPEATING);
	const dbFilters = [...selected].filter((t) => CALENDAR_DB_POST_STATES.has(t));
	const rowState = String(rowVm.state ?? '').trim().toUpperCase();

	const stateOk = dbFilters.length === 0 || dbFilters.includes(rowState);
	const isRep = isRepeating(rowVm);

	let repeatOk = true;
	if (repeatingOn) repeatOk = isRep;
	else if (dbFilters.length > 0) repeatOk = !isRep;

	return stateOk && repeatOk;
}

export function filterPostsByPostType(
	posts: readonly CalendarPostRowViewModel[],
	allPostStates: boolean,
	selectedPostStates: string[]
): CalendarPostRowViewModel[] {
	if (allPostStates) return [...posts];

	const stateSet = new Set(
		selectedPostStates.map((s) => String(s).toUpperCase()).filter(Boolean)
	);
	if (stateSet.size === 0) return [...posts];

	return posts.filter((rowVm) => rowMatchesPostTypeFilters(rowVm, stateSet));
}

// --- Tag filter ---

function normalizeTagName(name: string): string {
	return String(name ?? '').trim().toLowerCase();
}

/** Returns true when the item has at least one of the selected tag names. */
export function matchesTagFilters(
	tagNames: readonly string[] | undefined,
	selectedTagNames: Set<string>
): boolean {
	const tags = tagNames ?? [];
	return tags.some((n) => selectedTagNames.has(normalizeTagName(n)));
}

/** Returns true when the row has at least one of the selected tag names. */
export function rowMatchesTagFilters(
	rowVm: CalendarPostRowViewModel,
	selectedTagNames: Set<string>
): boolean {
	return matchesTagFilters(rowVm.tagNames, selectedTagNames);
}

export function filterPostsByTags(
	posts: readonly CalendarPostRowViewModel[],
	allTags: boolean,
	selectedTagNames: string[]
): CalendarPostRowViewModel[] {
	if (allTags) return [...posts];

	const selected = new Set(
		selectedTagNames.map(normalizeTagName).filter(Boolean)
	);
	if (selected.size === 0) return [...posts];

	return posts.filter((rowVm) => rowMatchesTagFilters(rowVm, selected));
}
