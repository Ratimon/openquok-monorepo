<script lang="ts">
	import type { CompareDirectoryCoverageViewModel } from '$lib/content/constants/competitors/utils/compareChannelSections';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	type Props = {
		heroTheme: LandingHeroTheme;
		coverage: CompareDirectoryCoverageViewModel;
		sectionClass?: string;
	};

	let { heroTheme, coverage, sectionClass = 'mt-20 scroll-mt-24' }: Props = $props();
</script>

<section id="compare-directory-channels" class={sectionClass} aria-labelledby="compare-directory-channels-heading">
	<FeaturesSectionHeader
		{heroTheme}
		headingId="compare-directory-channels-heading"
		subtitle={coverage.subtitle}
		title={coverage.title}
		description={coverage.description}
	/>

	<div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-2xl bg-success/15 p-6 text-success">
			<h3 class="text-lg font-bold">{coverage.withTitle}</h3>
			<p class="mt-2 text-sm text-success/90">Wired directory launch (extension autofill)</p>
			<ul class="mt-4 space-y-3">
				{#each coverage.launchPlatforms as platform (platform.label)}
					<li class="flex items-center gap-2 text-base text-success">
						<AbstractIcon
							name={icons.Check.name}
							width="16"
							height="16"
							class="shrink-0 opacity-80"
							aria-hidden="true"
						/>
						<AbstractIcon
							name={platform.icon}
							width="20"
							height="20"
							class="shrink-0"
							aria-hidden="true"
						/>
						<span>{platform.label}</span>
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-sm leading-relaxed text-success/85">{coverage.openQuokFootnote}</p>
		</div>

		<div class="rounded-2xl bg-error/15 p-6 text-error">
			<h3 class="text-lg font-bold">{coverage.withoutTitle}</h3>
			<p class="mt-4 text-base leading-relaxed text-error/90">{coverage.competitorSummary}</p>
		</div>
	</div>
</section>
