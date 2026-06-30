<script lang="ts">
	import type { Snippet } from 'svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		title: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
		isActive?: boolean;
		contentClass?: string;
		children: Snippet;
	};

	let {
		title,
		tabClass = '',
		whenSelected = '',
		whenUnselected = '',
		isActive = false,
		contentClass = '',
		children
	}: Props = $props();

	let expanded = $state(false);
</script>

<div class="flex w-full flex-col items-center">
	<button
		type="button"
		class="{tabClass} inline-flex cursor-pointer items-center gap-1 border-none bg-transparent {isActive
			? whenSelected
			: whenUnselected}"
		aria-expanded={expanded}
		onclick={() => (expanded = !expanded)}
	>
		{title}
		<span aria-hidden="true">
			<AbstractIcon
				name={icons.ChevronDown.name}
				width="16"
				height="16"
				class="size-4 shrink-0 opacity-70 transition-transform {expanded ? 'rotate-180' : ''}"
				focusable="false"
			/>
		</span>
	</button>
	{#if expanded}
		<div
			class="mt-3 w-full max-w-md rounded-xl border border-base-content/10 bg-base-200 p-4 shadow-xl {contentClass}"
		>
			{@render children()}
		</div>
	{/if}
</div>
