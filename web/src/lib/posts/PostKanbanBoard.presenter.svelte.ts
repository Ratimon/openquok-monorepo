import { icons, type IconName } from '$data/icons';
import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import { isProfileChannelDisplayName } from '$data/social-providers';
import {
	channelDisplayFromPostRow,
	resolvePostChannelDisplay
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type {
	GetPostGroupResultViewModel,
	GetScheduledPostsPresenter
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { PostsRepository, PostRowProgrammerModel } from '$lib/posts/Post.repository.svelte';
import {
	canMoveKanbanCard,
	columnToApiStatus,
	type KanbanCardDragPayload
} from '$lib/ui/components/kanban-board/kanbanDnd';
import dayjs from 'dayjs';

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

function parseKanbanPublishMs(publishDateIso: string): number {
	const ms = Date.parse(publishDateIso);
	return Number.isFinite(ms) ? ms : Number.NaN;
}

/** Posts without a valid publish time behave like upcoming (calendar list view). */
function isKanbanUpcomingPublishDate(publishDateIso: string, nowMs = Date.now()): boolean {
	const ms = parseKanbanPublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return true;
	return ms >= nowMs;
}

function matchesKanbanTimeFilter(
	publishDateIso: string,
	filter: PostKanbanTimeFilter,
	nowMs = Date.now()
): boolean {
	const ms = parseKanbanPublishMs(publishDateIso);
	const now = dayjs(nowMs);

	if (filter === 'all-upcoming') {
		return isKanbanUpcomingPublishDate(publishDateIso, nowMs);
	}
	if (filter === 'next-week') {
		if (!Number.isFinite(ms) || ms < nowMs) return false;
		return ms < now.add(7, 'day').endOf('day').valueOf();
	}
	if (filter === 'next-30-days') {
		if (!Number.isFinite(ms) || ms < nowMs) return false;
		return ms < now.add(30, 'day').endOf('day').valueOf();
	}
	return true;
}

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
	/** Agent/CLI-created posts have no dashboard author id. */
	isAgentOrigin: boolean;
	isAgentEdited: boolean;
	isReviewed: boolean;
};

export type PostKanbanColumnsViewModel = Record<PostKanbanColumnId, PostKanbanCardViewModel[]>;

export type PostKanbanColumnCountsViewModel = Record<PostKanbanColumnId, PostKanbanColumnCountViewModel>;

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
const KANBAN_BOARD_LOOKBACK_DAYS = 730;
const KANBAN_BOARD_LOOKAHEAD_DAYS = 730;

function filterCardsBySource(
	cardsVm: readonly PostKanbanCardViewModel[],
	sourceFilter: PostKanbanSourceFilter
): PostKanbanCardViewModel[] {
	return cardsVm.filter((card) => {
		if (sourceFilter === 'agent') return card.isAgentEdited;
		if (sourceFilter === 'human') return !card.isAgentEdited;
		return true;
	});
}

function filterCardsByTime(
	cardsVm: readonly PostKanbanCardViewModel[],
	timeFilter: PostKanbanTimeFilter
): PostKanbanCardViewModel[] {
	return cardsVm.filter((card) => matchesKanbanTimeFilter(card.publishDateIso, timeFilter));
}

function stateToColumn(state: string): PostKanbanColumnId | null {
	if (state === 'DRAFT') return 'draft';
	if (state === 'QUEUE') return 'scheduled';
	if (state === 'PUBLISHED') return 'published';
	return null;
}

function stripHtmlPreview(content: string): string {
	const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

function columnStatusLabel(column: PostKanbanColumnId): string {
	if (column === 'draft') return 'Draft';
	if (column === 'scheduled') return 'Scheduled';
	return 'Published';
}

function formatPublishScheduleLabel(publishDateIso: string): string {
	const ms = parseKanbanPublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return '';
	return dayjs(ms).format('MMM D, h:mm A');
}

/** Relative countdown from now to publish time, e.g. `(in 5 hrs)` or `(3 hrs ago)`. */
export function formatKanbanRelativePublishLabel(
	publishDateIso: string,
	nowMs = Date.now()
): string {
	const ms = parseKanbanPublishMs(publishDateIso);
	if (!Number.isFinite(ms)) return '';

	const diffMs = ms - nowMs;
	const absDiffMs = Math.abs(diffMs);
	const isFuture = diffMs > 0;

	const minuteMs = 60_000;
	const hourMs = 60 * minuteMs;
	const dayMs = 24 * hourMs;

	if (absDiffMs < minuteMs) {
		return isFuture ? '(in <1 min)' : '(just now)';
	}

	if (absDiffMs < hourMs) {
		const mins = Math.round(absDiffMs / minuteMs);
		return isFuture
			? `(in ${mins} min${mins === 1 ? '' : 's'})`
			: `(${mins} min${mins === 1 ? '' : 's'} ago)`;
	}

	if (absDiffMs < dayMs) {
		const hrs = Math.round(absDiffMs / hourMs);
		return isFuture
			? `(in ${hrs} hr${hrs === 1 ? '' : 's'})`
			: `(${hrs} hr${hrs === 1 ? '' : 's'} ago)`;
	}

	const days = Math.round(absDiffMs / dayMs);
	return isFuture
		? `(in ${days} day${days === 1 ? '' : 's'})`
		: `(${days} day${days === 1 ? '' : 's'} ago)`;
}

function displayToChannelSlot(display: {
	integrationId: string;
	picture: string | null;
	name: string;
	identifier: string;
}): PostKanbanChannelSlotViewModel {
	return {
		integrationId: display.integrationId,
		picture: display.picture,
		name: display.name,
		identifier: display.identifier
	};
}

function channelSlotFromChannel(
	integrationId: string,
	ch: CreateSocialPostChannelViewModel
): PostKanbanChannelSlotViewModel {
	return displayToChannelSlot({
		integrationId,
		picture: ch.picture,
		name: ch.name,
		identifier: ch.identifier
	});
}

function resolveChannelSlot(
	integrationId: string,
	groupRows: PostRowProgrammerModel[],
	channelById: Map<string, CreateSocialPostChannelViewModel>,
	channelSnapshotById: Map<string, PostKanbanChannelSlotViewModel>
): PostKanbanChannelSlotViewModel {
	const row = groupRows.find((r) => r.integrationId === integrationId);
	const resolved = resolvePostChannelDisplay(integrationId, row, channelById);
	const fromApi = channelDisplayFromPostRow(integrationId, row);
	if (fromApi?.name || fromApi?.picture) return displayToChannelSlot(fromApi);

	const snapshot = channelSnapshotById.get(integrationId);
	if (
		snapshot &&
		(snapshot.picture || isProfileChannelDisplayName(snapshot.name, snapshot.identifier))
	) {
		return snapshot;
	}

	const ch = channelById.get(integrationId);
	if (ch) return channelSlotFromChannel(integrationId, ch);
	if (fromApi) return displayToChannelSlot(fromApi);
	if (snapshot) return snapshot;

	return displayToChannelSlot(resolved);
}

function toCardsVm(
	listPm: PostRowProgrammerModel[],
	channelById: Map<string, CreateSocialPostChannelViewModel>,
	channelSnapshotById: Map<string, PostKanbanChannelSlotViewModel>
): PostKanbanCardViewModel[] {
	const byGroup = new Map<string, PostRowProgrammerModel[]>();
	for (const row of listPm) {
		const list = byGroup.get(row.postGroup) ?? [];
		list.push(row);
		byGroup.set(row.postGroup, list);
	}

	const cards: PostKanbanCardViewModel[] = [];
	for (const [postGroup, groupRows] of byGroup) {
		const rep = groupRows[0]!;
		const column = stateToColumn(rep.state);
		if (!column) continue;

		const content =
			groupRows.find((r) => r.content?.trim())?.content?.trim() ?? rep.content?.trim() ?? '';
		const integrationIds = [
			...new Set(
				groupRows.map((r) => r.integrationId).filter((id): id is string => Boolean(id))
			)
		];
		const channelSlots: PostKanbanChannelSlotViewModel[] = integrationIds.map((integrationId) =>
			resolveChannelSlot(integrationId, groupRows, channelById, channelSnapshotById)
		);
		const primaryChannelName = channelSlots[0]?.name ?? '';
		const previewCount = Math.min(channelSlots.length, 3);
		cards.push({
			postId: rep.id,
			postGroup,
			column,
			contentPreview: stripHtmlPreview(content),
			publishLabel: dayjs(rep.publishDate).format('MMM D, YYYY h:mm A'),
			publishTimeLabel: formatPublishScheduleLabel(rep.publishDate),
			relativePublishLabel: formatKanbanRelativePublishLabel(rep.publishDate),
			statusLabel: columnStatusLabel(column),
			publishDateIso: rep.publishDate,
			note: rep.note ?? null,
			channelSlots,
			hiddenChannelCount: Math.max(0, channelSlots.length - previewCount),
			primaryChannelName,
			isAgentOrigin: rep.createdByUserId == null,
			isAgentEdited: rep.isAgentEdited ?? false,
			isReviewed: rep.isReviewed ?? false
		});
	}
	return cards;
}

function columnsVmFromCards(cardsVm: readonly PostKanbanCardViewModel[]): PostKanbanColumnsViewModel {
	const columns: PostKanbanColumnsViewModel = { draft: [], scheduled: [], published: [] };
	for (const card of cardsVm) {
		columns[card.column].push(card);
	}
	for (const col of Object.keys(columns) as PostKanbanColumnId[]) {
		columns[col].sort((a, b) => a.publishLabel.localeCompare(b.publishLabel));
	}
	return columns;
}

export class PostKanbanBoardPresenter {
	readonly columnOptions = POST_KANBAN_COLUMNS;
	readonly sourceFilterOptions = POST_KANBAN_SOURCE_FILTER_OPTIONS;
	readonly timeFilterOptions = POST_KANBAN_TIME_FILTER_OPTIONS;

	sourceFilter = $state<PostKanbanSourceFilter>('all');
	timeFilter = $state<PostKanbanTimeFilter>('all-upcoming');
	status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	error = $state<string | null>(null);
	movingPostGroup = $state<string | null>(null);
	channels = $state<readonly CreateSocialPostChannelViewModel[]>([]);

	cardsVm = $state<PostKanbanCardViewModel[]>([]);

	columnsVm = $derived.by((): PostKanbanColumnsViewModel => {
		const sourceFiltered = filterCardsBySource(this.cardsVm, this.sourceFilter);
		const filtered = filterCardsByTime(sourceFiltered, this.timeFilter);
		return columnsVmFromCards(filtered);
	});

	columnCountsVm = $derived.by((): PostKanbanColumnCountsViewModel => {
		const sourceFiltered = filterCardsBySource(this.cardsVm, this.sourceFilter);
		const timeFiltered = filterCardsByTime(sourceFiltered, this.timeFilter);
		const totalColumns = columnsVmFromCards(sourceFiltered);
		const visibleColumns = columnsVmFromCards(timeFiltered);
		return {
			draft: {
				visible: visibleColumns.draft.length,
				total: totalColumns.draft.length
			},
			scheduled: {
				visible: visibleColumns.scheduled.length,
				total: totalColumns.scheduled.length
			},
			published: {
				visible: visibleColumns.published.length,
				total: totalColumns.published.length
			}
		};
	});

	private organizationId = $state<string | null>(null);
	private listPm = $state<PostRowProgrammerModel[]>([]);

	/** Loaded post rows (include API channel metadata for modals). */
	get postsForChannelLookup(): readonly PostRowProgrammerModel[] {
		return this.listPm;
	}
	/** Last-known channel labels per workspace (survives channel list reload / workspace switch). */
	private channelSnapshotsByOrg = new Map<string, Map<string, PostKanbanChannelSlotViewModel>>();
	private loadSeq = 0;

	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly getScheduledPostsPresenter: GetScheduledPostsPresenter
	) {}

	getPostGroup(postGroup: string): Promise<GetPostGroupResultViewModel> {
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

	async loadPostGroupJson(postGroup: string): Promise<PostKanbanCopyPostGroupJsonResultViewModel> {
		const resultVm = await this.getPostGroup(postGroup);
		if (!resultVm.ok) return { ok: false, error: resultVm.error };
		return { ok: true, json: JSON.stringify(resultVm.group, null, 2) };
	}

	async deletePostGroup(postGroup: string): Promise<PostKanbanDeletePostGroupResultViewModel> {
		const prevListPm = this.listPm.filter((r) => r.postGroup === postGroup);
		this.listPm = this.listPm.filter((r) => r.postGroup !== postGroup);
		this.rebuildCardsVm();

		const resultPm = await this.postsRepository.deletePostGroup(postGroup);
		if (!resultPm.ok) {
			this.listPm = [...this.listPm, ...prevListPm];
			this.rebuildCardsVm();
			return { ok: false, error: resultPm.error };
		}
		return { ok: true };
	}

	setChannels(organizationId: string, next: readonly CreateSocialPostChannelViewModel[]) {
		this.channels = next;
		this.rememberChannelSnapshots(organizationId, next);
		if (organizationId === this.organizationId) {
			this.rebuildCardsVm();
		}
	}

	setSourceFilter(next: PostKanbanSourceFilter) {
		this.sourceFilter = next;
	}

	setTimeFilter(next: PostKanbanTimeFilter) {
		this.timeFilter = next;
	}

	private listPostsIsoRange(): { startIso: string; endIso: string } {
		const startIso = dayjs()
			.subtract(KANBAN_BOARD_LOOKBACK_DAYS, 'day')
			.startOf('day')
			.toISOString();
		const endIso = dayjs().add(KANBAN_BOARD_LOOKAHEAD_DAYS, 'day').endOf('day').toISOString();
		return { startIso, endIso };
	}

	async load(organizationId: string | null | undefined): Promise<void> {
		const seq = ++this.loadSeq;
		if (!organizationId) {
			this.organizationId = null;
			this.listPm = [];
			this.cardsVm = [];
			this.status = 'ready';
			return;
		}
		if (organizationId !== this.organizationId) {
			this.listPm = [];
			this.cardsVm = [];
		}
		this.organizationId = organizationId;
		this.status = 'loading';
		this.error = null;

		const { startIso, endIso } = this.listPostsIsoRange();
		const resultPm = await this.postsRepository.listPosts({
			organizationId,
			startIso,
			endIso
		});

		if (seq !== this.loadSeq) return;

		if (!resultPm.ok) {
			this.status = 'error';
			this.error = resultPm.error;
			this.listPm = [];
			this.cardsVm = [];
			return;
		}

		this.listPm = resultPm.posts;
		this.rebuildCardsVm();
		this.status = 'ready';
	}

	async refresh(): Promise<void> {
		await this.load(this.organizationId);
	}

	private channelById(): Map<string, CreateSocialPostChannelViewModel> {
		return new Map(this.channels.map((c) => [c.id, c]));
	}

	private channelSnapshotById(): Map<string, PostKanbanChannelSlotViewModel> {
		const orgId = this.organizationId;
		if (!orgId) return new Map();
		return this.channelSnapshotsByOrg.get(orgId) ?? new Map();
	}

	private rememberChannelSnapshots(
		organizationId: string,
		channels: readonly CreateSocialPostChannelViewModel[]
	): void {
		let snapshots = this.channelSnapshotsByOrg.get(organizationId);
		if (!snapshots) {
			snapshots = new Map();
			this.channelSnapshotsByOrg.set(organizationId, snapshots);
		}
		for (const ch of channels) {
			snapshots.set(ch.id, channelSlotFromChannel(ch.id, ch));
		}
	}

	private rebuildCardsVm() {
		this.cardsVm = toCardsVm(this.listPm, this.channelById(), this.channelSnapshotById());
	}

	private patchListPm(postId: string, patch: Partial<PostRowProgrammerModel>) {
		const rep = this.listPm.find((r) => r.id === postId);
		if (!rep) return;
		const group = rep.postGroup;
		this.listPm = this.listPm.map((r) =>
			r.postGroup === group ? { ...r, ...patch, id: r.id } : r
		);
		this.rebuildCardsVm();
	}

	async toggleReviewed(postId: string, isReviewed: boolean): Promise<void> {
		const org = this.organizationId;
		if (!org) return;
		const prev = this.listPm.find((r) => r.id === postId);
		this.patchListPm(postId, { isReviewed, isAgentEdited: false });
		const resultPm = await this.postsRepository.updatePostReviewTodo({
			organizationId: org,
			postId,
			isReviewed
		});
		if (!resultPm.ok) {
			if (prev) this.patchListPm(postId, { isReviewed: prev.isReviewed, isAgentEdited: prev.isAgentEdited });
			this.error = resultPm.error;
			return;
		}
		this.applyListPmFromUpdate(resultPm.posts);
	}

	private findCardVmByPostGroup(postGroup: string): PostKanbanCardViewModel | undefined {
		return this.cardsVm.find((c) => c.postGroup === postGroup);
	}

	/** Draft ↔ scheduled via session `PUT /posts/:postId/status` (same as CLI `posts:status`). */
	async moveCardToColumn(
		payload: KanbanCardDragPayload,
		targetColumn: PostKanbanColumnId
	): Promise<PostKanbanMoveCardResultViewModel> {
		const org = this.organizationId;
		if (!org) {
			return { ok: false, error: 'Create or select a workspace first.' };
		}
		if (!canMoveKanbanCard(payload.sourceColumn, targetColumn)) {
			return {
				ok: false,
				error:
					targetColumn === 'published' || payload.sourceColumn === 'published'
						? 'Published posts cannot be moved on the board.'
						: 'This column change is not allowed.'
			};
		}

		const targetStatus = columnToApiStatus(targetColumn);
		if (!targetStatus) {
			return { ok: false, error: 'This column change is not allowed.' };
		}

		const cardVm = this.findCardVmByPostGroup(payload.postGroup);
		const postId = cardVm?.postId ?? payload.postId;
		if (!postId) {
			return { ok: false, error: 'Could not find post to move.' };
		}

		const targetState = targetStatus === 'draft' ? 'DRAFT' : 'QUEUE';
		const prevListPm = this.listPm.filter((r) => r.postGroup === payload.postGroup);

		this.movingPostGroup = payload.postGroup;
		this.patchListPm(postId, { state: targetState, isAgentEdited: false });

		const resultPm = await this.postsRepository.flipPostStatus({
			organizationId: org,
			postId,
			status: targetStatus
		});
		this.movingPostGroup = null;
		if (!resultPm.ok) {
			this.listPm = [
				...this.listPm.filter((r) => r.postGroup !== payload.postGroup),
				...prevListPm
			];
			this.rebuildCardsVm();
			return { ok: false, error: resultPm.error };
		}
		this.mergeListPmFromFlip(resultPm.posts);
		return { ok: true, targetColumn };
	}

	private mergeListPmFromFlip(updated: PostRowProgrammerModel[]) {
		if (updated.length === 0) return;
		const group = updated[0]!.postGroup;
		this.listPm = [...this.listPm.filter((r) => r.postGroup !== group), ...updated];
		this.rebuildCardsVm();
	}

	async updateNote(postId: string, note: string): Promise<void> {
		const org = this.organizationId;
		if (!org) return;
		const prev = this.listPm.find((r) => r.id === postId);
		this.patchListPm(postId, { note: note || null, isAgentEdited: false });
		const resultPm = await this.postsRepository.updatePostReviewTodo({
			organizationId: org,
			postId,
			note: note || null
		});
		if (!resultPm.ok) {
			if (prev) this.patchListPm(postId, { note: prev.note ?? null, isAgentEdited: prev.isAgentEdited });
			this.error = resultPm.error;
			return;
		}
		this.applyListPmFromUpdate(resultPm.posts);
	}

	private applyListPmFromUpdate(updated: PostRowProgrammerModel[]) {
		if (updated.length === 0) return;
		const group = updated[0]!.postGroup;
		const patch = updated[0]!;
		this.listPm = this.listPm.map((r) =>
			r.postGroup === group
				? {
						...r,
						note: patch.note ?? null,
						isAgentEdited: patch.isAgentEdited ?? false,
						isReviewed: patch.isReviewed ?? false
					}
				: r
		);
		this.rebuildCardsVm();
	}
}
