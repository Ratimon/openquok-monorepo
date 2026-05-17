import type { PostsRepository, PostRowProgrammerModel } from '$lib/posts/Post.repository.svelte';
import type { PostKanbanColumnId, PostKanbanSourceFilter } from '$lib/ui/components/kanban-board/kanbanTypes';
import dayjs from 'dayjs';

export type PostKanbanCardViewModel = {
	postId: string;
	postGroup: string;
	column: PostKanbanColumnId;
	contentPreview: string;
	publishLabel: string;
	note: string | null;
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

function groupRowsToCards(rows: PostRowProgrammerModel[]): PostKanbanCardViewModel[] {
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
		cards.push({
			postId: rep.id,
			postGroup,
			column,
			contentPreview: stripHtmlPreview(content),
			publishLabel: dayjs(rep.publishDate).format('MMM D, YYYY h:mm A'),
			note: rep.note ?? null,
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

	private rows = $state<PostRowProgrammerModel[]>([]);
	private organizationId = $state<string | null>(null);

	constructor(private readonly postsRepository: PostsRepository) {}

	columnsVm = $derived.by((): PostKanbanColumnsViewModel => {
		const filtered = this.rows.filter((row) => {
			const agent = row.isAgentEdited ?? false;
			if (this.sourceFilter === 'agent') return agent;
			if (this.sourceFilter === 'human') return !agent;
			return true;
		});
		const cards = groupRowsToCards(filtered);
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
