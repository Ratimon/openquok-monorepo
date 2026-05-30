<script lang="ts">
	import { onMount, tick } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';

	import AnimatedBeamGradient from '$lib/ui/animated-beam/AnimatedBeamGradient.svelte';

	type Props = {
		containerRef: HTMLElement | undefined;
		fromRef: HTMLElement | undefined;
		toRef: HTMLElement | undefined;
		class?: string;
		curvature?: number;
		reverse?: boolean;
		duration?: number;
		delay?: number;
		pathColor?: string;
		pathWidth?: number;
		pathOpacity?: number;
		gradientStartColor?: string;
		gradientStopColor?: string;
		startXOffset?: number;
		startYOffset?: number;
		endXOffset?: number;
		endYOffset?: number;
	};

	let {
		containerRef,
		fromRef,
		toRef,
		class: className = '',
		curvature = 0,
		reverse = false,
		duration = Math.random() * 3 + 4,
		delay = 0,
		pathColor = 'color-mix(in oklab, var(--color-base-content) 25%, transparent)',
		pathWidth = 2,
		pathOpacity = 0.2,
		gradientStartColor = '#34d399',
		gradientStopColor = '#a78bfa',
		startXOffset = 0,
		startYOffset = 0,
		endXOffset = 0,
		endYOffset = 0
	}: Props = $props();

	const id = crypto.randomUUID().slice(0, 8);

	let pathD = $state('');
	let svgDimensions = $state({ width: 0, height: 0 });

	const gradientCoordinates = $derived(
		reverse
			? {
					x1: ['90%', '-10%'],
					x2: ['100%', '0%'],
					y1: ['0%', '0%'],
					y2: ['0%', '0%']
				}
			: {
					x1: ['10%', '110%'],
					x2: ['0%', '100%'],
					y1: ['0%', '0%'],
					y2: ['0%', '0%']
				}
	);

	function updatePath() {
		const containerRect = containerRef?.getBoundingClientRect();
		const rectA = fromRef?.getBoundingClientRect();
		const rectB = toRef?.getBoundingClientRect();

		if (!containerRect || !rectA || !rectB) return;

		svgDimensions = {
			width: containerRect.width,
			height: containerRect.height
		};

		const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
		const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
		const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
		const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

		const controlY = startY - curvature;
		pathD = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
	}

	onMount(() => {
		let resizeObserver: ResizeObserver | undefined;

		void tick().then(() => {
			updatePath();

			resizeObserver = new ResizeObserver(() => {
				updatePath();
			});

			if (containerRef) resizeObserver.observe(containerRef);
			if (fromRef) resizeObserver.observe(fromRef);
			if (toRef) resizeObserver.observe(toRef);
		});

		return () => {
			resizeObserver?.disconnect();
		};
	});

	$effect(() => {
		containerRef;
		fromRef;
		toRef;
		curvature;
		startXOffset;
		startYOffset;
		endXOffset;
		endYOffset;
		updatePath();
	});
</script>

<svg
	fill="none"
	width={svgDimensions.width}
	height={svgDimensions.height}
	xmlns="http://www.w3.org/2000/svg"
	class={cn('pointer-events-none absolute top-0 left-0 transform-gpu stroke-2', className)}
	viewBox="0 0 {svgDimensions.width} {svgDimensions.height}"
>
	<path
		d={pathD}
		stroke={pathColor}
		stroke-width={pathWidth}
		stroke-opacity={pathOpacity}
		stroke-linecap="round"
	/>
	<path
		d={pathD}
		stroke-width={pathWidth}
		stroke="url(#{id})"
		stroke-opacity="1"
		stroke-linecap="round"
	/>
	<defs>
		<AnimatedBeamGradient
			{id}
			{gradientCoordinates}
			{delay}
			{duration}
			{gradientStartColor}
			{gradientStopColor}
		/>
	</defs>
</svg>
