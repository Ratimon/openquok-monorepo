<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import KanbanPostCard from './KanbanPostCard.svelte';

	type Props = {
		title: string;
		cards: PostKanbanCardViewModel[];
		onToggleReviewed: (postId: string, isReviewed: boolean) => void;
		onNoteChange: (postId: string, note: string) => void;
	};

	let { title, cards, onToggleReviewed, onNoteChange }: Props = $props();
</script>

<section class="flex min-h-[280px] min-w-[220px] flex-1 flex-col rounded-lg border border-base-300 bg-base-200/60 p-3">
	<header class="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-base-300 pb-2">
		<h3 class="text-sm font-semibold text-base-content">{title}</h3>
		<span class="badge badge-ghost badge-sm">{cards.length}</span>
	</header>
	<div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
		{#if cards.length === 0}
			<p class="py-6 text-center text-xs text-base-content/50">No posts</p>
		{:else}
			{#each cards as card (card.postGroup)}
				<KanbanPostCard {card} {onToggleReviewed} {onNoteChange} />
			{/each}
		{/if}
	</div>
</section>
