<script module lang="ts">
	let abstractIconInstance = 0;
</script>

<script lang="ts">
	import type { IconEntry, IconName } from '$data/icons';
	import { icons } from '$data/icons';

	function scopeSvgFragmentIds(svg: string, prefix: string): string {
		const scoped = svg.replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`);
		return scoped.replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);
	}

	type Props = {
		name: string;
		class?: string;
		width: string;
		height: string;
		focusable?: string;
		stroke?: string;
		'aria-hidden'?: boolean | 'true' | 'false';
	};

	let {
		class: className = '',
		name,
		width = '24',
		height = '24',
		focusable = 'false',
		stroke = 'currentColor',
		'aria-hidden': ariaHidden
	}: Props = $props();

	const instanceScope = `_${++abstractIconInstance}`;

	let meta = $derived(icons[name as IconName] as IconEntry | undefined);
	let viewBox = $derived(
		meta ? `0 0 ${meta.box} ${meta.boxHeight ?? meta.box}` : '0 0 24 24'
	);
	let isFill = $derived(meta?.fill === true);
	let scopedSvg = $derived(
		meta ? scopeSvgFragmentIds(meta.svg, `${meta.name}${instanceScope}_`) : ''
	);
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
		aria-hidden={ariaHidden}
		viewBox={viewBox}
	>
		{@html scopedSvg}
	</svg>
{/if}
