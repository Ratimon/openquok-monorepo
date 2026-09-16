<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';

	import {
		DEFAULT_TAG_CHIP_COLOR,
		calendarChipStatusClasses
	} from '$lib/posts/utils/tagChipTheme';
	import {
		repeatScheduleHighlightLabel,
		repeatScheduleLabel
	} from '$lib/posts/utils/repeatScheduleLabel';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import { KANBAN_CARD_DRAG_MIME, serializeKanbanCardDrag } from '$lib/ui/components/posts/kanban/kanbanDnd';

	type Props = {
		cardVm: PostKanbanCardViewModel;
		isMoving: boolean;
		onDragStart: (payload: import('./kanbanDnd').KanbanCardDragPayload) => void;
		onDragEnd: () => void;
		onToggleReviewed: (postId: string, isReviewed: boolean) => void;
		onNoteChange: (postId: string, note: string) => void;
		onOpenActions?: (payload: { postGroup: string; postId: string }) => void;
		onEditPost?: (postGroup: string) => void;
	};

	let {
		cardVm,
		isMoving,
		onDragStart,
		onDragEnd,
		onToggleReviewed,
		onNoteChange,
		onOpenActions,
		onEditPost
	}: Props = $props();

	let noteDraft = $state('');
	let isEditingNote = $state(false);
	let noteAreaEl = $state<HTMLTextAreaElement | null>(null);

	const isDraggable = $derived.by(() => {
		if (isEditingNote || cardVm.column === 'published') return false;
		if (cardVm.needsManualFinishInApp && cardVm.column === 'scheduled') {
			return cardVm.isReviewed;
		}
		return true;
	});
	const multiChannels = $derived(cardVm.channelSlots.length > 1);
	const previewSlots = $derived(cardVm.channelSlots.slice(0, 3));
	/** Human badge: any post not flagged agent-edited (home/calendar creates and human-reviewed agent drafts). */
	const showHumanBadge = $derived(!cardVm.isAgentEdited);

	const chipTagColor = $derived(
		String(cardVm.chipTagColor ?? '').trim() || DEFAULT_TAG_CHIP_COLOR
	);
	const headerStyle = $derived(`background-color: ${chipTagColor}`);
	const postError = $derived(String(cardVm.postError ?? '').trim());
	const hasError = $derived(postError.length > 0);
	const statusStateForChrome = $derived.by(() => {
		if (hasError && cardVm.column !== 'published') return 'ERROR';
		if (cardVm.column === 'draft') return 'DRAFT';
		if (cardVm.column === 'published') return 'PUBLISHED';
		return 'QUEUE';
	});
	const statusChrome = $derived(calendarChipStatusClasses(statusStateForChrome));
	const chipTitle = $derived(hasError && cardVm.column !== 'published' ? postError : undefined);
	const headerChannelLabel = $derived(cardVm.primaryChannelName || 'No channel');
	const showAgentWarningRing = $derived(
		cardVm.isAgentEdited && !cardVm.isReviewed && !statusChrome.chipRing
	);
	const repeatLabel = $derived(
		repeatScheduleLabel(cardVm.intervalInDays, cardVm.repeatInterval)
	);
	const repeatHighlightLabel = $derived(
		repeatScheduleHighlightLabel(cardVm.intervalInDays, cardVm.repeatInterval)
	);

	$effect(() => {
		if (!isEditingNote) {
			noteDraft = cardVm.note ?? '';
		}
	});

	$effect(() => {
		if (isEditingNote && noteAreaEl) {
			noteAreaEl.focus();
		}
	});

	function commitNote() {
		const trimmed = noteDraft.trim();
		if (trimmed !== (cardVm.note ?? '').trim()) {
			onNoteChange(cardVm.postId, trimmed);
		}
		isEditingNote = false;
	}

	function cancelNoteEdit() {
		noteDraft = cardVm.note ?? '';
		isEditingNote = false;
	}

	function handleNoteKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			commitNote();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancelNoteEdit();
		}
	}

	function dragPayload() {
		return {
			postId: cardVm.postId,
			postGroup: cardVm.postGroup,
			sourceColumn: cardVm.column,
			needsManualFinishInApp: cardVm.needsManualFinishInApp === true,
			isReviewed: cardVm.isReviewed
		};
	}

	function handleDragStart(e: DragEvent) {
		if (!isDraggable || !e.dataTransfer) return;
		const payload = dragPayload();
		e.dataTransfer.effectAllowed = 'move';
		const serialized = serializeKanbanCardDrag(payload);
		e.dataTransfer.setData(KANBAN_CARD_DRAG_MIME, serialized);
		e.dataTransfer.setData('text/plain', serialized);
		onDragStart(payload);
	}

	function handleDragEnd() {
		onDragEnd();
	}

	function handleDragOver(e: DragEvent) {
		if (!isDraggable) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
	}

	function openNoteEditor() {
		if (cardVm.column === 'published') return;
		isEditingNote = true;
	}

	function openActions(e: MouseEvent) {
		e.stopPropagation();
		onOpenActions?.({ postGroup: cardVm.postGroup, postId: cardVm.postId });
	}

	function openPostEditor() {
		if (cardVm.column === 'published' || !onEditPost) return;
		onEditPost(cardVm.postGroup);
	}
</script>

<article
	class="group relative flex flex-col rounded-[10px] border border-base-300 bg-base-100 shadow-sm transition-opacity {statusChrome.chipRing}"
	class:opacity-50={isMoving}
	class:ring-2={showAgentWarningRing}
	class:ring-warning={showAgentWarningRing}
	title={chipTitle}
	draggable={isDraggable}
	class:cursor-grab={isDraggable}
	class:active:cursor-grabbing={isDraggable}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragover={handleDragOver}
>
	<div
		class="flex h-10 min-h-10 shrink-0 items-center gap-2 px-2 text-[11px] text-white text-shadow-tags"
		style={headerStyle}
	>
		<div class="flex min-w-0 flex-1 items-center gap-1.5">
			{#if multiChannels}
				<div class="relative h-7 w-11 shrink-0">
					{#each previewSlots as slot, i (slot.integrationId)}
						<div
							class="absolute top-0 h-7 w-7 overflow-hidden rounded-md ring-2 ring-white/30"
							style={`left:${i * 8}px`}
						>
							<IntegrationChannelPicture
								profilePictureUrl={slot.picture}
								fallbackIcon={socialProviderIcon(slot.identifier)}
								class="h-7 w-7 rounded-md object-cover"
							/>
						</div>
					{/each}
				</div>
			{:else if cardVm.channelSlots[0]}
				{@const slot = cardVm.channelSlots[0]}
				<div class="relative h-7 w-7 shrink-0">
					<IntegrationChannelPicture
						profilePictureUrl={slot.picture}
						fallbackIcon={socialProviderIcon(slot.identifier)}
						class="h-7 w-7 rounded-md object-cover"
					/>
					<span
						class="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
						aria-hidden="true"
					>
						<AbstractIcon
							name={socialProviderIcon(slot.identifier)}
							class="size-3.5"
							width="14"
							height="14"
						/>
					</span>
				</div>
			{:else}
				<div class="h-7 w-7 shrink-0 rounded-md bg-white/20"></div>
			{/if}

			<span class="min-w-0 truncate font-medium">{headerChannelLabel}</span>

			{#if cardVm.hiddenChannelCount > 0}
				<span class="shrink-0 rounded bg-white/20 px-1 py-px text-[9px] font-semibold">
					+{cardVm.hiddenChannelCount}
				</span>
			{/if}
		</div>

		{#if repeatHighlightLabel}
			<span
				class="flex max-w-[5.5rem] shrink-0 items-center gap-0.5 truncate rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold"
				title={repeatLabel ?? repeatHighlightLabel}
				aria-label={repeatLabel ?? repeatHighlightLabel}
			>
				<AbstractIcon
					name={icons.RefreshCw.name}
					class="size-2.5 shrink-0"
					width="10"
					height="10"
				/>
				<span class="truncate">{repeatHighlightLabel}</span>
			</span>
		{/if}

		{#if onOpenActions}
			<button
				type="button"
				class="btn btn-ghost btn-xs btn-square h-7 min-h-7 w-7 shrink-0 text-white hover:bg-white/15"
				aria-label="Post actions"
				data-no-dnd="true"
				onclick={openActions}
			>
				<AbstractIcon name={icons.MenuLine.name} class="size-4" width="16" height="16" />
			</button>
		{/if}
	</div>

	<div class="flex min-w-0 flex-col gap-1.5 p-2">
		<div class="flex items-start justify-between gap-1.5">
			{#if onEditPost && cardVm.column !== 'published'}
				<button
					type="button"
					class="min-w-0 flex-1 cursor-pointer text-left text-xs font-medium text-base-content select-none hover:text-primary"
					aria-label="Edit post content"
					ondblclick={openPostEditor}
					onclick={(e) => {
						if (e.detail === 0) openPostEditor();
					}}
				>
					{#if cardVm.column === 'draft'}<span class="font-semibold text-warning">Draft: </span>{/if}
					{cardVm.contentPreview || '—'}
				</button>
			{:else}
				<p class="min-w-0 flex-1 text-xs font-medium text-base-content select-none">
					{#if cardVm.column === 'draft'}<span class="font-semibold text-warning">Draft: </span>{/if}
					{cardVm.contentPreview || '—'}
				</p>
			{/if}
			<div class="flex shrink-0 items-center gap-1">
				{#if statusChrome.publishedPill}
					<span class="{statusChrome.publishedPill} shrink-0">Published</span>
				{/if}
				{#if cardVm.isAgentEdited}
					<span class="badge badge-secondary badge-xs shrink-0 border-0 p-0.5" title="AI-generated">
						<AbstractIcon name={icons.Bot.name} class="size-3" width="12" height="12" />
					</span>
				{:else if showHumanBadge}
					<span class="badge badge-secondary badge-xs shrink-0 border-0 p-0.5" title="Human">
						<AbstractIcon name={icons.UserRoundPen.name} class="size-3" width="12" height="12" />
					</span>
				{/if}
			</div>
		</div>

		<p class="truncate text-[10px] text-base-content/60 select-none">
			{headerChannelLabel}{cardVm.publishTimeLabel ? ` @ ${cardVm.publishTimeLabel}` : ''}{cardVm.relativePublishLabel
				? ` ${cardVm.relativePublishLabel}`
				: ''}{#if repeatHighlightLabel}<span class="font-semibold text-primary">
					· {repeatHighlightLabel}</span
				>{/if}{#if cardVm.needsManualFinishInApp} · {cardVm.statusLabel}{/if}
		</p>

		<div class="border-t border-base-300/80 pt-1.5" data-no-dnd="true">
			<label class="flex cursor-pointer items-center gap-1.5">
				<input
					type="checkbox"
					class="checkbox checkbox-primary checkbox-xs rounded-sm"
					checked={cardVm.isReviewed}
					disabled={cardVm.column === 'published'}
					onchange={(e) => onToggleReviewed(cardVm.postId, e.currentTarget.checked)}
				/>
				<span class="text-[10px] leading-none text-base-content/70">Reviewed</span>
			</label>

			{#if isEditingNote}
				<textarea
					bind:this={noteAreaEl}
					class="textarea textarea-bordered textarea-xs mt-1.5 w-full min-h-[3rem] text-xs"
					rows="2"
					placeholder="Review todo…"
					bind:value={noteDraft}
					onkeydown={handleNoteKeydown}
					onblur={commitNote}
				></textarea>
			{:else}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="mt-1 min-h-[1.25rem] cursor-text rounded px-1 py-0.5 text-[10px] leading-snug whitespace-pre-wrap break-words text-base-content/80 hover:bg-base-200/60"
					role="button"
					tabindex="0"
					ondblclick={openNoteEditor}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							openNoteEditor();
						}
					}}
				>
					{#if cardVm.note?.trim()}
						<span class="text-base-content/50">Note:</span>
						{cardVm.note}
					{:else if cardVm.suggestedReviewNote?.trim()}
						<span class="text-base-content/50">Next:</span>
						<span class="text-base-content/70 italic">{cardVm.suggestedReviewNote}</span>
					{:else if cardVm.column !== 'published'}
						<span class="text-base-content/40">Double-click to add review note…</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</article>
