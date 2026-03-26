<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		class?: string;
		reverse?: boolean;
		duration?: number;
		delay?: number;
		radius?: number;
		path?: boolean;
		children?: Snippet;
	};

	let {
		class: className = '',
		reverse = false,
		duration = 20,
		delay = 0,
		radius = 50,
		path = true,
		children
	}: Props = $props();
</script>

{#if path}
	<!-- Static dashed orbit; explicit stroke so it stays visible on tinted/opacity parents (Tailwind stroke-* can be too faint). -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		version="1.1"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full text-base-content/45"
		aria-hidden="true"
	>
		<circle
			class="stroke-current"
			cx="50%"
			cy="50%"
			r={radius}
			fill="none"
			stroke-width="1"
			stroke-dasharray="4 4"
			vector-effect="non-scaling-stroke"
		/>
	</svg>
	<div
		style:--radius={radius}
		style:animation={`orbit ${duration}s linear infinite`}
		style:animation-delay={`${delay * 1000}ms`}
		style:animation-direction={reverse ? 'reverse' : 'normal'}
		class={cn(
			'absolute z-10 flex h-full w-full transform-gpu items-center justify-center rounded-full border bg-black/10 dark:bg-white/10',
			className
		)}
	>
		{@render children?.()}
	</div>
{/if}
