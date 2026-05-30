<script lang="ts">
	import type { Action } from 'svelte/action';
	import { Motion } from 'svelte-motion';

	type Props = {
		id: string;
		gradientCoordinates: {
			x1: string[];
			x2: string[];
			y1: string[];
			y2: string[];
		};
		delay: number;
		duration: number;
		gradientStartColor: string;
		gradientStopColor: string;
	};

	let {
		id,
		gradientCoordinates,
		delay,
		duration,
		gradientStartColor,
		gradientStopColor
	}: Props = $props();
</script>

<Motion
	initial={{
		x1: '0%',
		x2: '0%',
		y1: '0%',
		y2: '0%'
	}}
	animate={{
		x1: gradientCoordinates.x1,
		x2: gradientCoordinates.x2,
		y1: gradientCoordinates.y1,
		y2: gradientCoordinates.y2
	}}
	transition={{
		delay,
		duration,
		ease: [0.16, 1, 0.3, 1],
		repeat: Infinity,
		repeatDelay: 0
	}}
	isSVG={true}
	let:motion
>
	{@const svgMotion = motion as Action<Element>}
	<linearGradient use:svgMotion {id} gradientUnits="userSpaceOnUse" class="transform-gpu">
		<stop stop-color={gradientStartColor} stop-opacity="0"></stop>
		<stop stop-color={gradientStartColor}></stop>
		<stop offset="32.5%" stop-color={gradientStopColor}></stop>
		<stop offset="100%" stop-color={gradientStopColor} stop-opacity="0"></stop>
	</linearGradient>
</Motion>
