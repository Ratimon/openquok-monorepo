<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		messages: string[];
	};

	let { messages }: Props = $props();
</script>

{#if messages.length > 0}
	<div
		role="alert"
		class="flex items-start gap-3 rounded-lg border border-error/40 bg-error/5 px-4 py-3 text-sm text-base-content"
	>
		<AbstractIcon
			name={icons.CircleAlert.name}
			class="mt-0.5 size-5 shrink-0 text-error"
			width="20"
			height="20"
			focusable="false"
		/>
		<div class="min-w-0 leading-relaxed">
			<p class="font-medium text-base-content">Fix the following before saving</p>
			<ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/90">
				{#each messages as message, index (index)}
					<li>{message}</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
