import type { CalendarEventExternal } from '@schedule-x/calendar';
import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { DebugExportPostGroupProgrammerModel } from '$lib/posts/Post.repository.svelte';
import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

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

/** Post state checkbox filter (calendar toolbar). */
export type PostStateFilterVm = {
	allPostStates: boolean;
	selectedPostStates: string[];
};

/** Social platform checkbox filter (calendar toolbar). */
export type SocialPlatformFilterVm = {
	allSocialPlatforms: boolean;
	selectedSocialPlatformIdentifiers: string[];
};

/** Post tag checkbox filter (calendar / kanban toolbar). */
export type PostTagFilterVm = {
	allTags: boolean;
	selectedTagNames: string[];
};

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
	allTags: boolean;
	selectedTagNames: string[];
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

export type SchedulerSlotSummaryEntry = {
	postId: string;
	postGroup: string;
	integrationId: string;
	state: string;
	publishDate: string;
	content: string;
	channelPicture: string;
	channelName: string;
	channelIdentifier: string;
};

/** Schedule-X event extended with post rows and slot preview metadata. */
export type SchedulerCalendarEvent = CalendarEventExternal & {
	channel?: ChannelViewModel | null;
	post?: CalendarPostRowViewModel;
	posts?: CalendarPostRowViewModel[];
	slotSummary?: SchedulerSlotSummaryEntry[];
};

export function createInitialScheduledPostsCalendarViewModel(): ScheduledPostsCalendarViewModel {
	return {
		granularity: 'week',
		layoutMode: 'calendar',
		allGroups: true,
		selectedGroupIds: [],
		allSocialPlatforms: true,
		selectedSocialPlatformIdentifiers: [],
		allPostStates: true,
		selectedPostStates: [],
		allTags: true,
		selectedTagNames: [],
		rangeStartDate: '',
		rangeEndDate: '',
		loading: false,
		lastSuccessfulPostsKey: '',
		prevUrlGroupId: undefined,
		events: []
	};
}
