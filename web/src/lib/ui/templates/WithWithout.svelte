<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	export type ComparisonPoint = {
		pain: string;
		feature: string;
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
		withoutTitle: string;
		withTitle: string;
		points?: ComparisonPoint[];
		sectionClass?: string;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,
		withoutTitle,
		withTitle,
		points = [],
		sectionClass = 'bg-base-200 py-16 sm:py-20'
	}: Props = $props();

	const headingId = 'with-without-heading';
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

		<div class="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 md:flex-row md:items-start md:gap-12">
			<div class="w-full rounded-lg bg-error/15 p-8 text-error md:p-12">
				<h3 class="mb-4 text-lg font-bold">
					{withoutTitle}
				</h3>

				<ul class="space-y-2 text-left">
					{#each points as point (point.pain)}
						<li class="flex items-start gap-2">
							<AbstractIcon
								name={icons.X2.name}
								width="16"
								height="16"
								class="mt-0.5 shrink-0 opacity-75"
							/>
							<span>{point.pain}</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class="w-full rounded-lg bg-success/15 p-8 text-success md:p-12">
				<h3 class="mb-4 text-lg font-bold">
					{withTitle}
				</h3>

				<ul class="space-y-2 text-left">
					{#each points as point (point.feature)}
						<li class="flex items-start gap-2">
							<AbstractIcon
								name={icons.BadgeCheck.name}
								width="16"
								height="16"
								class="mt-0.5 shrink-0 opacity-75"
							/>
							<span>{point.feature}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>
