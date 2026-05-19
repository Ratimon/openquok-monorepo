import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

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
