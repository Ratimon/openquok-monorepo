<script lang="ts">
	import type { AlternativesHubSectionViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';

	type Props = {
		section: AlternativesHubSectionViewModel;
		titleClass?: string;
	};

	let { section, titleClass = 'text-2xl font-black tracking-tight text-balance sm:text-3xl' }: Props =
		$props();

	const sectionTitle = $derived(`${section.titlePrefix}${section.titleHighlight}`.trim());
</script>

<div class="mx-auto max-w-3xl space-y-4 text-center">
	<p class={landingHeroTheme.subtitleClass}>
		{section.subtitle}
	</p>
	<PublicHeroTitle
		title={sectionTitle}
		headingId={section.sectionId}
		headingLevel="h2"
		class={`${titleClass} text-center`}
	/>
	<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
		{section.description}
	</p>
</div>
