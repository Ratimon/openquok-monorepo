<script lang="ts">
	import { icons } from '$data/icon';

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

	const iconsInArray = Object.values(icons).map(({ name: n, box, svg }) => ({
		name: n,
		...(box !== undefined && { box }),
		svg
	}));

	let iconsDisplayed = $derived(iconsInArray.find((icon) => icon.name === name));
</script>

{#if iconsDisplayed}
	<svg
		class={className}
		fill="none"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		{focusable}
		{width}
		{height}
		viewBox="0 0 {iconsDisplayed.box} {iconsDisplayed.box}"
		stroke={stroke}
	>
		{@html iconsDisplayed.svg}
	</svg>
{/if}
