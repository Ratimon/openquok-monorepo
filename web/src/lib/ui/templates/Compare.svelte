<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	export type ComparePoint = {
		left: string;
		right: string;
	};

	type LandingHeroTheme = {
		subtitleClass?: string;
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;
		leftTitle: string;
		rightTitle: string;
		points?: ComparePoint[];
		sectionClass?: string;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,
		leftTitle,
		rightTitle,
		points = [],
		sectionClass = 'border-t border-base-content/10 bg-base-100 py-16 sm:py-20'
	}: Props = $props();

	const headingId = 'compare-heading';
</script>

<section class={sectionClass} aria-labelledby={headingId}>
	<div class="container mx-auto space-y-10 px-4 sm:space-y-12">
		<FeaturesSectionHeader
			{heroTheme}
			{headingId}
			title={landingTitle}
			description={landingDescription}
			subtitle={landingSubtitle}
		/>

		<div
			class="mx-auto flex max-w-5xl flex-col items-stretch justify-center gap-8 md:flex-row md:items-start md:gap-12"
		>
			<div class="w-full rounded-2xl border border-base-content/10 bg-base-200/40 p-8 md:p-10">
				<h3 class="mb-4 text-lg font-bold text-base-content">
					{leftTitle}
				</h3>

				<ul class="space-y-3 text-left">
					{#each points as point (point.left)}
						<li class="flex items-start gap-2 text-sm leading-relaxed text-base-content/80 sm:text-base">
							<AbstractIcon
								name={icons.BadgeCheck.name}
								width="16"
								height="16"
								class="mt-0.5 shrink-0 text-success opacity-75"
							/>
							<span>{point.left}</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class="w-full rounded-2xl border border-base-content/10 bg-base-200/40 p-8 md:p-10">
				<h3 class="mb-4 text-lg font-bold text-base-content">
					{rightTitle}
				</h3>

				<ul class="space-y-3 text-left">
					{#each points as point (point.right)}
						<li class="flex items-start gap-2 text-sm leading-relaxed text-base-content/80 sm:text-base">
							<AbstractIcon
								name={icons.BadgeCheck.name}
								width="16"
								height="16"
								class="mt-0.5 shrink-0 text-success opacity-75"
							/>
							<span>{point.right}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>
