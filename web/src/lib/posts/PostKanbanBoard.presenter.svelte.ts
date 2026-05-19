import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type {
	GetPostGroupResultViewModel,
	GetScheduledPostsPresenter
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { PostsRepository } from '$lib/posts/Post.repository.svelte';
import type { SchedulerPresenter } from '$lib/posts/Scheduler.presenter.svelte';
import {
	KANBAN_BOARD_LOOKAHEAD_DAYS,
	KANBAN_BOARD_LOOKBACK_DAYS,
	POST_KANBAN_COLUMNS,
	POST_KANBAN_SOURCE_FILTER_OPTIONS,
	POST_KANBAN_TIME_FILTER_OPTIONS,
	type PostKanbanCardViewModel,
	type PostKanbanChannelSlotViewModel,
	type PostKanbanColumnCountsViewModel,
	type PostKanbanColumnId,
	type PostKanbanColumnsViewModel,
	type PostKanbanCopyPostGroupJsonResultViewModel,
	type PostKanbanDeletePostGroupResultViewModel,
	type PostKanbanMoveCardResultViewModel,
	type PostKanbanRowViewModel,
	type PostKanbanSourceFilter,
	type PostKanbanTimeFilter
} from '$lib/posts/postKanbanBoard.types';
import {
	buildKanbanCardsVm,
	buildKanbanColumnCounts,
	buildKanbanColumnsWithTimeFilter,
	channelSlotFromChannel,
	filterKanbanCardsBySource,
	groupKanbanCardsIntoColumns
} from '$lib/posts/utils/postKanbanBoardCards';
import { toPostKanbanRowsVm } from '$lib/posts/utils/postKanbanBoardRows';
import {
	canMoveKanbanCard,
	columnToApiStatus,
	type KanbanCardDragPayload
} from '$lib/ui/components/kanban-board/kanbanDnd';
import dayjs from 'dayjs';

export type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel,
	PostKanbanColumnCountViewModel,
	PostKanbanColumnCountsViewModel,
	PostKanbanColumnId,
	PostKanbanColumnOptionViewModel,
	PostKanbanColumnsViewModel,
	PostKanbanCopyPostGroupJsonResultViewModel,
	PostKanbanDeletePostGroupResultViewModel,
	PostKanbanMoveCardResultViewModel,
	PostKanbanRowViewModel,
	PostKanbanSourceFilter,
	PostKanbanSourceFilterOptionViewModel,
	PostKanbanTimeFilter,
	PostKanbanTimeFilterOptionViewModel
} from '$lib/posts/postKanbanBoard.types';

export {
	POST_KANBAN_COLUMNS,
	POST_KANBAN_SOURCE_FILTER_OPTIONS,
	POST_KANBAN_TIME_FILTER_OPTIONS
} from '$lib/posts/postKanbanBoard.types';

export { formatKanbanRelativePublishLabel } from '$lib/posts/utils/postKanbanBoardFormat';

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

	columnsVm = $derived.by((): PostKanbanColumnsViewModel =>
		buildKanbanColumnsWithTimeFilter(
			filterKanbanCardsBySource(this.cardsVm, this.sourceFilter),
			this.timeFilter
		)
	);

	columnCountsVm = $derived.by((): PostKanbanColumnCountsViewModel => {
		const sourceFiltered = filterKanbanCardsBySource(this.cardsVm, this.sourceFilter);
		return buildKanbanColumnCounts(
			buildKanbanColumnsWithTimeFilter(sourceFiltered, this.timeFilter),
			groupKanbanCardsIntoColumns(sourceFiltered)
		);
	});

	private organizationId = $state<string | null>(null);
	private listVm = $state<PostKanbanRowViewModel[]>([]);
	private channelSnapshotsByOrg = new Map<string, Map<string, PostKanbanChannelSlotViewModel>>();
	private loadSeq = 0;

	/** Loaded post rows (include API channel metadata for modals). */
	get postsForChannelLookup(): readonly PostKanbanRowViewModel[] {
		return this.listVm;
	}

	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly getScheduledPostsPresenter: GetScheduledPostsPresenter,
		private readonly schedulerPresenter: SchedulerPresenter
	) {}

	async getPostGroup(postGroup: string): Promise<GetPostGroupResultViewModel> {
		try {
			const group = await this.getScheduledPostsPresenter.loadPostGroupDetailsVm(postGroup);
			if (!group) return { ok: false, error: 'Could not load post.' };
			return { ok: true, group };
		} catch {
			return { ok: false, error: 'Could not load post.' };
		}
	}

	async loadPostGroupJson(postGroup: string): Promise<PostKanbanCopyPostGroupJsonResultViewModel> {
		const resultVm = await this.getPostGroup(postGroup);
		if (!resultVm.ok) return { ok: false, error: resultVm.error };
		return { ok: true, json: JSON.stringify(resultVm.group, null, 2) };
	}

	async deletePostGroup(postGroup: string): Promise<PostKanbanDeletePostGroupResultViewModel> {
		const prevRows = this.listVm.filter((r) => r.postGroup === postGroup);
		this.removePostGroup(postGroup);

		const resultPm = await this.postsRepository.deletePostGroup(postGroup);
		if (!resultPm.ok) {
			this.listVm = [...this.listVm, ...prevRows];
			this.rebuildCardsVm();
			return { ok: false, error: resultPm.error };
		}
		this.schedulerPresenter.evictPostGroupFromCache(postGroup);
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

	async load(organizationId: string | null | undefined): Promise<void> {
		const seq = ++this.loadSeq;
		if (!organizationId) {
			this.organizationId = null;
			this.listVm = [];
			this.cardsVm = [];
			this.status = 'ready';
			return;
		}
		if (organizationId !== this.organizationId) {
			this.listVm = [];
			this.cardsVm = [];
		}
		this.organizationId = organizationId;
		this.status = 'loading';
		this.error = null;

		const resultPm = await this.postsRepository.listPosts({
			organizationId,
			...this.listPostsIsoRange()
		});

		if (seq !== this.loadSeq) return;

		if (!resultPm.ok) {
			this.status = 'error';
			this.error = resultPm.error;
			this.listVm = [];
			this.cardsVm = [];
			return;
		}

		this.listVm = toPostKanbanRowsVm(resultPm.posts);
		this.rebuildCardsVm();
		this.status = 'ready';
	}

	async refresh(): Promise<void> {
		await this.load(this.organizationId);
	}

	async toggleReviewed(postId: string, isReviewed: boolean): Promise<void> {
		await this.updatePostReviewField(postId, { isReviewed }, { isReviewed });
	}

	async updateNote(postId: string, note: string): Promise<void> {
		const normalized = note || null;
		await this.updatePostReviewField(postId, { note: normalized }, { note: normalized });
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

		const cardVm = this.cardsVm.find((c) => c.postGroup === payload.postGroup);
		const postId = cardVm?.postId ?? payload.postId;
		if (!postId) {
			return { ok: false, error: 'Could not find post to move.' };
		}

		const targetState = targetStatus === 'draft' ? 'DRAFT' : 'QUEUE';
		const prevRows = this.listVm.filter((r) => r.postGroup === payload.postGroup);

		this.movingPostGroup = payload.postGroup;
		this.patchPostGroup(postId, { state: targetState, isAgentEdited: false });

		const resultPm = await this.postsRepository.flipPostStatus({
			organizationId: org,
			postId,
			status: targetStatus
		});
		this.movingPostGroup = null;

		if (!resultPm.ok) {
			this.replacePostGroupRows(payload.postGroup, prevRows);
			return { ok: false, error: resultPm.error };
		}
		this.replacePostGroupRows(payload.postGroup, toPostKanbanRowsVm(resultPm.posts));
		return { ok: true, targetColumn };
	}

	private listPostsIsoRange(): { startIso: string; endIso: string } {
		return {
			startIso: dayjs()
				.subtract(KANBAN_BOARD_LOOKBACK_DAYS, 'day')
				.startOf('day')
				.toISOString(),
			endIso: dayjs().add(KANBAN_BOARD_LOOKAHEAD_DAYS, 'day').endOf('day').toISOString()
		};
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
		this.cardsVm = buildKanbanCardsVm(
			this.listVm,
			this.channelById(),
			this.channelSnapshotById()
		);
	}

	private removePostGroup(postGroup: string) {
		this.listVm = this.listVm.filter((r) => r.postGroup !== postGroup);
		this.rebuildCardsVm();
	}

	private replacePostGroupRows(postGroup: string, rows: PostKanbanRowViewModel[]) {
		this.listVm = [...this.listVm.filter((r) => r.postGroup !== postGroup), ...rows];
		this.rebuildCardsVm();
	}

	private patchPostGroup(postId: string, patch: Partial<PostKanbanRowViewModel>) {
		const rep = this.listVm.find((r) => r.id === postId);
		if (!rep) return;
		const group = rep.postGroup;
		this.listVm = this.listVm.map((r) =>
			r.postGroup === group ? { ...r, ...patch, id: r.id } : r
		);
		this.rebuildCardsVm();
	}

	private async updatePostReviewField(
		postId: string,
		optimisticPatch: Partial<PostKanbanRowViewModel>,
		apiPatch: { isReviewed?: boolean; note?: string | null }
	): Promise<void> {
		const org = this.organizationId;
		if (!org) return;

		const prev = this.listVm.find((r) => r.id === postId);
		this.patchPostGroup(postId, { ...optimisticPatch, isAgentEdited: false });

		const resultPm = await this.postsRepository.updatePostReviewTodo({
			organizationId: org,
			postId,
			...apiPatch
		});

		if (!resultPm.ok) {
			if (prev) {
				this.patchPostGroup(postId, {
					isReviewed: prev.isReviewed,
					isAgentEdited: prev.isAgentEdited,
					note: prev.note ?? null
				});
			}
			this.error = resultPm.error;
			return;
		}

		const updated = resultPm.posts[0];
		if (!updated) return;

		this.replacePostGroupRows(updated.postGroup, toPostKanbanRowsVm(resultPm.posts));
	}
}
