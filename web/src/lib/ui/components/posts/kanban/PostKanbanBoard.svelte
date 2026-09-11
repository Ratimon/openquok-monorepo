<script lang="ts">
	import type {
		CalendarPostRowViewModel,
		ChannelViewModel,
		PostTagFilterVm,
		PostTagViewModel,
		SocialPlatformFilterVm
	} from '$lib/posts';
	import type {
		PostKanbanColumnCountsViewModel,
		PostKanbanColumnId,
		PostKanbanColumnOptionViewModel,
		PostKanbanColumnsViewModel,
		PostKanbanMoveCardResultViewModel,
		PostKanbanReviewFilter,
		PostKanbanReviewFilterOptionViewModel,
		PostKanbanPastTimeFilter,
		PostKanbanPastTimeFilterOptionViewModel,
		PostKanbanSourceFilter,
		PostKanbanSourceFilterOptionViewModel,
		PostKanbanUpcomingTimeFilter,
		PostKanbanUpcomingTimeFilterOptionViewModel
	} from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { KanbanCardDragPayload } from '$lib/ui/components/posts/kanban/kanbanDnd';

	import { UNLIMITED_POSTS_PER_MONTH } from 'openquok-common';

	import { getContext } from 'svelte';

	import { icons } from '$data/icons';

	import { Alert, AlertDescription, AlertTitle } from '$lib/ui/alert';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import KanbanBoardFilters from './KanbanBoardFilters.svelte';
	import KanbanColumnTimeFilterRow from './KanbanColumnTimeFilterRow.svelte';
	import KanbanBoardLayout from '$lib/ui/components/kanban-board/KanbanBoardLayout.svelte';
	import KanbanColumn from './KanbanColumn.svelte';
	import { postsLimitKey, type PostsLimitContext } from '$lib/ui/components/posts/postsLimitContext';

	import { toast } from '$lib/ui/sonner';

	function moveTargetColumnLabel(columnId: PostKanbanColumnId): string {
		if (columnId === 'draft') return 'Draft';
		if (columnId === 'scheduled') return 'Scheduled';
		return 'Published';
	}

	type Props = {
		channels: ChannelViewModel[];
		allGroups: boolean;
		selectedGroupIds: string[];
		allSocialPlatforms: boolean;
		selectedSocialPlatformIdentifiers: string[];
		allTags: boolean;
		selectedTagNames: string[];
		tagsVm: PostTagViewModel[];
		kanbanPosts: readonly Pick<CalendarPostRowViewModel, 'tagNames'>[];
		columnsVm: PostKanbanColumnsViewModel;
		columnCountsVm: PostKanbanColumnCountsViewModel;
		columnOptions: readonly PostKanbanColumnOptionViewModel[];
		sourceFilterOptions: readonly PostKanbanSourceFilterOptionViewModel[];
		reviewFilterOptions: readonly PostKanbanReviewFilterOptionViewModel[];
		upcomingTimeFilterOptions: readonly PostKanbanUpcomingTimeFilterOptionViewModel[];
		pastTimeFilterOptions: readonly PostKanbanPastTimeFilterOptionViewModel[];
		sourceFilter: PostKanbanSourceFilter;
		reviewFilter: PostKanbanReviewFilter;
		upcomingTimeFilter: PostKanbanUpcomingTimeFilter;
		pastTimeFilter: PostKanbanPastTimeFilter;
		status: 'idle' | 'loading' | 'ready' | 'error';
		error: string | null;
		movingPostGroup: string | null;
		/** Billing-month scheduled posts used; omit when unlimited or not enforced. */
		postsUsedThisMonth?: number;
		allowedPostsPerMonth?: number | null;
		billingHref?: string;
		onGroupFilterChange: (next: { allGroups: boolean; selectedGroupIds: string[] }) => void;
		onSocialPlatformFilterChange: (next: SocialPlatformFilterVm) => void;
		onTagFilterChange: (next: PostTagFilterVm) => void;
		onSourceFilterChange: (next: PostKanbanSourceFilter) => void;
		onReviewFilterChange: (next: PostKanbanReviewFilter) => void;
		onUpcomingTimeFilterChange: (next: PostKanbanUpcomingTimeFilter) => void;
		onPastTimeFilterChange: (next: PostKanbanPastTimeFilter) => void;
		onMoveCardToColumn: (
			payload: KanbanCardDragPayload,
			targetColumn: PostKanbanColumnId
		) => Promise<PostKanbanMoveCardResultViewModel>;
		onToggleReviewed: (postId: string, isReviewed: boolean) => void;
		onNoteChange: (postId: string, note: string) => void;
		onOpenPostActions?: (payload: { postGroup: string; postId: string }) => void;
		onEditPost?: (postGroup: string) => void;
		calendarHref: string;
	};

	let {
		channels,
		allGroups,
		selectedGroupIds,
		allSocialPlatforms,
		selectedSocialPlatformIdentifiers,
		allTags,
		selectedTagNames,
		tagsVm,
		kanbanPosts,
		columnsVm,
		columnCountsVm,
		columnOptions,
		sourceFilterOptions,
		reviewFilterOptions,
		upcomingTimeFilterOptions,
		pastTimeFilterOptions,
		sourceFilter,
		reviewFilter,
		upcomingTimeFilter,
		pastTimeFilter,
		status,
		error,
		movingPostGroup,
		postsUsedThisMonth = 0,
		allowedPostsPerMonth = null,
		billingHref,
		onGroupFilterChange,
		onSocialPlatformFilterChange,
		onTagFilterChange,
		onSourceFilterChange,
		onReviewFilterChange,
		onUpcomingTimeFilterChange,
		onPastTimeFilterChange,
		onMoveCardToColumn,
		onToggleReviewed,
		onNoteChange,
		onOpenPostActions,
		onEditPost,
		calendarHref
	}: Props = $props();

	const postsLimit = $derived.by(() => {
		const cap = allowedPostsPerMonth;
		if (cap == null || cap < 1 || cap >= UNLIMITED_POSTS_PER_MONTH) return null;
		return cap;
	});

	const postsUsageLabel = $derived(
		postsLimit != null ? `${postsUsedThisMonth} / ${postsLimit}` : null
	);

	const showPostsPerMonthSection = $derived(postsLimit != null);

	const isPostsLimitFull = $derived(
		postsLimit != null && postsUsedThisMonth >= postsLimit
	);

	const showUpgradeCta = $derived(isPostsLimitFull && Boolean(billingHref));

	const postsLimitCtx = getContext<PostsLimitContext | undefined>(postsLimitKey);

	let dragOverColumnId = $state<PostKanbanColumnId | null>(null);
	let activeDrag = $state<KanbanCardDragPayload | null>(null);
	let publishConfirmOpen = $state(false);
	let pendingPublishDrop = $state<{
		payload: KanbanCardDragPayload;
		targetColumn: PostKanbanColumnId;
	} | null>(null);

	function handleDragOverColumn(columnId: PostKanbanColumnId | null) {
		dragOverColumnId = columnId;
	}

	function handleCardDragStart(payload: KanbanCardDragPayload) {
		activeDrag = payload;
	}

	function handleCardDragEnd() {
		activeDrag = null;
		dragOverColumnId = null;
	}

	function schedulingWouldExceedLimit(
		payload: KanbanCardDragPayload,
		targetColumn: PostKanbanColumnId
	): boolean {
		return (
			isPostsLimitFull &&
			payload.sourceColumn === 'draft' &&
			(targetColumn === 'scheduled' || targetColumn === 'published')
		);
	}

	function isPublishNowDrop(
		payload: KanbanCardDragPayload,
		targetColumn: PostKanbanColumnId
	): boolean {
		return targetColumn === 'published' && !payload.needsManualFinishInApp;
	}

	function clearPendingPublishDrop() {
		pendingPublishDrop = null;
	}

	function cancelPublishConfirm() {
		publishConfirmOpen = false;
		clearPendingPublishDrop();
	}

	async function executeMoveCard(
		payload: KanbanCardDragPayload,
		targetColumn: PostKanbanColumnId
	): Promise<void> {
		const result = await onMoveCardToColumn(payload, targetColumn);
		if (result.ok) {
			toast.success(
				result.successMessage ??
					`Post moved to ${moveTargetColumnLabel(result.targetColumn)}.`
			);
		} else {
			toast.error(result.error);
		}
	}

	async function confirmPublishNow() {
		const pending = pendingPublishDrop;
		if (!pending) return;
		publishConfirmOpen = false;
		clearPendingPublishDrop();
		await executeMoveCard(pending.payload, pending.targetColumn);
	}

	async function handleDropOnColumn(columnId: PostKanbanColumnId, payload: KanbanCardDragPayload) {
		dragOverColumnId = null;
		activeDrag = null;

		if (schedulingWouldExceedLimit(payload, columnId)) {
			postsLimitCtx?.openUpgradeDialog();
			return;
		}

		if (isPublishNowDrop(payload, columnId)) {
			pendingPublishDrop = { payload, targetColumn: columnId };
			publishConfirmOpen = true;
			return;
		}

		await executeMoveCard(payload, columnId);
	}
</script>

<section class="mt-8" aria-labelledby="post-kanban-heading">
	<div class="flex flex-col gap-3">
		<div class="min-w-0">
			<h2 id="post-kanban-heading" class="text-lg font-semibold text-base-content">
				On-going Tasks
			</h2>
			<p class="mt-1 text-sm text-base-content/70">
				Review AI-generated and manual posts. Drag between Drafted and Scheduled;
				double-click post to edit content, the menu for more actions, or double-click the review note.
			</p>
		</div>
		<KanbanBoardFilters
			{channels}
			{allGroups}
			{selectedGroupIds}
			{allSocialPlatforms}
			{selectedSocialPlatformIdentifiers}
			{allTags}
			{selectedTagNames}
			{tagsVm}
			{kanbanPosts}
			{sourceFilterOptions}
			{sourceFilter}
			{reviewFilterOptions}
			{reviewFilter}
			{onGroupFilterChange}
			{onSocialPlatformFilterChange}
			{onTagFilterChange}
			{onSourceFilterChange}
			{onReviewFilterChange}
		/>

		{#if showPostsPerMonthSection && postsUsageLabel && postsLimit != null}
			<HomeAccountNoticeBanner
				iconName={isPostsLimitFull ? icons.Sparkles.name : icons.Info.name}
				tone={isPostsLimitFull ? 'upgrade' : 'neutral'}
				dismissible={false}
			>
				<p class="text-base-content/90">
					{#if isPostsLimitFull}
						You have reached your monthly post limit
						<span class="font-medium tabular-nums">({postsUsageLabel})</span>. Upgrade to schedule
						more posts, or wait until your billing month resets.
					{:else}
						You have used
						<span class="font-medium tabular-nums">{postsUsageLabel}</span>
						scheduled posts this billing month.
					{/if}
				</p>
				{#snippet actions()}
					{#if showUpgradeCta && billingHref}
						<Button href={billingHref} variant="secondary" size="sm" class="gap-1.5">
							<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
							Upgrade plan
						</Button>
					{/if}
				{/snippet}
			</HomeAccountNoticeBanner>
		{/if}
	</div>

	{#if isPostsLimitFull}
		<Alert
			variant="warning"
			class="mt-3 items-start gap-3 border-warning/40 bg-warning/5 text-sm sm:flex-row [&_svg]:text-warning"
		>
			<AbstractIcon
				name={icons.Lock.name}
				class="mt-0.5 h-5 w-5 shrink-0 text-warning"
				width="20"
				height="20"
				focusable="false"
			/>
			<div class="min-w-0 space-y-1">
				<AlertTitle class="text-sm font-semibold leading-snug text-warning">
					Monthly post limit reached
				</AlertTitle>
				<AlertDescription class="leading-relaxed text-base-content/80">
					You cannot drag more draft posts into Scheduled or Published until you upgrade or your
					billing month resets.
					{#if billingHref}
						<button
							type="button"
							class="link link-primary font-medium"
							onclick={() => postsLimitCtx?.openUpgradeDialog()}
						>
							View upgrade options
						</button>
					{/if}
				</AlertDescription>
			</div>
		</Alert>
	{/if}

	{#if status === 'loading'}
		<p class="mt-4 text-sm text-base-content/60">Loading posts…</p>
	{:else if status === 'error' && error}
		<p class="mt-4 text-sm text-error">{error}</p>
	{:else}
		<div class="mt-4 flex flex-col gap-2">
			<KanbanColumnTimeFilterRow
				{upcomingTimeFilterOptions}
				{upcomingTimeFilter}
				{pastTimeFilterOptions}
				{pastTimeFilter}
				{calendarHref}
				{onUpcomingTimeFilterChange}
				{onPastTimeFilterChange}
			/>
			<KanbanBoardLayout>
			{#each columnOptions as col (col.id)}
				<KanbanColumn
					columnId={col.id}
					title={col.title}
					cardsVm={columnsVm[col.id]}
					countVm={columnCountsVm[col.id]}
					{movingPostGroup}
					{activeDrag}
					isDragOver={dragOverColumnId === col.id}
					postsLimitFull={isPostsLimitFull}
					{onOpenPostActions}
					{onEditPost}
					onDragStart={handleCardDragStart}
					onDragEnd={handleCardDragEnd}
					onDragOverColumn={handleDragOverColumn}
					onDropOnColumn={handleDropOnColumn}
					{onToggleReviewed}
					{onNoteChange}
				/>
			{/each}
			</KanbanBoardLayout>
		</div>
	{/if}
</section>

<Dialog.Root bind:open={publishConfirmOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Publish now?</Dialog.Title>
			<Dialog.Description>
				This post will be queued to publish immediately. It stays in <strong>Scheduled</strong> until
				the network confirms it went live.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="gap-2 sm:justify-end">
			<Button type="button" variant="ghost" onclick={cancelPublishConfirm}>Cancel</Button>
			<Button type="button" variant="primary" onclick={() => void confirmPublishNow()}>
				Publish now
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
