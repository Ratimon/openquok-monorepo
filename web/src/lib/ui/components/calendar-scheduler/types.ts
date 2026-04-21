import type { PostRowProgrammerModel } from '$lib/posts';
import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

export type CalendarDisplay = 'day' | 'week' | 'month' | 'list';

/** Day / week / month scope (OpenQuok: segmented control). */
export type CalendarGranularity = 'day' | 'week' | 'month';

/** Grid views vs list view (OpenQuok: calendar vs list icon toggle). */
export type CalendarLayoutMode = 'calendar' | 'list';

export type CalendarSchedulerFilters = {
	display: CalendarDisplay;
	/** Inclusive start (YYYY-MM-DD). */
	startDate: string;
	/** Inclusive end (YYYY-MM-DD). */
	endDate: string;
	groupId: string | null;
};

export type CalendarPostRow = PostRowProgrammerModel;

export type ChannelVm = CreateSocialPostChannelViewModel;

/** Checkbox id for channels that are not in any workspace channel group. */
export const CALENDAR_UNGROUPED_SENTINEL = '__ungrouped__';

