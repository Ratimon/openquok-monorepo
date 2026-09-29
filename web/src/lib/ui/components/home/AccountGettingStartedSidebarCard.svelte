<script lang="ts">
	import type { AccountGettingStartedChecklistItem } from '$lib/ui/components/home/accountGettingStarted.types';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		checklistItems: AccountGettingStartedChecklistItem[];
		onOpenChecklist: () => void;
	};

	let { checklistItems, onOpenChecklist }: Props = $props();

	const checklistDoneCount = $derived(checklistItems.filter((item) => item.done).length);
	const checklistTotalCount = $derived(checklistItems.length);
</script>

<article
	class="overflow-hidden rounded-lg border border-base-300/80 bg-base-200/90 p-4 shadow-md ring-1 ring-base-content/5"
	aria-labelledby="getting-started-sidebar-title"
>
	<h2 id="getting-started-sidebar-title" class="text-base font-semibold text-base-content">
		Getting started
	</h2>
	<p class="mt-1 text-sm text-base-content/65">
		Set up your workspace, schedule posts, and connect agents.
	</p>
	{#if checklistTotalCount > 0}
		<p class="mt-2 text-xs font-medium text-base-content/55">
			{checklistDoneCount} of {checklistTotalCount} checklist steps complete
		</p>
	{/if}
	<Button type="button" variant="primary" size="sm" class="mt-4 w-full sm:w-auto" onclick={onOpenChecklist}>
		See checklist
	</Button>
</article>
