import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type {
	GetPostGroupResultViewModel,
	GetScheduledPostsPresenter
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { PostsRepository } from '$lib/posts/Post.repository.svelte';
import type { SchedulerPresenter } from '$lib/posts/Scheduler.presenter.svelte';
import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts/scheduler.types';
import type { PostTagFilterVm, SocialPlatformFilterVm } from '$lib/posts/scheduler.types';
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
	filterKanbanCardsByIntegration,
	filterKanbanCardsBySource,
	filterKanbanCardsByTags,
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
	allGroups = $state(true);
	selectedGroupIds = $state<string[]>([]);
	allSocialPlatforms = $state(true);
	selectedSocialPlatformIdentifiers = $state<string[]>([]);
	allTags = $state(true);
	selectedTagNames = $state<string[]>([]);
	status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	error = $state<string | null>(null);
	movingPostGroup = $state<string | null>(null);
	channels = $state<readonly CreateSocialPostChannelViewModel[]>([]);
	cardsVm = $state<PostKanbanCardViewModel[]>([]);

	private filteredCardsVm = $derived.by(() => {
		const integrationFiltered = filterKanbanCardsByIntegration(
			this.cardsVm,
			this.channels,
			this.allGroups,
			this.selectedGroupIds,
			this.allSocialPlatforms,
			this.selectedSocialPlatformIdentifiers
		);
		const tagFiltered = filterKanbanCardsByTags(
			integrationFiltered,
			this.allTags,
			this.selectedTagNames
		);
		return filterKanbanCardsBySource(tagFiltered, this.sourceFilter);
	});

	columnsVm = $derived.by((): PostKanbanColumnsViewModel =>
		buildKanbanColumnsWithTimeFilter(this.filteredCardsVm, this.timeFilter)
	);

	columnCountsVm = $derived.by((): PostKanbanColumnCountsViewModel =>
		buildKanbanColumnCounts(
			buildKanbanColumnsWithTimeFilter(this.filteredCardsVm, this.timeFilter),
			groupKanbanCardsIntoColumns(this.filteredCardsVm)
		)
	);

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
		this.populateAllGroupSelectionWhenEmpty(next);
		this.populateAllSocialPlatformSelectionWhenEmpty(next);
		if (organizationId === this.organizationId) {
			this.rebuildCardsVm();
		}
	}

	setGroupFilter(next: { allGroups: boolean; selectedGroupIds: string[] }): void {
		this.allGroups = next.allGroups;
		this.selectedGroupIds = next.selectedGroupIds;
	}

	setSocialPlatformFilter(next: SocialPlatformFilterVm): void {
		this.allSocialPlatforms = next.allSocialPlatforms;
		this.selectedSocialPlatformIdentifiers = next.selectedSocialPlatformIdentifiers;
	}

	setTagFilter(next: PostTagFilterVm): void {
		this.allTags = next.allTags;
		this.selectedTagNames = next.selectedTagNames;
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
			this.resetIntegrationFilters();
			this.status = 'ready';
			return;
		}
		if (organizationId !== this.organizationId) {
			this.listVm = [];
			this.cardsVm = [];
			this.resetIntegrationFilters();
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
		this.populateAllTagSelectionWhenEmpty([], this.listVm);
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

	/**
	 * Billing-month usage delta when moving a post group across draft ↔ scheduled
	 * (`QUEUE` rows per channel in the group).
	 */
	postsUsageDeltaForMove(
		payload: KanbanCardDragPayload,
		targetColumn: PostKanbanColumnId
	): number {
		if (!canMoveKanbanCard(payload.sourceColumn, targetColumn)) return 0;
		const rowCount = this.listVm.filter((r) => r.postGroup === payload.postGroup).length;
		if (rowCount < 1) return 0;
		if (payload.sourceColumn === 'draft' && targetColumn === 'scheduled') return rowCount;
		if (payload.sourceColumn === 'scheduled' && targetColumn === 'draft') return -rowCount;
		return 0;
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

	private resetIntegrationFilters(): void {
		this.allGroups = true;
		this.selectedGroupIds = [];
		this.allSocialPlatforms = true;
		this.selectedSocialPlatformIdentifiers = [];
		this.allTags = true;
		this.selectedTagNames = [];
	}

	populateAllTagSelectionWhenEmpty(
		tagsVm: readonly { name: string }[],
		posts: readonly { tagNames?: string[] }[] = this.listVm
	): void {
		if (!this.allTags || this.selectedTagNames.length) return;
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
		this.selectedTagNames = [...names].sort((a, b) => a.localeCompare(b));
	}

	private populateAllSocialPlatformSelectionWhenEmpty(
		channels: readonly CreateSocialPostChannelViewModel[]
	): void {
		if (
			!this.allSocialPlatforms ||
			!channels.length ||
			this.selectedSocialPlatformIdentifiers.length
		) {
			return;
		}
		const ids = [
			...new Set(channels.map((c) => String(c.identifier ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		this.selectedSocialPlatformIdentifiers = ids;
	}

	private populateAllGroupSelectionWhenEmpty(
		channels: readonly CreateSocialPostChannelViewModel[]
	): void {
		if (!this.allGroups || !channels.length || this.selectedGroupIds.length) return;

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
		this.selectedGroupIds = ids;
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
