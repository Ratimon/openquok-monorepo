import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
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

function groupRowsToCards(
	rows: PostRowProgrammerModel[],
	channelById: Map<string, CreateSocialPostChannelViewModel>
): PostKanbanCardViewModel[] {
	const byGroup = new Map<string, PostRowProgrammerModel[]>();
	for (const row of rows) {
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

export class PostKanbanBoardPresenter {
	sourceFilter = $state<PostKanbanSourceFilter>('all');
	status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	error = $state<string | null>(null);
	movingPostGroup = $state<string | null>(null);

	private rows = $state<PostRowProgrammerModel[]>([]);
	private organizationId = $state<string | null>(null);
	channels = $state<readonly CreateSocialPostChannelViewModel[]>([]);

	constructor(private readonly postsRepository: PostsRepository) {}

	setChannels(next: readonly CreateSocialPostChannelViewModel[]) {
		this.channels = next;
	}

	columnsVm = $derived.by((): PostKanbanColumnsViewModel => {
		const channelById = new Map(this.channels.map((c) => [c.id, c]));
		// Same rule as the AI badge on the card (`isAgentEdited`), not agent-origin / Edited badge.
		const filtered = this.rows.filter((row) => {
			const isAi = row.isAgentEdited ?? false;
			if (this.sourceFilter === 'agent') return isAi;
			if (this.sourceFilter === 'human') return !isAi;
			return true;
		});
		const cards = groupRowsToCards(filtered, channelById);
		const empty: PostKanbanColumnsViewModel = { draft: [], scheduled: [], published: [] };
		for (const card of cards) {
			empty[card.column].push(card);
		}
		for (const col of Object.keys(empty) as PostKanbanColumnId[]) {
			empty[col].sort((a, b) => a.publishLabel.localeCompare(b.publishLabel));
		}
		return empty;
	});

	setSourceFilter(next: PostKanbanSourceFilter) {
		this.sourceFilter = next;
	}

	async load(organizationId: string | null | undefined): Promise<void> {
		if (!organizationId) {
			this.organizationId = null;
			this.rows = [];
			this.status = 'ready';
			return;
		}
		this.organizationId = organizationId;
		this.status = 'loading';
		this.error = null;

		const startIso = dayjs().subtract(KANBAN_LOOKBACK_DAYS, 'day').startOf('day').toISOString();
		const endIso = dayjs().add(KANBAN_LOOKAHEAD_DAYS, 'day').endOf('day').toISOString();

		const result = await this.postsRepository.listPosts({
			organizationId,
			startIso,
			endIso
		});

		if (!result.ok) {
			this.status = 'error';
			this.error = result.error;
			this.rows = [];
			return;
		}

		this.rows = result.posts;
		this.status = 'ready';
	}

	async refresh(): Promise<void> {
		const org = this.organizationId;
		this.organizationId = null;
		await this.load(org);
	}

	private patchLocal(postId: string, patch: Partial<PostRowProgrammerModel>) {
		const rep = this.rows.find((r) => r.id === postId);
		if (!rep) return;
		const group = rep.postGroup;
		this.rows = this.rows.map((r) =>
			r.postGroup === group ? { ...r, ...patch, id: r.id } : r
		);
	}

	async toggleReviewed(postId: string, isReviewed: boolean): Promise<void> {
		const org = this.organizationId;
		if (!org) return;
		const prev = this.rows.find((r) => r.id === postId);
		this.patchLocal(postId, { isReviewed, isAgentEdited: false });
		const result = await this.postsRepository.updatePostReviewTodo({
			organizationId: org,
			postId,
			isReviewed
		});
		if (!result.ok) {
			if (prev) this.patchLocal(postId, { isReviewed: prev.isReviewed, isAgentEdited: prev.isAgentEdited });
			this.error = result.error;
			return;
		}
		this.applyRowsFromUpdate(result.posts);
	}

	private findCardByPostGroup(postGroup: string): PostKanbanCardViewModel | undefined {
		for (const col of Object.values(this.columnsVm)) {
			const match = col.find((c) => c.postGroup === postGroup);
			if (match) return match;
		}
		return undefined;
	}

	/** Draft ↔ scheduled via session `PUT /posts/:postId/status` (same as CLI `posts:status`). */
	async moveCardToColumn(
		payload: KanbanCardDragPayload,
		targetColumn: PostKanbanColumnId
	): Promise<void> {
		const org = this.organizationId;
		if (!org) return;
		if (!canMoveKanbanCard(payload.sourceColumn, targetColumn)) {
			this.error =
				targetColumn === 'published' || payload.sourceColumn === 'published'
					? 'Published posts cannot be moved on the board.'
					: 'This column change is not allowed.';
			return;
		}

		const targetStatus = columnToApiStatus(targetColumn);
		if (!targetStatus) return;

		const card = this.findCardByPostGroup(payload.postGroup);
		const postId = card?.postId ?? payload.postId;
		if (!postId) return;

		const targetState = targetStatus === 'draft' ? 'DRAFT' : 'QUEUE';
		const prevRows = this.rows.filter((r) => r.postGroup === payload.postGroup);

		this.movingPostGroup = payload.postGroup;
		this.error = null;
		this.patchLocal(postId, { state: targetState, isAgentEdited: false });

		const result = await this.postsRepository.flipPostStatus({
			organizationId: org,
			postId,
			status: targetStatus
		});
		this.movingPostGroup = null;
		if (!result.ok) {
			this.rows = [
				...this.rows.filter((r) => r.postGroup !== payload.postGroup),
				...prevRows
			];
			this.error = result.error;
			return;
		}
		this.mergeRowsFromFlip(result.posts);
	}

	private mergeRowsFromFlip(updated: PostRowProgrammerModel[]) {
		if (updated.length === 0) return;
		const group = updated[0]!.postGroup;
		this.rows = [...this.rows.filter((r) => r.postGroup !== group), ...updated];
	}

	async updateNote(postId: string, note: string): Promise<void> {
		const org = this.organizationId;
		if (!org) return;
		const prev = this.rows.find((r) => r.id === postId);
		this.patchLocal(postId, { note: note || null, isAgentEdited: false });
		const result = await this.postsRepository.updatePostReviewTodo({
			organizationId: org,
			postId,
			note: note || null
		});
		if (!result.ok) {
			if (prev) this.patchLocal(postId, { note: prev.note ?? null, isAgentEdited: prev.isAgentEdited });
			this.error = result.error;
			return;
		}
		this.applyRowsFromUpdate(result.posts);
	}

	private applyRowsFromUpdate(updated: PostRowProgrammerModel[]) {
		if (updated.length === 0) return;
		const group = updated[0]!.postGroup;
		const patch = updated[0]!;
		this.rows = this.rows.map((r) =>
			r.postGroup === group
				? {
						...r,
						note: patch.note ?? null,
						isAgentEdited: patch.isAgentEdited ?? false,
						isReviewed: patch.isReviewed ?? false
					}
				: r
		);
	}
}
