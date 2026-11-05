<script lang="ts">
	import type { AlternativesHubSectionViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';

	import {
		landingHeroTheme,
		PUBLIC_SOCIAL_AUTOPILOT_HERO_TITLE_LINE_CLASS
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		section: AlternativesHubSectionViewModel;
		titleClass?: string;
	};

	let { section, titleClass = 'text-2xl font-black tracking-tight text-balance sm:text-3xl' }: Props =
		$props();

	const titleHighlightGradientClass = $derived(
		`${landingHeroTheme.titleSegmentClassWithOffset(
			0,
			[{ text: section.titleHighlight, highlight: false }],
			1
		)} inline-block shrink-0 pl-[0.2em] sm:pl-[0.28em]`
	);
</script>

<div class="mx-auto max-w-3xl space-y-4 text-center">
	<p class={landingHeroTheme.subtitleClass}>
		{section.subtitle}
	</p>
	<h2 id={section.sectionId} class={`${titleClass} flex flex-col items-center`}>
		<span class={PUBLIC_SOCIAL_AUTOPILOT_HERO_TITLE_LINE_CLASS}>
			<span class="inline-block shrink-0 text-base-content">{section.titlePrefix}</span>
			<span class={titleHighlightGradientClass}>{section.titleHighlight}</span>
		</span>
	</h2>
	<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
		{section.description}
	</p>
</div>
