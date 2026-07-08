<script lang="ts">
	import type { IconName } from '$data/icons';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	export type ComparisonPointIcon = 'x' | 'check' | 'hourglass';

	export type ComparisonPoint = {
		pain: string;
		feature: string;
		/** Branded platform mark shown before channel names (compare channel rows). */
		platformIcon?: IconName;
		painIcon?: ComparisonPointIcon;
		featureIcon?: ComparisonPointIcon;
	};

	type LandingHeroTheme = {
		subtitleClass?: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;
		withoutTitle: string;
		withTitle: string;
		points?: ComparisonPoint[];
		sectionClass?: string;
		headingId?: string;
		/** When true, the green "with" column renders on the left (e.g. main product first on compare pages). */
		withOnLeft?: boolean;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,
		withoutTitle,
		withTitle,
		points = [],
		sectionClass = 'bg-base-200 py-16 sm:py-20',
		headingId = 'with-without-heading',
		withOnLeft = false
	}: Props = $props();

	const leftTitle = $derived(withOnLeft ? withTitle : withoutTitle);
	const rightTitle = $derived(withOnLeft ? withoutTitle : withTitle);
	const leftPanelClass = $derived(
		withOnLeft ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
	);
	const rightPanelClass = $derived(
		withOnLeft ? 'bg-error/15 text-error' : 'bg-success/15 text-success'
	);

	function iconName(icon: ComparisonPointIcon): string {
		if (icon === 'hourglass') return icons.HourGlass.name;
		if (icon === 'check') return icons.Check.name;
		return icons.X2.name;
	}

	function leftText(point: ComparisonPoint): string {
		return withOnLeft ? point.feature : point.pain;
	}

	function rightText(point: ComparisonPoint): string {
		return withOnLeft ? point.pain : point.feature;
	}

	function leftIcon(point: ComparisonPoint): ComparisonPointIcon {
		return withOnLeft ? (point.featureIcon ?? 'check') : (point.painIcon ?? 'x');
	}

	function rightIcon(point: ComparisonPoint): ComparisonPointIcon {
		return withOnLeft ? (point.painIcon ?? 'x') : (point.featureIcon ?? 'check');
	}
</script>

{#snippet comparisonItem(text: string, icon: ComparisonPointIcon, platformIcon?: IconName)}
	<div class="flex items-start gap-2">
		<AbstractIcon
			name={iconName(icon)}
			width="16"
			height="16"
			class="mt-0.5 shrink-0 opacity-75"
		/>
		<span class="inline-flex items-center gap-1.5">
			{#if platformIcon}
				<span class="inline-flex shrink-0 items-center text-base-content">
					<AbstractIcon
						name={platformIcon}
						width="16"
						height="16"
						aria-hidden="true"
					/>
				</span>
			{/if}
			{text}
		</span>
	</div>
{/snippet}

{#snippet mobilePanel(title: string, panelClass: string, textForPoint: (point: ComparisonPoint) => string, iconForPoint: (point: ComparisonPoint) => ComparisonPointIcon)}
	<div class="w-full rounded-lg p-8 {panelClass}">
		<h3 class="mb-4 text-lg font-bold">
			{title}
		</h3>

		<ul class="space-y-2 text-left">
			{#each points as point (`${point.pain}-${point.feature}`)}
				<li>
					{@render comparisonItem(textForPoint(point), iconForPoint(point), point.platformIcon)}
				</li>
			{/each}
		</ul>
	</div>
{/snippet}

<section class={sectionClass} aria-labelledby={headingId}>
	<div class="container mx-auto space-y-10 px-4 sm:space-y-12">
		<FeaturesSectionHeader
			{heroTheme}
			{headingId}
			title={landingTitle}
			description={landingDescription}
			subtitle={landingSubtitle}
		/>

		<!-- Mobile: stacked panels (row alignment not needed) -->
		<div class="mx-auto flex w-full max-w-5xl flex-col gap-8 md:hidden">
			{@render mobilePanel(leftTitle, leftPanelClass, leftText, leftIcon)}
			{@render mobilePanel(rightTitle, rightPanelClass, rightText, rightIcon)}
		</div>

		<!-- Desktop: paired rows so each line shares the same row height -->
		<div class="mx-auto hidden w-full max-w-5xl md:flex md:flex-col">
			<div class="grid grid-cols-2 gap-x-12">
				<div class="rounded-t-lg p-12 pb-4 {leftPanelClass}">
					<h3 class="text-lg font-bold">
						{leftTitle}
					</h3>
				</div>
				<div class="rounded-t-lg p-12 pb-4 {rightPanelClass}">
					<h3 class="text-lg font-bold">
						{rightTitle}
					</h3>
				</div>
			</div>

			{#each points as point (`${point.pain}-${point.feature}`)}
				<div class="grid grid-cols-2 gap-x-12">
					<div class="px-12 py-1 {leftPanelClass}">
						{@render comparisonItem(leftText(point), leftIcon(point), point.platformIcon)}
					</div>
					<div class="px-12 py-1 {rightPanelClass}">
						{@render comparisonItem(rightText(point), rightIcon(point), point.platformIcon)}
					</div>
				</div>
			{/each}

			<div class="grid grid-cols-2 gap-x-12" aria-hidden="true">
				<div class="rounded-b-lg p-12 pt-4 {leftPanelClass}"></div>
				<div class="rounded-b-lg p-12 pt-4 {rightPanelClass}"></div>
			</div>
		</div>
	</div>
</section>
