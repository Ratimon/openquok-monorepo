import 'temporal-polyfill/global';

import type { CalendarEventExternal } from '@schedule-x/calendar';

import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type {
	DebugExportPostGroupProgrammerModel,
	PostsRepository
} from '$lib/posts/Post.repository.svelte';
import type {
	CalendarPostRowViewModel,
	GetPostGroupResultViewModel
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPost.presenter.svelte';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

/**
 * Schedule‑X can mount event components outside the parent Svelte component tree (portal),
 * which breaks `setContext/getContext`. This tiny bus lets `Calendar` register an edit handler
 * and `CalendarItem` invoke it reliably.
 */
let editPostGroupHandler: ((postGroup: string) => void) | null = null;
let openActionsForPostGroupHandler: ((postGroup: string) => void) | null = null;
let refreshCalendarHandler: (() => void) | null = null;

export function registerEditPostGroupHandler(next: ((postGroup: string) => void) | null): void {
	editPostGroupHandler = next;
}

export function triggerEditPostGroup(postGroup: string): void {
	if (!postGroup) return;
	editPostGroupHandler?.(postGroup);
}

export function registerOpenActionsForPostGroupHandler(
	next: ((postGroup: string) => void) | null
): void {
	openActionsForPostGroupHandler = next;
}

export function triggerOpenActionsForPostGroup(postGroup: string): void {
	if (!postGroup) return;
	openActionsForPostGroupHandler?.(postGroup);
}

export function registerRefreshCalendarHandler(next: (() => void) | null): void {
	refreshCalendarHandler = next;
}

export function triggerRefreshCalendar(): void {
	refreshCalendarHandler?.();
}

export type CalendarDisplayViewModel = 'day' | 'week' | 'month' | 'list';

/** Day / week / month scope for the calendar toolbar. */
export type CalendarGranularityViewModel = 'day' | 'week' | 'month';

/** Grid views vs list view for the scheduler toolbar. */
export type CalendarLayoutModeViewModel = 'calendar' | 'list';

export type CalendarSchedulerFiltersViewModel = {
	display: CalendarDisplayViewModel;
	/** Inclusive start (YYYY-MM-DD). */
	startDate: string;
	/** Inclusive end (YYYY-MM-DD). */
	endDate: string;
	groupId: string | null;
};

export type ChannelViewModel = CreateSocialPostChannelViewModel;

/** Checkbox id for channels that are not in any workspace channel group. */
export const CALENDAR_UNGROUPED_SENTINEL = '__ungrouped__';

export type CalendarIntegrationFilterViewModel =
	| { kind: 'all' }
	| { kind: 'integrations'; integrationIds: string[] }
	| { kind: 'none' };

/** Scheduled-posts calendar surface: toolbar, date range, channel-group scope, fetch status, grid events. */
export type ScheduledPostsCalendarViewModel = {
	granularity: CalendarGranularityViewModel;
	layoutMode: CalendarLayoutModeViewModel;
	allGroups: boolean;
	selectedGroupIds: string[];
	/** When false, calendar loads only integrations whose `identifier` is in {@link selectedSocialPlatformIdentifiers}. */
	allSocialPlatforms: boolean;
	selectedSocialPlatformIdentifiers: string[];
	allPostStates: boolean;
	selectedPostStates: string[];
	rangeStartDate: string;
	rangeEndDate: string;
	loading: boolean;
	lastSuccessfulPostsKey: string;
	prevUrlGroupId: string | null | undefined;
	events: CalendarEventExternal[];
};

export type DebugExportPostGroupResult =
	| { ok: true; data: DebugExportPostGroupProgrammerModel }
	| { ok: false; error: string };

function createInitialScheduledPostsCalendarViewModel(): ScheduledPostsCalendarViewModel {
	return {
		granularity: 'week',
		layoutMode: 'calendar',
		allGroups: true,
		selectedGroupIds: [],
		allSocialPlatforms: true,
		selectedSocialPlatformIdentifiers: [],
		allPostStates: true,
		selectedPostStates: [],
		rangeStartDate: '',
		rangeEndDate: '',
		loading: false,
		lastSuccessfulPostsKey: '',
		prevUrlGroupId: undefined,
		events: []
	};
}

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
function calendarRowMatchesPostTypeFilters(rowVm: CalendarPostRowViewModel, selectedFilters: Set<string>): boolean {
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

/**
 * Scheduled-post calendar / Schedule‑X wiring: integration filtering, Temporal helpers,
 */
export class SchedulerPresenter {
	/** Reactive UI bundle for browsing scheduled posts in the calendar (Schedule‑X). */
	scheduledPostsCalendarVm = $state<ScheduledPostsCalendarViewModel>(
		createInitialScheduledPostsCalendarViewModel()
	);

	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly getScheduledPostsPresenter: GetScheduledPostsPresenter
	) {}

	private _patchScheduledPostsCalendarVm(partial: Partial<ScheduledPostsCalendarViewModel>): void {
		this.scheduledPostsCalendarVm = { ...this.scheduledPostsCalendarVm, ...partial };
	}

	/** Avoid replacing `scheduledPostsCalendarVm` when dates are unchanged — prevents `$effect` reload loops in the Scheduler. */
	private _maybePatchRange(startDate: string, endDate: string): void {
		const { rangeStartDate, rangeEndDate } = this.scheduledPostsCalendarVm;
		if (startDate === rangeStartDate && endDate === rangeEndDate) return;
		this._patchScheduledPostsCalendarVm({ rangeStartDate: startDate, rangeEndDate: endDate });
	}

	resetCalendarUiState(): void {
		this._patchScheduledPostsCalendarVm(createInitialScheduledPostsCalendarViewModel());
	}

	listPosts(
		params: {
			organizationId: string;
			startIso: string;
			endIso: string;
			integrationIds?: string[] | null;
		}
	): Promise<
		| { ok: true; posts: CalendarPostRowViewModel[] }
		| { ok: false; error: string }
	> {
		return (async () => {
			try {
				const posts = await this.getScheduledPostsPresenter.loadCalendarPostsVm(params);
				return { ok: true, posts };
			} catch {
				return { ok: false, error: 'Could not load posts.' };
			}
		})();
	}

	getPostGroup(
		postGroup: string
	): Promise<GetPostGroupResultViewModel> {
		return (async () => {
			try {
				const group = await this.getScheduledPostsPresenter.loadPostGroupDetailsVm(postGroup);
				if (!group) return { ok: false, error: 'Could not load post.' };
				return { ok: true, group };
			} catch {
				return { ok: false, error: 'Could not load post.' };
			}
		})();
	}

	debugExportPostGroup(
		postGroup: string
	): Promise<DebugExportPostGroupResult> {
		return this.postsRepository.debugExportPostGroup(postGroup);
	}

	deletePostGroup(postGroup: string): Promise<{ ok: true } | { ok: false; error: string }> {
		return this.postsRepository.deletePostGroup(postGroup);
	}

	deriveIntegrationFilter(
		channels: ChannelViewModel[],
		allGroups: boolean,
		selectedGroupIds: string[],
		allSocialPlatforms: boolean,
		selectedSocialPlatformIdentifiers: string[]
	): CalendarIntegrationFilterViewModel {
		const normalizePid = (s: string) => String(s ?? '').trim();

		function integrationIdsMatchingPlatforms(ids: string[]): string[] {
			if (allSocialPlatforms) return ids;
			const ps = new Set(
				selectedSocialPlatformIdentifiers.map(normalizePid).filter(Boolean)
			);
			if (ps.size === 0) return [];
			const idSet = new Set(ids);
			return channels
				.filter((c) => idSet.has(c.id) && ps.has(normalizePid(c.identifier)))
				.map((c) => c.id);
		}

		if (allGroups) {
			if (!allSocialPlatforms) {
				const ps = new Set(
					selectedSocialPlatformIdentifiers.map(normalizePid).filter(Boolean)
				);
				if (ps.size === 0) return { kind: 'none' };
				const integrationIds = channels
					.filter((c) => ps.has(normalizePid(c.identifier)))
					.map((c) => c.id);
				if (integrationIds.length === 0) return { kind: 'none' };
				return { kind: 'integrations', integrationIds };
			}
			return { kind: 'all' };
		}

		const selected = new Set(selectedGroupIds);
		const integrationIds: string[] = [];
		for (const c of channels) {
			const gid = c.group?.id;
			if (gid && selected.has(gid)) integrationIds.push(c.id);
			if (!gid && selected.has(CALENDAR_UNGROUPED_SENTINEL)) integrationIds.push(c.id);
		}
		if (integrationIds.length === 0) return { kind: 'none' };

		const narrowed = integrationIdsMatchingPlatforms(integrationIds);
		if (narrowed.length === 0) return { kind: 'none' };
		return { kind: 'integrations', integrationIds: narrowed };
	}

	isoToUtcZdt(iso: string): Temporal.ZonedDateTime {
		const instant = Temporal.Instant.from(iso);
		return instant.toZonedDateTimeISO('UTC');
	}

	temporalToUtcYyyyMmDd(x: unknown): string {
		if (typeof x === 'string') {
			if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return x;
			const m = /^(\d{4}-\d{2}-\d{2})/.exec(x);
			if (m) return m[1]!;
			return x;
		}
		if (!x || typeof x !== 'object') return '';

		try {
			const zdt = Temporal.ZonedDateTime.from(x as Temporal.ZonedDateTime);
			return zdt.toInstant().toZonedDateTimeISO('UTC').toPlainDate().toString();
		} catch {
			// fall through
		}

		try {
			return Temporal.PlainDate.from(x as Temporal.PlainDate).toString();
		} catch {
			return '';
		}
	}

	private yyyyMmDd(d: Date): string {
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	}

	private today(): string {
		return this.yyyyMmDd(new Date());
	}

	private startOfIsoWeek(dateStr: string): string {
		const d = new Date(`${dateStr}T00:00:00Z`);
		const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
		d.setUTCDate(d.getUTCDate() - (day - 1));
		return this.yyyyMmDd(d);
	}

	private endOfIsoWeek(dateStr: string): string {
		const d = new Date(`${this.startOfIsoWeek(dateStr)}T00:00:00Z`);
		d.setUTCDate(d.getUTCDate() + 6);
		return this.yyyyMmDd(d);
	}

	private startOfMonth(dateStr: string): string {
		const d = new Date(`${dateStr}T00:00:00Z`);
		const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
		return this.yyyyMmDd(first);
	}

	private endOfMonth(dateStr: string): string {
		const d = new Date(`${dateStr}T00:00:00Z`);
		const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
		return this.yyyyMmDd(last);
	}

	setInitialRangeForGranularity(next: CalendarGranularityViewModel): void {
		const base = this.today();
		let rangeStartDate: string;
		let rangeEndDate: string;
		if (next === 'day') {
			rangeStartDate = base;
			rangeEndDate = base;
		} else if (next === 'week') {
			rangeStartDate = this.startOfIsoWeek(base);
			rangeEndDate = this.endOfIsoWeek(base);
		} else {
			rangeStartDate = this.startOfMonth(base);
			rangeEndDate = this.endOfMonth(base);
		}
		this._patchScheduledPostsCalendarVm({ granularity: next, rangeStartDate, rangeEndDate });
	}

	ensureRangeInitialized(): void {
		const { rangeStartDate, rangeEndDate, granularity } = this.scheduledPostsCalendarVm;
		if (!rangeStartDate || !rangeEndDate) {
			this.setInitialRangeForGranularity(granularity);
		}
	}

	applyGroupIdFromUrl(groupId: string | null): void {
		const g = groupId ?? null;
		if (this.scheduledPostsCalendarVm.prevUrlGroupId === g) return;
		this._patchScheduledPostsCalendarVm({
			prevUrlGroupId: g,
			...(g
				? { allGroups: false, selectedGroupIds: [g] }
				: { allGroups: true, selectedGroupIds: [] })
		});
	}

	/**
	 * When "All groups" is active, keep selection populated so the UI can render badges
	 * and allow unchecking a single group without first switching modes.
	 */
	populateAllSocialPlatformSelectionWhenEmpty(channels: ChannelViewModel[]): void {
		if (!this.scheduledPostsCalendarVm.allSocialPlatforms) return;
		if (!channels.length) return;
		if (this.scheduledPostsCalendarVm.selectedSocialPlatformIdentifiers.length) return;
		const ids = new Set<string>();
		for (const c of channels) {
			const id = String(c.identifier ?? '').trim();
			if (id) ids.add(id);
		}
		const sorted = [...ids].sort((a, b) => a.localeCompare(b));
		this._patchScheduledPostsCalendarVm({ selectedSocialPlatformIdentifiers: sorted });
	}

	populateAllGroupSelectionWhenEmpty(channels: ChannelViewModel[]): void {
		if (!this.scheduledPostsCalendarVm.allGroups) return;
		if (!channels.length) return;
		if (this.scheduledPostsCalendarVm.selectedGroupIds.length) return;
		const ids: string[] = [];
		const seen = new Set<string>();
		let hasUngrouped = false;
		for (const c of channels) {
			if (!c.group?.id) {
				hasUngrouped = true;
				continue;
			}
			if (seen.has(c.group.id)) continue;
			seen.add(c.group.id);
			ids.push(c.group.id);
		}
		ids.sort((a, b) => a.localeCompare(b));
		if (hasUngrouped) ids.push(CALENDAR_UNGROUPED_SENTINEL);
		this._patchScheduledPostsCalendarVm({ selectedGroupIds: ids });
	}

	setGroupFilter(next: { allGroups: boolean; selectedGroupIds: string[] }): void {
		this._patchScheduledPostsCalendarVm({ allGroups: next.allGroups, selectedGroupIds: next.selectedGroupIds });
	}

	setPostStateFilter(next: { allPostStates: boolean; selectedPostStates: string[] }): void {
		this._patchScheduledPostsCalendarVm({
			allPostStates: next.allPostStates,
			selectedPostStates: next.selectedPostStates
		});
	}

	setSocialPlatformFilter(next: {
		allSocialPlatforms: boolean;
		selectedSocialPlatformIdentifiers: string[];
	}): void {
		this._patchScheduledPostsCalendarVm({
			allSocialPlatforms: next.allSocialPlatforms,
			selectedSocialPlatformIdentifiers: next.selectedSocialPlatformIdentifiers
		});
	}

	setGranularity(next: CalendarGranularityViewModel): void {
		this.setInitialRangeForGranularity(next);
	}

	setLayoutMode(next: CalendarLayoutModeViewModel): void {
		this._patchScheduledPostsCalendarVm({ layoutMode: next });
	}

	goToday(): void {
		this.setInitialRangeForGranularity(this.scheduledPostsCalendarVm.granularity);
	}

	shiftRange(delta: number): void {
		const { rangeStartDate, granularity } = this.scheduledPostsCalendarVm;
		if (!rangeStartDate) return;
		const start = new Date(`${rangeStartDate}T00:00:00Z`);
		if (granularity === 'day') {
			start.setUTCDate(start.getUTCDate() + delta);
			const d = this.yyyyMmDd(start);
			this._patchScheduledPostsCalendarVm({ rangeStartDate: d, rangeEndDate: d });
			return;
		}
		if (granularity === 'week') {
			start.setUTCDate(start.getUTCDate() + delta * 7);
			const base = this.yyyyMmDd(start);
			this._patchScheduledPostsCalendarVm({
				rangeStartDate: this.startOfIsoWeek(base),
				rangeEndDate: this.endOfIsoWeek(base)
			});
			return;
		}
		start.setUTCMonth(start.getUTCMonth() + delta);
		const base = this.yyyyMmDd(start);
		this._patchScheduledPostsCalendarVm({
			rangeStartDate: this.startOfMonth(base),
			rangeEndDate: this.endOfMonth(base)
		});
	}

	labelForRange(): string {
		const { rangeStartDate, rangeEndDate, granularity } = this.scheduledPostsCalendarVm;
		if (!rangeStartDate || !rangeEndDate) return '';
		const fmt = (yyyyMmDdStr: string) => {
			const [y, m, d] = yyyyMmDdStr.split('-').map((x) => Number(x));
			if (!y || !m || !d) return yyyyMmDdStr;
			const mm = String(m).padStart(2, '0');
			const dd = String(d).padStart(2, '0');
			return `${mm}/${dd}/${y}`;
		};

		if (granularity === 'month') return rangeStartDate.slice(0, 7);
		if (granularity === 'day') return fmt(rangeStartDate);
		return `${fmt(rangeStartDate)} → ${fmt(rangeEndDate)}`;
	}

	/**
	 * Loads scheduled posts for the current range and integration filter; updates {@link scheduledPostsCalendarVm}
	 * `events`, `loading`, and `lastSuccessfulPostsKey`.
	 */
	async syncRangeAndLoadPosts(params: {
		startDate: string;
		endDate: string;
		organizationId: string;
		channels: ChannelViewModel[];
		refreshKey: string | number;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		const { startDate, endDate, organizationId, channels, refreshKey } = params;
		const {
			allGroups,
			selectedGroupIds,
			allSocialPlatforms,
			selectedSocialPlatformIdentifiers,
			allPostStates,
			selectedPostStates
		} = this.scheduledPostsCalendarVm;

		const filt = this.deriveIntegrationFilter(
			channels,
			allGroups,
			selectedGroupIds,
			allSocialPlatforms,
			selectedSocialPlatformIdentifiers
		);
		const statesKey = allPostStates
			? 'allStates'
			: selectedPostStates.length
				? [...selectedPostStates].map((s) => s.toUpperCase()).sort().join(',')
				: 'noneStates';
		const platformsKey = allSocialPlatforms
			? 'allPlatforms'
			: selectedSocialPlatformIdentifiers.length
				? [...selectedSocialPlatformIdentifiers]
						.map((s) => String(s ?? '').trim())
						.filter(Boolean)
						.sort()
						.join(',')
				: 'nonePlatforms';
		if (filt.kind === 'none') {
			const noneKey = `none|${startDate}|${endDate}|${refreshKey}|${statesKey}|${platformsKey}`;
			if (noneKey === this.scheduledPostsCalendarVm.lastSuccessfulPostsKey) {
				this._maybePatchRange(startDate, endDate);
				return { ok: true };
			}
			this._maybePatchRange(startDate, endDate);
			this._patchScheduledPostsCalendarVm({
				events: [],
				lastSuccessfulPostsKey: noneKey
			});
			return { ok: true };
		}

		const integrationIds = filt.kind === 'all' ? null : filt.integrationIds;
		const idsKey = integrationIds?.length ? [...integrationIds].sort().join(',') : 'all';
		const requestKey = `${refreshKey}|${startDate}|${endDate}|${idsKey}|${statesKey}|${platformsKey}`;
		if (requestKey === this.scheduledPostsCalendarVm.lastSuccessfulPostsKey) {
			this._maybePatchRange(startDate, endDate);
			return { ok: true };
		}

		const channelById = new Map<string, ChannelViewModel>();
		for (const c of channels) channelById.set(c.id, c);

		this._maybePatchRange(startDate, endDate);

		this._patchScheduledPostsCalendarVm({ loading: true });
		try {
			const startIso = new Date(`${startDate}T00:00:00.000Z`).toISOString();
			const endIso = new Date(`${endDate}T23:59:59.999Z`).toISOString();

			const listPostsPmResult = await this.listPosts({
				organizationId,
				startIso,
				endIso,
				integrationIds
			});

			if (!listPostsPmResult.ok) {
				this._patchScheduledPostsCalendarVm({ events: [], lastSuccessfulPostsKey: '', loading: false });
				return { ok: false, error: listPostsPmResult.error };
			}

			const stateSet = allPostStates
				? null
				: new Set(selectedPostStates.map((s) => String(s).toUpperCase()).filter(Boolean));
			const posts =
				stateSet && stateSet.size > 0
					? listPostsPmResult.posts.filter((rowVm) =>
							calendarRowMatchesPostTypeFilters(rowVm as CalendarPostRowViewModel, stateSet)
						)
					: listPostsPmResult.posts;

			/**
			 * Schedule‑X enforces a minimum event chip height in the time grid. When two posts are only a
			 * couple minutes apart, their chips can visually overlap.
			 *
			 * We group posts into 15‑minute buckets per day, so very close posts render as a single chip
			 * with a "+N" indicator. The longer bucket makes each chip tall enough to show the avatar + text
			 * without hiding inside the time-grid min-height constraints.
			 */
			// Bucket posts into half-hour slots to prevent near-adjacent chips from overlapping
			// while still showing avatar + preview content reliably.
			const bucketMinutes = 30;
			const visualMinutes = 30;
			const bucketed = new Map<string, CalendarEventExternal>();
			const nowMs = Date.now();
			const publishMs = (iso: string): number => {
				const ms = Date.parse(iso);
				return Number.isFinite(ms) ? ms : Number.NaN;
			};
			for (const p of posts) {
				if (typeof p.publishDate !== 'string' || p.publishDate.length === 0) continue;
				const zdt = this.isoToUtcZdt(p.publishDate);
				const roundedMinute = Math.floor(zdt.minute / bucketMinutes) * bucketMinutes;
				const bucketStart = zdt.with({
					minute: roundedMinute,
					second: 0,
					millisecond: 0,
					microsecond: 0,
					nanosecond: 0
				});
				const key = `${bucketStart.toPlainDate().toString()}|${bucketStart.hour}:${bucketStart.minute}`;

				const existing = bucketed.get(key);
				if (existing) {
					(existing as any).posts = [...((((existing as any).posts as any[]) ?? []) as any[]), p];
					(existing as any).slotSummary = [
						...((((existing as any).slotSummary as any[]) ?? []) as any[]),
						{
							postGroup: (p as any).postGroup ?? '',
							state: typeof (p as any).state === 'string' ? (p as any).state : '',
							publishDate: (p as any).publishDate ?? '',
							content: stripHtmlToPlainText(String((p as any).content ?? '')).slice(0, 140),
							channelPicture: (p as any).integrationId ? channelById.get((p as any).integrationId)?.picture ?? '' : '',
							channelName: (p as any).integrationId ? channelById.get((p as any).integrationId)?.name ?? '' : '',
							channelIdentifier: (p as any).integrationId
								? channelById.get((p as any).integrationId)?.identifier ?? ''
								: ''
						}
					];
					continue;
				}

				const end = bucketStart.add({ minutes: Math.max(bucketMinutes, visualMinutes) });
				const channel = p.integrationId ? channelById.get(p.integrationId) : null;
				const title = channel ? channel.name : 'Draft';
				bucketed.set(key, {
					id: p.id,
					title,
					start: bucketStart,
					end,
					channel,
					post: p,
					posts: [p],
					slotSummary: [
						{
							postGroup: (p as any).postGroup ?? '',
							state: typeof (p as any).state === 'string' ? (p as any).state : '',
							publishDate: (p as any).publishDate ?? '',
							content: stripHtmlToPlainText(String((p as any).content ?? '')).slice(0, 140),
							channelPicture: channel?.picture ?? '',
							channelName: channel?.name ?? '',
							channelIdentifier: channel?.identifier ?? ''
						}
					]
				} as any);
			}

			// Choose a stable "representative" post for the bucket so the chip shows the upcoming post
			// when a bucket contains both past + future posts.
			for (const ev of bucketed.values()) {
				const posts = (ev as any).posts as CalendarPostRowViewModel[] | undefined;
				if (!Array.isArray(posts) || posts.length === 0) continue;
				const sorted = posts
					.slice()
					.map((p) => ({ p, ms: typeof p.publishDate === 'string' ? publishMs(p.publishDate) : Number.NaN }))
					.filter((x) => Number.isFinite(x.ms))
					.sort((a, b) => a.ms - b.ms);
				if (sorted.length === 0) continue;

				const nextFuture = sorted.find((x) => x.ms >= nowMs);
				const representative = (nextFuture ?? sorted[sorted.length - 1]!)!.p;
				(ev as any).post = representative;

				const repChannel = representative.integrationId ? channelById.get(representative.integrationId) : null;
				(ev as any).channel = repChannel;
				(ev as any).title = repChannel ? repChannel.name : 'Draft';

				// Ensure the slot summary order matches what the chip shows (upcoming-first).
				const summary = ((ev as any).slotSummary as any[]) ?? [];
				if (Array.isArray(summary) && summary.length > 1) {
					const repGroup = String((representative as any).postGroup ?? '');
					const sortedSummary = summary
						.slice()
						.map((s) => ({ s, ms: typeof s?.publishDate === 'string' ? publishMs(s.publishDate) : Number.NaN }))
						.sort((a, b) => {
							// representative first, then ascending by time
							const aIsRep = String(a.s?.postGroup ?? '') === repGroup;
							const bIsRep = String(b.s?.postGroup ?? '') === repGroup;
							if (aIsRep && !bIsRep) return -1;
							if (!aIsRep && bIsRep) return 1;
							if (Number.isFinite(a.ms) && Number.isFinite(b.ms)) return a.ms - b.ms;
							if (Number.isFinite(a.ms)) return -1;
							if (Number.isFinite(b.ms)) return 1;
							return 0;
						})
						.map((x) => x.s);
					(ev as any).slotSummary = sortedSummary;
				}
			}

			const normalizedEvents: CalendarEventExternal[] = Array.from(bucketed.values());

			this._patchScheduledPostsCalendarVm({
				lastSuccessfulPostsKey: requestKey,
				events: normalizedEvents,
				loading: false
			});
			return { ok: true };
		} finally {
			if (this.scheduledPostsCalendarVm.loading) {
				this._patchScheduledPostsCalendarVm({ loading: false });
			}
		}
	}

	async loadPostsForCurrentRange(params: {
		organizationId: string;
		channels: ChannelViewModel[];
		refreshKey: string | number;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		const { rangeStartDate, rangeEndDate } = this.scheduledPostsCalendarVm;
		return this.syncRangeAndLoadPosts({
			startDate: rangeStartDate,
			endDate: rangeEndDate,
			...params
		});
	}
}
