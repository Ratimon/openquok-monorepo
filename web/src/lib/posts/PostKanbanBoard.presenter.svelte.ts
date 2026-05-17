import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type {
	GetPostGroupResultViewModel,
	GetScheduledPostsPresenter
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { PostsRepository, PostRowProgrammerModel } from '$lib/posts/Post.repository.svelte';
import type { PostKanbanColumnId, PostKanbanSourceFilter } from '$lib/ui/components/kanban-board/kanbanTypes';
import {
	canMoveKanbanCard,
	columnToApiStatus,
	type KanbanCardDragPayload
} from '$lib/ui/components/kanban-board/kanbanDnd';
import dayjs from 'dayjs';

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

export type PostKanbanDeletePostGroupResultViewModel = { ok: true } | { ok: false; error: string };

export type PostKanbanCopyPostGroupJsonResultViewModel =
	| { ok: true; json: string }
	| { ok: false; error: string };

export type PostKanbanMoveCardResultViewModel =
	| { ok: true; targetColumn: PostKanbanColumnId }
	| { ok: false; error: string };

const KANBAN_LOOKBACK_DAYS = 90;
const KANBAN_LOOKAHEAD_DAYS = 90;

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

function formatPublishTimeLabel(publishDateIso: string): string {
	const ms = Date.parse(publishDateIso);
	if (!Number.isFinite(ms)) return '';
	return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toCardsVm(
	listPm: PostRowProgrammerModel[],
	channelById: Map<string, CreateSocialPostChannelViewModel>
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
		const channelSlots: PostKanbanChannelSlotViewModel[] = integrationIds.map((integrationId) => {
			const ch = channelById.get(integrationId);
			return {
				integrationId,
				picture: ch?.picture ?? null,
				name: ch?.name ?? '',
				identifier: ch?.identifier ?? 'threads'
			};
		});
		const primaryChannelName = channelSlots[0]?.name ?? '';
		const previewCount = Math.min(channelSlots.length, 3);
		cards.push({
			postId: rep.id,
			postGroup,
			column,
			contentPreview: stripHtmlPreview(content),
			publishLabel: dayjs(rep.publishDate).format('MMM D, YYYY h:mm A'),
			publishTimeLabel: formatPublishTimeLabel(rep.publishDate),
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
	sourceFilter = $state<PostKanbanSourceFilter>('all');
	status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	error = $state<string | null>(null);
	movingPostGroup = $state<string | null>(null);
	channels = $state<readonly CreateSocialPostChannelViewModel[]>([]);

	cardsVm = $state<PostKanbanCardViewModel[]>([]);

	columnsVm = $derived.by((): PostKanbanColumnsViewModel => {
		// Same rule as the AI badge on the card (`isAgentEdited`), not agent-origin / Edited badge.
		const filtered = this.cardsVm.filter((card) => {
			if (this.sourceFilter === 'agent') return card.isAgentEdited;
			if (this.sourceFilter === 'human') return !card.isAgentEdited;
			return true;
		});
		return columnsVmFromCards(filtered);
	});

	private organizationId = $state<string | null>(null);
	private listPm = $state<PostRowProgrammerModel[]>([]);

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

	setChannels(next: readonly CreateSocialPostChannelViewModel[]) {
		this.channels = next;
		this.rebuildCardsVm();
	}

	setSourceFilter(next: PostKanbanSourceFilter) {
		this.sourceFilter = next;
	}

	async load(organizationId: string | null | undefined): Promise<void> {
		if (!organizationId) {
			this.organizationId = null;
			this.listPm = [];
			this.cardsVm = [];
			this.status = 'ready';
			return;
		}
		this.organizationId = organizationId;
		this.status = 'loading';
		this.error = null;

		const startIso = dayjs().subtract(KANBAN_LOOKBACK_DAYS, 'day').startOf('day').toISOString();
		const endIso = dayjs().add(KANBAN_LOOKAHEAD_DAYS, 'day').endOf('day').toISOString();

		const resultPm = await this.postsRepository.listPosts({
			organizationId,
			startIso,
			endIso
		});

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
		const org = this.organizationId;
		this.organizationId = null;
		await this.load(org);
	}

	private channelById(): Map<string, CreateSocialPostChannelViewModel> {
		return new Map(this.channels.map((c) => [c.id, c]));
	}

	private rebuildCardsVm() {
		this.cardsVm = toCardsVm(this.listPm, this.channelById());
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
