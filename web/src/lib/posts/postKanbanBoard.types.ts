import { icons, type IconName } from '$data/icons';
import type { CalendarPostRowViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

/** One post row in the kanban list (calendar row fields + review/todo metadata). */
export interface PostKanbanRowViewModel extends CalendarPostRowViewModel {
	note?: string | null;
	isAgentEdited?: boolean;
	isReviewed?: boolean;
}

/** Kanban column keys mapped from `posts.state`. */
export type PostKanbanColumnId = 'draft' | 'scheduled' | 'published';

export const POST_KANBAN_COLUMNS = [
	{ id: 'draft', title: 'Drafted posts' },
	{ id: 'scheduled', title: 'Scheduled posts' },
	{ id: 'published', title: 'Published posts' }
] as const satisfies readonly { id: PostKanbanColumnId; title: string }[];

export type PostKanbanColumnOptionViewModel = (typeof POST_KANBAN_COLUMNS)[number];

export type PostKanbanSourceFilter = 'all' | 'agent' | 'human';

export type PostKanbanTimeFilter = 'all-upcoming' | 'next-week' | 'next-30-days';

export type PostKanbanColumnCountViewModel = {
	visible: number;
	total: number;
};

export type PostKanbanTimeFilterOptionViewModel = {
	id: PostKanbanTimeFilter;
	label: string;
};

export const POST_KANBAN_TIME_FILTER_OPTIONS: PostKanbanTimeFilterOptionViewModel[] = [
	{ id: 'all-upcoming', label: 'All Upcoming' },
	{ id: 'next-week', label: 'Next Week' },
	{ id: 'next-30-days', label: 'Next 30 Days' }
];

export type PostKanbanChannelSlotViewModel = {
	integrationId: string;
	picture: string | null;
	name: string;
	identifier: string;
};

export type PostKanbanCardViewModel = {
	postId: string;
	postGroup: string;
	column: PostKanbanColumnId;
	contentPreview: string;
	publishLabel: string;
	publishTimeLabel: string;
	relativePublishLabel: string;
	statusLabel: string;
	publishDateIso: string;
	note: string | null;
	channelSlots: PostKanbanChannelSlotViewModel[];
	hiddenChannelCount: number;
	primaryChannelName: string;
	isAgentEdited: boolean;
	isReviewed: boolean;
};

export type PostKanbanColumnsViewModel = Record<PostKanbanColumnId, PostKanbanCardViewModel[]>;

export type PostKanbanColumnCountsViewModel = Record<
	PostKanbanColumnId,
	PostKanbanColumnCountViewModel
>;

export type PostKanbanDeletePostGroupResultViewModel = { ok: true } | { ok: false; error: string };

export type PostKanbanCopyPostGroupJsonResultViewModel =
	| { ok: true; json: string }
	| { ok: false; error: string };

export type PostKanbanMoveCardResultViewModel =
	| { ok: true; targetColumn: PostKanbanColumnId }
	| { ok: false; error: string };

export type PostKanbanSourceFilterOptionViewModel = {
	id: PostKanbanSourceFilter;
	label: string;
	iconName?: IconName;
};

export const POST_KANBAN_SOURCE_FILTER_OPTIONS: PostKanbanSourceFilterOptionViewModel[] = [
	{ id: 'all', label: 'All' },
	{ id: 'agent', label: 'Agent', iconName: icons.Bot.name },
	{ id: 'human', label: 'Human', iconName: icons.UserRoundPen.name }
];

/** Single fetch window on load; time/source filters apply client-side only. */
export const KANBAN_BOARD_LOOKBACK_DAYS = 730;
export const KANBAN_BOARD_LOOKAHEAD_DAYS = 730;
