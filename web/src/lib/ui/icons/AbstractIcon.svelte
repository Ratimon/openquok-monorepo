<script lang="ts">
	import type { IconName } from '$data/icons';
	import { icons } from '$data/icons';

	type Props = {
		name: string;
		class?: string;
		width: string;
		height: string;
		focusable?: string;
		stroke?: string;
	};

	let {
		class: className = '',
		name,
		width = '24',
		height = '24',
		focusable = 'false',
		stroke = 'currentColor'
	}: Props = $props();

	let meta = $derived(icons[name as IconName]);
	let viewBox = $derived(
		meta ? `0 0 ${meta.box} ${meta.boxHeight ?? meta.box}` : '0 0 24 24'
	);
	let isFill = $derived(meta?.fill === true);
</script>

{#if meta}
	<svg
		class={className}
		xmlns="http://www.w3.org/2000/svg"
		fill={isFill ? 'currentColor' : 'none'}
		stroke={isFill ? 'none' : stroke}
		stroke-width={isFill ? undefined : '2'}
		stroke-linecap={isFill ? undefined : 'round'}
		stroke-linejoin={isFill ? undefined : 'round'}
		preserveAspectRatio={isFill ? 'xMidYMid meet' : undefined}
		{focusable}
		{width}
		{height}
		viewBox={viewBox}
	>
		{@html meta.svg}
	</svg>
{/if}
