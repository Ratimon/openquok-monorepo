<script lang="ts">
	import type { PublicOpportunitiesPreviewVm } from '$lib/opportunities/server/loadAgentOpportunitiesPreview.server';

	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import PublicOpportunitiesPreviewGridBlock from '$lib/ui/templates/opportunities-preview/PublicOpportunitiesPreviewGridBlock.svelte';

	type LandingHeroTheme = {
		subtitleClass?: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		previewVm: PublicOpportunitiesPreviewVm;
		sectionClass?: string;
		/** When true, See All scrolls to the Playbooks navbar and opens the matching tab. */
		seeAllScrollsToNavbar?: boolean;
	};

	let {
		heroTheme,
		previewVm,
		sectionClass = 'py-16 sm:py-20',
		seeAllScrollsToNavbar = false
	}: Props = $props();
</script>

<section
	class="relative isolate overflow-hidden bg-base-100 {sectionClass}"
	aria-labelledby={previewVm.headingId}
>
	<div class="container mx-auto px-4">
		<FeaturesSectionHeader
			{heroTheme}
			headingId={previewVm.headingId}
			title={previewVm.title}
			description={previewVm.description}
			subtitle={previewVm.subtitle}
		/>

		<div class="mt-12 space-y-12 sm:mt-14 sm:space-y-14">
			<PublicOpportunitiesPreviewGridBlock
				{heroTheme}
				block={previewVm.backlinksBlock}
				blockKind="backlinks"
				headingId={previewVm.headingId}
				{seeAllScrollsToNavbar}
				highlightClass="text-violet-300"
				highlightTargetColor="#f5f3ff"
			/>

			<PublicOpportunitiesPreviewGridBlock
				{heroTheme}
				block={previewVm.playbooksBlock}
				blockKind="playbooks"
				headingId={previewVm.headingId}
				{seeAllScrollsToNavbar}
				highlightClass="text-emerald-300"
				highlightTargetColor="#ecfdf5"
			/>

			<PublicOpportunitiesPreviewGridBlock
				{heroTheme}
				block={previewVm.buildingBlocksBlock}
				blockKind="building-blocks"
				headingId={previewVm.headingId}
				{seeAllScrollsToNavbar}
				highlightClass="text-amber-200"
				highlightTargetColor="#fffbeb"
			/>
		</div>
	</div>
</section>
