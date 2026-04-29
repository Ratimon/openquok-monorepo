<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	let __cpbInstance = 0;

	type Props = {
		max?: number;
		min?: number;
		value: number;
		/**
		 * Progress arc + center label override. Omit to use theme **primary** (green on `forest` / your tokens).
		 */
		gaugePrimaryColor?: string;
		/**
		 * Background track override. Omit to use **muted primary** via `stroke-primary/45`.
		 */
		gaugeSecondaryColor?: string;
		size?: number;
		strokeWidth?: number;
		/** Extra classes on the outer wrapper (Tailwind, spacing, shadows). */
		class?: string;
		/** When false, hides the center percentage label. */
		showLabel?: boolean;
		/** Soft glow on the active arc (uses primary color). */
		glow?: boolean;
	};

	let {
		max = 100,
		min = 0,
		value,
		gaugePrimaryColor,
		gaugeSecondaryColor,
		size = 120,
		strokeWidth = 8,
		class: className = '',
		showLabel = true,
		glow = true
	}: Props = $props();

	const useThemePrimary = $derived(gaugePrimaryColor == null || gaugePrimaryColor === '');
	const useThemeTrack = $derived(gaugeSecondaryColor == null || gaugeSecondaryColor === '');

	/** Stable ids for SVG defs (sequential per instance — SSR/hydration safe). */
	const __cpbId = ++__cpbInstance;
	const gradId = `cpb-grad-${__cpbId}`;
	const filterId = `cpb-glow-${__cpbId}`;

	const percentage = $derived.by(() => {
		const range = max - min;
		if (range === 0) return 0;
		return Math.min(Math.max(((value - min) / range) * 100, 0), 100);
	});

	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const offset = $derived(circumference - (percentage / 100) * circumference);
</script>

<div
	class={cn(
		'relative inline-flex items-center justify-center',
		useThemePrimary && 'text-primary',
		className
	)}
	style="width: {size}px; height: {size}px;"
	role="progressbar"
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={Math.round(percentage)}
	aria-label={showLabel ? `${Math.round(percentage)} percent` : undefined}
>
	<svg
		class="shrink-0 -rotate-90 text-inherit"
		width={size}
		height={size}
		aria-hidden="true"
	>
		<defs>
			<linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
				{#if useThemePrimary}
					<stop offset="0%" stop-color="currentColor" stop-opacity="1" />
					<stop offset="100%" stop-color="currentColor" stop-opacity="0.72" />
				{:else}
					<stop offset="0%" stop-color={gaugePrimaryColor} stop-opacity="1" />
					<stop offset="100%" stop-color={gaugePrimaryColor} stop-opacity="0.72" />
				{/if}
			</linearGradient>
			<filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>
		<!-- Background track: Tailwind resolves theme green/primary reliably in SVG -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke-width={strokeWidth}
			class={cn('fill-none', useThemeTrack ? 'stroke-primary/55' : '')}
			stroke={useThemeTrack ? undefined : gaugeSecondaryColor}
		/>
		<!-- Progress arc -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={`url(#${gradId})`}
			stroke-width={strokeWidth}
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			stroke-linecap="round"
			filter={glow ? `url(#${filterId})` : undefined}
			class={cn(
				'transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none motion-reduce:duration-150'
			)}
		/>
	</svg>
	{#if showLabel}
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<span
				class={cn(
					'text-sm font-semibold tabular-nums tracking-tight',
					useThemePrimary && 'text-primary'
				)}
				style={useThemePrimary ? undefined : `color: ${gaugePrimaryColor}`}
			>
				{Math.round(percentage)}%
			</span>
		</div>
	{/if}
</div>
