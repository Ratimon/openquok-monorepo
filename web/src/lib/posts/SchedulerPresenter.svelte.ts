import 'temporal-polyfill/global';

import type { CalendarEventExternal } from '@schedule-x/calendar';

import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type { PostRowProgrammerModel, PostsRepository } from '$lib/posts/Posts.repository.svelte';

/**
 * Schedule‑X can mount event components outside the parent Svelte component tree (portal),
 * which breaks `setContext/getContext`. This tiny bus lets `Calendar` register an edit handler
 * and `CalendarItem` invoke it reliably.
 */
let editPostGroupHandler: ((postGroup: string) => void) | null = null;
let refreshCalendarHandler: (() => void) | null = null;

export function registerEditPostGroupHandler(next: ((postGroup: string) => void) | null): void {
	editPostGroupHandler = next;
}

export function triggerEditPostGroup(postGroup: string): void {
	if (!postGroup) return;
	editPostGroupHandler?.(postGroup);
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

export type CalendarPostRowViewModel = PostRowProgrammerModel;

export type ChannelViewModel = CreateSocialPostChannelViewModel;

/** Checkbox id for channels that are not in any workspace channel group. */
export const CALENDAR_UNGROUPED_SENTINEL = '__ungrouped__';

export type CalendarIntegrationFilterViewModel =
	| { kind: 'all' }
	| { kind: 'integrations'; integrationIds: string[] }
	| { kind: 'none' };

/** Scheduled-posts calendar surface: toolbar, date range, channel-group scope, fetch status, grid events. */
export type ScheduledPostsCalendarVm = {
	granularity: CalendarGranularityViewModel;
	layoutMode: CalendarLayoutModeViewModel;
	allGroups: boolean;
	selectedGroupIds: string[];
	rangeStartDate: string;
	rangeEndDate: string;
	loading: boolean;
	lastSuccessfulPostsKey: string;
	prevUrlGroupId: string | null | undefined;
	events: CalendarEventExternal[];
};

function createInitialScheduledPostsCalendarVm(): ScheduledPostsCalendarVm {
	return {
		granularity: 'week',
		layoutMode: 'calendar',
		allGroups: true,
		selectedGroupIds: [],
		rangeStartDate: '',
		rangeEndDate: '',
		loading: false,
		lastSuccessfulPostsKey: '',
		prevUrlGroupId: undefined,
		events: []
	};
}

/**
 * Scheduled-post calendar / Schedule‑X wiring: integration filtering, Temporal helpers,
 */
export class SchedulerPresenter {
	/** Reactive UI bundle for browsing scheduled posts in the calendar (Schedule‑X). */
	scheduledPostsCalendarVm = $state<ScheduledPostsCalendarVm>(
		createInitialScheduledPostsCalendarVm()
	);

	constructor(private readonly postsRepository: PostsRepository) {}

	private _patchScheduledPostsCalendarVm(partial: Partial<ScheduledPostsCalendarVm>): void {
		this.scheduledPostsCalendarVm = { ...this.scheduledPostsCalendarVm, ...partial };
	}

	/** Avoid replacing `scheduledPostsCalendarVm` when dates are unchanged — prevents `$effect` reload loops in the Scheduler. */
	private _maybePatchRange(startDate: string, endDate: string): void {
		const { rangeStartDate, rangeEndDate } = this.scheduledPostsCalendarVm;
		if (startDate === rangeStartDate && endDate === rangeEndDate) return;
		this._patchScheduledPostsCalendarVm({ rangeStartDate: startDate, rangeEndDate: endDate });
	}

	resetCalendarUiState(): void {
		this._patchScheduledPostsCalendarVm(createInitialScheduledPostsCalendarVm());
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
		return this.postsRepository.listPosts(params);
	}

	deriveIntegrationFilter(
		channels: ChannelViewModel[],
		allGroups: boolean,
		selectedGroupIds: string[]
	): CalendarIntegrationFilterViewModel {
		if (allGroups) return { kind: 'all' };
		const selected = new Set(selectedGroupIds);
		const integrationIds: string[] = [];
		for (const c of channels) {
			const gid = c.group?.id;
			if (gid && selected.has(gid)) integrationIds.push(c.id);
			if (!gid && selected.has(CALENDAR_UNGROUPED_SENTINEL)) integrationIds.push(c.id);
		}
		if (integrationIds.length === 0) return { kind: 'none' };
		return { kind: 'integrations', integrationIds };
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
		const { allGroups, selectedGroupIds } = this.scheduledPostsCalendarVm;

		const filt = this.deriveIntegrationFilter(channels, allGroups, selectedGroupIds);
		if (filt.kind === 'none') {
			const noneKey = `none|${startDate}|${endDate}|${refreshKey}`;
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
		const requestKey = `${refreshKey}|${startDate}|${endDate}|${idsKey}`;
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

			const r = await this.listPosts({
				organizationId,
				startIso,
				endIso,
				integrationIds
			});

			if (!r.ok) {
				this._patchScheduledPostsCalendarVm({ events: [], lastSuccessfulPostsKey: '', loading: false });
				return { ok: false, error: r.error };
			}

			const events: CalendarEventExternal[] = r.posts
				.filter((p) => typeof p.publishDate === 'string' && p.publishDate.length > 0)
				.map((p) => {
					const zdt = this.isoToUtcZdt(p.publishDate);
					const end = zdt.add({ minutes: 60 });
					const channel = p.integrationId ? channelById.get(p.integrationId) : null;
					const title = channel ? channel.name : 'Draft';
					return {
						id: p.id,
						title,
						start: zdt,
						end,
						channel,
						post: p
					};
				});

			this._patchScheduledPostsCalendarVm({
				lastSuccessfulPostsKey: requestKey,
				events,
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
