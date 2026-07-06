<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		width: number;
		height: number;
		x: string | number;
		y: string | number;
		squares?: Array<[col: number, row: number]>;
		class?: string;
	};

	let { width, height, x, y, squares, class: className = '' }: Props = $props();

	const id = $props.id();
</script>

<svg aria-hidden="true" class={cn(className)}>
	<defs>
		<pattern {id} {width} {height} patternUnits="userSpaceOnUse" {x} {y}>
			<path d={`M.5 ${height}V.5H${width}`} fill="none" />
		</pattern>
	</defs>
	<rect width="100%" height="100%" stroke-width={0} fill={`url(#${id})`} />
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
