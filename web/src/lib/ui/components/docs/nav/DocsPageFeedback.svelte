<script lang="ts">
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let feedback: 'up' | 'down' | null = $state(null);
</script>

<div class="text-base-content/70 flex items-center gap-2 text-sm">
	{#if feedback}
		<span>Thanks for the feedback!</span>
	{:else}
		<span>Was this page helpful?</span>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => (feedback = 'up')}
			aria-label="Yes, this page was helpful"
		>
			<AbstractIcon name="ThumbsUp" class="size-4" width="16" height="16" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => (feedback = 'down')}
			aria-label="No, this page was not helpful"
		>
			<AbstractIcon name="CircleAlert" class="size-4" width="16" height="16" />
		</Button>
	{/if}
</div>
