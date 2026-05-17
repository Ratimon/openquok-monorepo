<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import { KANBAN_CARD_DRAG_MIME, serializeKanbanCardDrag } from '$lib/ui/components/kanban-board/kanbanDnd';

	type Props = {
		card: PostKanbanCardViewModel;
		isMoving: boolean;
		onDragStart: (payload: import('./kanbanDnd').KanbanCardDragPayload) => void;
		onDragEnd: () => void;
		onToggleReviewed: (postId: string, isReviewed: boolean) => void;
		onNoteChange: (postId: string, note: string) => void;
		onOpenActions?: (payload: { postGroup: string; postId: string }) => void;
	};

	let { card, isMoving, onDragStart, onDragEnd, onToggleReviewed, onNoteChange, onOpenActions }: Props =
		$props();

	let noteDraft = $state('');
	let isEditingNote = $state(false);
	let noteAreaEl = $state<HTMLTextAreaElement | null>(null);

	const isDraggable = $derived(card.column !== 'published' && !isEditingNote);
	const multiChannels = $derived(card.channelSlots.length > 1);
	const previewSlots = $derived(card.channelSlots.slice(0, 3));
	const showEditedBadge = $derived(
		!card.isAgentEdited &&
			(Boolean(card.note?.trim()) || card.isReviewed || card.isAgentOrigin)
	);

	$effect(() => {
		if (!isEditingNote) {
			noteDraft = card.note ?? '';
		}
	});

	$effect(() => {
		if (isEditingNote && noteAreaEl) {
			noteAreaEl.focus();
		}
	});

	function commitNote() {
		const trimmed = noteDraft.trim();
		if (trimmed !== (card.note ?? '').trim()) {
			onNoteChange(card.postId, trimmed);
		}
		isEditingNote = false;
	}

	function cancelNoteEdit() {
		noteDraft = card.note ?? '';
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
			postId: card.postId,
			postGroup: card.postGroup,
			sourceColumn: card.column
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
		if (card.column === 'published') return;
		isEditingNote = true;
	}

	function openActions(e: MouseEvent) {
		e.stopPropagation();
		onOpenActions?.({ postGroup: card.postGroup, postId: card.postId });
	}
</script>

<article
	class="group relative flex flex-col overflow-hidden rounded-[10px] border border-base-300 bg-base-100 shadow-sm transition-opacity"
	class:opacity-50={isMoving}
	class:ring-2={card.isAgentEdited && !card.isReviewed}
	class:ring-warning={card.isAgentEdited && !card.isReviewed}
	draggable={isDraggable}
	class:cursor-grab={isDraggable}
	class:active:cursor-grabbing={isDraggable}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragover={handleDragOver}
>
	<div
		class="flex h-10 min-h-10 shrink-0 items-center gap-2 bg-primary px-2 text-[11px] text-primary-content"
	>
		<div class="flex min-w-0 flex-1 items-center gap-1.5">
			{#if multiChannels}
				<div class="relative h-7 w-11 shrink-0">
					{#each previewSlots as slot, i (slot.integrationId)}
						<div
							class="absolute top-0 h-7 w-7 overflow-hidden rounded-md ring-2 ring-primary"
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
			{:else if card.channelSlots[0]}
				{@const slot = card.channelSlots[0]}
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
				<div class="h-7 w-7 shrink-0 rounded-md bg-primary-content/20"></div>
			{/if}

			<span class="min-w-0 truncate font-medium">{card.statusLabel}</span>

			{#if card.hiddenChannelCount > 0}
				<span
					class="shrink-0 rounded bg-primary-content/20 px-1 py-px text-[9px] font-semibold"
				>
					+{card.hiddenChannelCount}
				</span>
			{/if}
		</div>

		{#if onOpenActions}
			<button
				type="button"
				class="btn btn-ghost btn-xs btn-square h-7 min-h-7 w-7 shrink-0 text-primary-content hover:bg-primary-content/15"
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
			<p class="line-clamp-2 min-w-0 flex-1 text-xs font-medium text-base-content select-none">
				{#if card.column === 'draft'}<span class="text-base-content/55">Draft: </span>{/if}
				{card.contentPreview || '—'}
			</p>
			{#if card.isAgentEdited}
				<span class="badge badge-warning badge-xs shrink-0">AI</span>
			{:else if showEditedBadge}
				<span class="badge badge-info badge-xs shrink-0">Edited</span>
			{/if}
		</div>

		<p class="truncate text-[10px] text-base-content/60 select-none">
			{card.primaryChannelName || 'No channel'}{card.publishTimeLabel
				? ` @ ${card.publishTimeLabel}`
				: ''}
		</p>

		<div class="border-t border-base-300/80 pt-1.5" data-no-dnd="true">
			<label class="flex cursor-pointer items-center gap-1.5">
				<input
					type="checkbox"
					class="checkbox checkbox-primary checkbox-xs rounded-sm"
					checked={card.isReviewed}
					disabled={card.column === 'published'}
					onchange={(e) => onToggleReviewed(card.postId, e.currentTarget.checked)}
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
					class="mt-1 line-clamp-2 min-h-[1.25rem] cursor-text rounded px-1 py-0.5 text-[10px] leading-snug text-base-content/80 hover:bg-base-200/60"
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
					{#if card.note?.trim()}
						<span class="text-base-content/50">Note:</span>
						{card.note}
					{:else if card.column !== 'published'}
						<span class="text-base-content/40">Double-click to add review note…</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</article>
