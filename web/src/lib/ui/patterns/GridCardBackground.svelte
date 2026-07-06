<script lang="ts">
	import GridPattern from '$lib/ui/patterns/GridPattern.svelte';

	type Props = {
		pattern?: Array<[col: number, row: number]>;
		size?: number;
	};

	let {
		pattern = [
			[7, 1],
			[8, 3],
			[9, 5],
			[10, 2],
			[11, 4]
		],
		size = 20
	}: Props = $props();
</script>

<div
	class="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]"
	aria-hidden="true"
>
	<div
		class="absolute inset-0 bg-gradient-to-r from-base-200/30 to-base-300/20 opacity-100 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]"
	>
		<GridPattern
			width={size}
			height={size}
			x="-12"
			y="4"
			squares={pattern}
			class="absolute inset-0 h-full w-full fill-base-content/10 stroke-base-content/10 mix-blend-overlay"
		/>
	</div>
</div>
