import 'temporal-polyfill/global';

import type { PostUpsertProgrammerModel, PostsRepository } from '$lib/posts/Post.repository.svelte';
import type {
	CalendarPostRowViewModel,
	GetPostGroupResultViewModel
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPost.presenter.svelte';

import {
	createInitialScheduledPostsCalendarViewModel,
	type CalendarGranularityViewModel,
	type CalendarLayoutModeViewModel,
	type ChannelViewModel,
	type DebugExportPostGroupResult,
	type PostStateFilterVm,
	type PostTagFilterVm,
	type ScheduledPostsCalendarViewModel,
	type SocialPlatformFilterVm
} from '$lib/posts/scheduler.types';
import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts/scheduler.types';
import { deriveIntegrationFilter } from '$lib/posts/utils/schedulerIntegrationFilter';
import { buildCalendarEventsFromPosts } from '$lib/posts/utils/schedulerCalendarEvents';
import { filterPostsByPostType } from '$lib/posts/utils/schedulerPostTypeFilter';
import { filterPostsByTags } from '$lib/posts/utils/postTagFilter';
import {
	labelForRange,
	rangeForGranularity,
	shiftRange,
	temporalToUtcYyyyMmDd,
	todayUtcYyyyMmDd
} from '$lib/posts/utils/schedulerCalendarDates';

export type {
	CalendarDisplayViewModel,
	CalendarGranularityViewModel,
	CalendarIntegrationFilterViewModel,
	CalendarLayoutModeViewModel,
	CalendarSchedulerFiltersViewModel,
	ChannelViewModel,
	DebugExportPostGroupResult,
	PostStateFilterVm,
	PostTagFilterVm,
	ScheduledPostsCalendarViewModel,
	SocialPlatformFilterVm
} from '$lib/posts/scheduler.types';
export { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts/scheduler.types';
export {
	registerEditPostGroupHandler,
	registerOpenActionsForPostGroupHandler,
	registerRefreshCalendarHandler,
	triggerEditPostGroup,
	triggerOpenActionsForPostGroup,
	triggerOpenSlotActions,
	triggerRefreshCalendar
} from '$lib/posts/schedulerCalendarHandlers';

function buildPlatformsCacheKey(
	allSocialPlatforms: boolean,
	selectedSocialPlatformIdentifiers: string[]
): string {
	if (allSocialPlatforms) return 'allPlatforms';
	if (!selectedSocialPlatformIdentifiers.length) return 'nonePlatforms';
	return [...selectedSocialPlatformIdentifiers]
		.map((s) => String(s ?? '').trim())
		.filter(Boolean)
		.sort()
		.join(',');
}

/**
 * Scheduled-post calendar: toolbar state, date ranges, integration filters, and Schedule-X events.
 */
export class SchedulerPresenter {
	scheduledPostsCalendarVm = $state<ScheduledPostsCalendarViewModel>(
		createInitialScheduledPostsCalendarViewModel()
	);

	private cachedPostsVm: CalendarPostRowViewModel[] = [];
	private cachedChannelById = new Map<string, ChannelViewModel>();

	get postsForChannelLookup(): readonly CalendarPostRowViewModel[] {
		return this.cachedPostsVm;
	}

	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly getScheduledPostsPresenter: GetScheduledPostsPresenter
	) {}

	private patchVm(partial: Partial<ScheduledPostsCalendarViewModel>): void {
		this.scheduledPostsCalendarVm = { ...this.scheduledPostsCalendarVm, ...partial };
	}

	/** Avoid replacing the VM when dates are unchanged — prevents `$effect` reload loops in the Scheduler. */
	private maybePatchRange(startDate: string, endDate: string): void {
		const { rangeStartDate, rangeEndDate } = this.scheduledPostsCalendarVm;
		if (startDate === rangeStartDate && endDate === rangeEndDate) return;
		this.patchVm({ rangeStartDate: startDate, rangeEndDate: endDate });
	}

	resetCalendarUiState(): void {
		this.cachedPostsVm = [];
		this.cachedChannelById = new Map();
		this.patchVm(createInitialScheduledPostsCalendarViewModel());
	}

	async listPosts(params: {
		organizationId: string;
		startIso: string;
		endIso: string;
		integrationIds?: string[] | null;
	}): Promise<{ ok: true; postsVm: CalendarPostRowViewModel[] } | { ok: false; error: string }> {
		try {
			const postsVm = await this.getScheduledPostsPresenter.loadCalendarPostsVm(params);
			return { ok: true, postsVm };
		} catch {
			return { ok: false, error: 'Could not load posts.' };
		}
	}

	async getPostGroup(postGroup: string): Promise<GetPostGroupResultViewModel> {
		try {
			const group = await this.getScheduledPostsPresenter.loadPostGroupDetailsVm(postGroup);
			if (!group) return { ok: false, error: 'Could not load post.' };
			return { ok: true, group };
		} catch {
			return { ok: false, error: 'Could not load post.' };
		}
	}

	debugExportPostGroup(postGroup: string): Promise<DebugExportPostGroupResult> {
		return this.postsRepository.debugExportPostGroup(postGroup);
	}

	async deletePostGroup(postGroup: string): Promise<PostUpsertProgrammerModel> {
		const resultPm = await this.postsRepository.deletePostGroup(postGroup);
		if (resultPm.ok) {
			this.evictPostGroupFromCache(postGroup);
		}
		return resultPm;
	}

	/**
	 * Remove a soft-deleted post group from the in-memory calendar cache.
	 * Clears `lastSuccessfulPostsKey` so the next range load refetches instead of reusing stale events.
	 */
	evictPostGroupFromCache(postGroup: string): void {
		const pg = postGroup?.trim();
		if (!pg || !this.cachedPostsVm.some((p) => p.postGroup === pg)) return;

		this.cachedPostsVm = this.cachedPostsVm.filter((p) => p.postGroup !== pg);
		this.applyClientFiltersToCache();
		this.patchVm({ lastSuccessfulPostsKey: '' });
	}

	deriveIntegrationFilter(
		channels: ChannelViewModel[],
		allGroups: boolean,
		selectedGroupIds: string[],
		allSocialPlatforms: boolean,
		selectedSocialPlatformIdentifiers: string[]
	) {
		return deriveIntegrationFilter(
			channels,
			allGroups,
			selectedGroupIds,
			allSocialPlatforms,
			selectedSocialPlatformIdentifiers
		);
	}

	isoToUtcZdt(iso: string): Temporal.ZonedDateTime {
		return Temporal.Instant.from(iso).toZonedDateTimeISO('UTC');
	}

	temporalToUtcYyyyMmDd(x: unknown): string {
		return temporalToUtcYyyyMmDd(x);
	}

	setInitialRangeForGranularity(next: CalendarGranularityViewModel): void {
		const range = rangeForGranularity(next, todayUtcYyyyMmDd());
		this.patchVm({ granularity: next, ...range });
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
		this.patchVm({
			prevUrlGroupId: g,
			...(g
				? { allGroups: false, selectedGroupIds: [g] }
				: { allGroups: true, selectedGroupIds: [] })
		});
	}

	populateAllTagSelectionWhenEmpty(
		tagsVm: readonly { name: string }[],
		posts: readonly { tagNames?: string[] }[] = this.cachedPostsVm
	): void {
		const vm = this.scheduledPostsCalendarVm;
		if (!vm.allTags || vm.selectedTagNames.length) return;
		const names = new Set<string>();
		for (const t of tagsVm) {
			const name = String(t.name ?? '').trim();
			if (name) names.add(name);
		}
		for (const p of posts) {
			for (const raw of p.tagNames ?? []) {
				const name = String(raw ?? '').trim();
				if (name) names.add(name);
			}
		}
		if (names.size === 0) return;
		this.patchVm({ selectedTagNames: [...names].sort((a, b) => a.localeCompare(b)) });
	}

	populateAllSocialPlatformSelectionWhenEmpty(channels: ChannelViewModel[]): void {
		const vm = this.scheduledPostsCalendarVm;
		if (!vm.allSocialPlatforms || !channels.length || vm.selectedSocialPlatformIdentifiers.length) {
			return;
		}
		const ids = [...new Set(channels.map((c) => String(c.identifier ?? '').trim()).filter(Boolean))].sort(
			(a, b) => a.localeCompare(b)
		);
		this.patchVm({ selectedSocialPlatformIdentifiers: ids });
	}

	populateAllGroupSelectionWhenEmpty(channels: ChannelViewModel[]): void {
		const vm = this.scheduledPostsCalendarVm;
		if (!vm.allGroups || !channels.length || vm.selectedGroupIds.length) return;

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
		this.patchVm({ selectedGroupIds: ids });
	}

	setGroupFilter(next: { allGroups: boolean; selectedGroupIds: string[] }): void {
		this.patchVm({ allGroups: next.allGroups, selectedGroupIds: next.selectedGroupIds });
	}

	setPostStateFilter(next: PostStateFilterVm): void {
		this.patchVm({
			allPostStates: next.allPostStates,
			selectedPostStates: next.selectedPostStates
		});
		this.applyClientFiltersToCache();
	}

	setTagFilter(next: PostTagFilterVm): void {
		this.patchVm({
			allTags: next.allTags,
			selectedTagNames: next.selectedTagNames
		});
		this.applyClientFiltersToCache();
	}

	setSocialPlatformFilter(next: SocialPlatformFilterVm): void {
		this.patchVm({
			allSocialPlatforms: next.allSocialPlatforms,
			selectedSocialPlatformIdentifiers: next.selectedSocialPlatformIdentifiers
		});
	}

	setGranularity(next: CalendarGranularityViewModel): void {
		this.setInitialRangeForGranularity(next);
	}

	setLayoutMode(next: CalendarLayoutModeViewModel): void {
		this.patchVm({ layoutMode: next });
	}

	goToday(): void {
		this.setInitialRangeForGranularity(this.scheduledPostsCalendarVm.granularity);
	}

	shiftRange(delta: number): void {
		const { rangeStartDate, granularity } = this.scheduledPostsCalendarVm;
		if (!rangeStartDate) return;
		this.patchVm(shiftRange(granularity, rangeStartDate, delta));
	}

	labelForRange(): string {
		const { rangeStartDate, rangeEndDate, granularity } = this.scheduledPostsCalendarVm;
		return labelForRange(granularity, rangeStartDate, rangeEndDate);
	}

	async syncRangeAndLoadPosts(params: {
		startDate: string;
		endDate: string;
		organizationId: string;
		channels: ChannelViewModel[];
		refreshKey: string | number;
	}): Promise<{ ok: true } | { ok: false; error: string }> {
		const { startDate, endDate, organizationId, channels, refreshKey } = params;
		const vm = this.scheduledPostsCalendarVm;
		const platformsKey = buildPlatformsCacheKey(
			vm.allSocialPlatforms,
			vm.selectedSocialPlatformIdentifiers
		);

		const integrationFilter = this.deriveIntegrationFilter(
			channels,
			vm.allGroups,
			vm.selectedGroupIds,
			vm.allSocialPlatforms,
			vm.selectedSocialPlatformIdentifiers
		);

		if (integrationFilter.kind === 'none') {
			return this.finishWithCachedKey(
				`none|${startDate}|${endDate}|${refreshKey}|${platformsKey}`,
				startDate,
				endDate,
				() => {
					this.cachedPostsVm = [];
					this.cachedChannelById = new Map();
					this.patchVm({ events: [] });
				}
			);
		}

		const integrationIds =
			integrationFilter.kind === 'all' ? null : integrationFilter.integrationIds;
		const idsKey = integrationIds?.length ? [...integrationIds].sort().join(',') : 'all';
		const requestKey = `${refreshKey}|${startDate}|${endDate}|${idsKey}|${platformsKey}`;

		if (requestKey === vm.lastSuccessfulPostsKey) {
			this.maybePatchRange(startDate, endDate);
			return { ok: true };
		}

		const channelById = new Map(channels.map((c) => [c.id, c] as const));
		this.maybePatchRange(startDate, endDate);
		this.patchVm({ loading: true });

		try {
			const startIso = new Date(`${startDate}T00:00:00.000Z`).toISOString();
			const endIso = new Date(`${endDate}T23:59:59.999Z`).toISOString();
			const result = await this.listPosts({ organizationId, startIso, endIso, integrationIds });

			if (!result.ok) {
				this.cachedPostsVm = [];
				this.cachedChannelById = new Map();
				this.patchVm({ events: [], lastSuccessfulPostsKey: '', loading: false });
				return { ok: false, error: result.error };
			}

			this.cachedPostsVm = result.postsVm;
			this.cachedChannelById = channelById;
			this.populateAllTagSelectionWhenEmpty([], this.cachedPostsVm);
			const events = this.buildEventsFromCache();

			this.patchVm({
				lastSuccessfulPostsKey: requestKey,
				events,
				loading: false
			});
			return { ok: true };
		} finally {
			if (this.scheduledPostsCalendarVm.loading) {
				this.patchVm({ loading: false });
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

	private finishWithCachedKey(
		cacheKey: string,
		startDate: string,
		endDate: string,
		onMiss: () => void
	): { ok: true } {
		this.maybePatchRange(startDate, endDate);
		if (cacheKey !== this.scheduledPostsCalendarVm.lastSuccessfulPostsKey) {
			onMiss();
			this.patchVm({ lastSuccessfulPostsKey: cacheKey });
		}
		return { ok: true };
	}

	private buildEventsFromCache() {
		const { allPostStates, selectedPostStates, allTags, selectedTagNames } =
			this.scheduledPostsCalendarVm;
		let filtered = filterPostsByPostType(
			this.cachedPostsVm,
			allPostStates,
			selectedPostStates
		);
		filtered = filterPostsByTags(filtered, allTags, selectedTagNames);
		return buildCalendarEventsFromPosts(filtered, this.cachedChannelById);
	}

	private applyClientFiltersToCache(): void {
		if (!this.scheduledPostsCalendarVm.lastSuccessfulPostsKey) return;
		this.patchVm({ events: this.buildEventsFromCache() });
	}
}
