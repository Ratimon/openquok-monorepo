<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		width: number;
		height: number;
		x: string | number;
		y: string | number;
		squares?: number[][];
		class?: string;
	};

	let { width, height, x, y, squares, class: className = '' }: Props = $props();

	const patternId = crypto.randomUUID();
</script>

<svg aria-hidden="true" class={cn(className)}>
	<defs>
		<pattern id={patternId} {width} {height} patternUnits="userSpaceOnUse" {x} {y}>
			<path d={`M.5 ${height}V.5H${width}`} fill="none" />
		</pattern>
	</defs>
	<rect width="100%" height="100%" stroke-width={0} fill={`url(#${patternId})`} />
	{#if squares}
		<svg {x} {y} class="overflow-visible">
			{#each squares as [squareX, squareY] (squareX + '-' + squareY)}
				<rect
					stroke-width="0"
					width={width + 1}
					height={height + 1}
					x={squareX * width}
					y={squareY * height}
				/>
			{/each}
		</svg>
	{/if}
</svg>
