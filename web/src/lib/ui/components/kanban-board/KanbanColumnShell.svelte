<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		title: string;
		countLabel?: string;
		countTitle?: string;
		statusDotClass?: string;
		class?: string;
		bodyClass?: string;
		/** When false, the body does not scroll — use when a child owns overflow (e.g. DnD drop zone). */
		bodyScrollable?: boolean;
		children: Snippet;
		footer?: Snippet;
	};

	let {
		title,
		countLabel,
		countTitle,
		statusDotClass,
		class: className = '',
		bodyClass = '',
		bodyScrollable = true,
		children,
		footer
	}: Props = $props();
</script>

<section
	class={cn(
		'flex max-h-[min(70vh,720px)] min-h-[280px] min-w-[220px] flex-1 flex-col rounded-lg border border-base-300 bg-base-200/60 p-3',
		className
	)}
>
	<header class="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-base-300 pb-2">
		<div class="flex min-w-0 items-center gap-2">
			{#if statusDotClass}
				<span class={cn('size-2 shrink-0 rounded-full', statusDotClass)} aria-hidden="true"></span>
			{/if}
			<h3 class="truncate text-sm font-semibold text-base-content">{title}</h3>
		</div>
		{#if countLabel}
			<span class="badge badge-ghost badge-sm tabular-nums" title={countTitle ?? 'Item count'}>
				{countLabel}
			</span>
		{/if}
	</header>

	<div
		class={cn(
			'flex min-h-0 flex-1 flex-col gap-2 rounded-md',
			bodyScrollable ? 'overflow-y-auto' : 'overflow-hidden',
			bodyClass
		)}
	>
		{@render children()}
	</div>

	{#if footer}
		<div class="shrink-0">
			{@render footer()}
		</div>
	{/if}
</section>
