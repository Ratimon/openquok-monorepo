<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';

	type Props = {
		card: PostKanbanCardViewModel;
		onToggleReviewed: (postId: string, isReviewed: boolean) => void;
		onNoteChange: (postId: string, note: string) => void;
	};

	let { card, onToggleReviewed, onNoteChange }: Props = $props();

	let noteDraft = $state(card.note ?? '');

	$effect(() => {
		noteDraft = card.note ?? '';
	});

	function commitNote() {
		const trimmed = noteDraft.trim();
		if (trimmed !== (card.note ?? '').trim()) {
			onNoteChange(card.postId, trimmed);
		}
	}
</script>

<article
	class="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm"
	class:ring-2={card.isAgentEdited && !card.isReviewed}
	class:ring-warning={card.isAgentEdited && !card.isReviewed}
>
	<div class="flex items-start justify-between gap-2">
		<p class="line-clamp-3 min-w-0 flex-1 text-sm text-base-content">
			{card.contentPreview || '—'}
		</p>
		{#if card.isAgentEdited}
			<span class="badge badge-warning badge-sm shrink-0">AI</span>
		{/if}
	</div>
	<p class="mt-1 text-xs text-base-content/60">
		{card.publishLabel}
	</p>

	<div class="mt-3 space-y-2 border-t border-base-300 pt-3">
		<label class="flex cursor-pointer items-start gap-2">
			<input
				type="checkbox"
				class="checkbox checkbox-sm checkbox-primary mt-0.5"
				checked={card.isReviewed}
				onchange={(e) => onToggleReviewed(card.postId, e.currentTarget.checked)}
			/>
			<span class="text-xs font-medium text-base-content/80">Mark review complete</span>
		</label>
		<div>
			<label class="text-xs font-medium text-base-content/70" for="note-{card.postId}">Review note</label>
			<textarea
				id="note-{card.postId}"
				class="textarea textarea-bordered textarea-sm mt-1 w-full text-sm"
				rows="2"
				placeholder="Add a checklist item for approval…"
				bind:value={noteDraft}
				onblur={commitNote}
			></textarea>
		</div>
	</div>
</article>
