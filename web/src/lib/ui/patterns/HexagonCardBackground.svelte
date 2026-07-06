<script lang="ts">
	import HexagonPattern from '$lib/ui/patterns/HexagonPattern.svelte';

	type Props = {
		hexagons?: Array<[col: number, row: number]>;
		radius?: number;
	};

	let {
		hexagons = [
			[7, 1],
			[8, 3],
			[9, 5],
			[10, 2],
			[11, 4]
		],
		radius = 16
	}: Props = $props();
</script>

<div
	class="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]"
	aria-hidden="true"
>
	<div
		class="absolute inset-0 bg-gradient-to-r from-base-200/30 to-base-300/20 opacity-100 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]"
	>
		<HexagonPattern
			{radius}
			gap={0}
			x={-1}
			y={-1}
			{hexagons}
			class="absolute inset-0 h-full w-full mix-blend-overlay"
		/>
	</div>
</div>
