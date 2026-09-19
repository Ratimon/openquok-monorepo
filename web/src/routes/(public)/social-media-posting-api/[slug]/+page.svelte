<script lang="ts">
	import type { PageData } from './$types';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicApiMarketingFormatExplorer from '$lib/ui/templates/api-marketing/PublicApiMarketingFormatExplorer.svelte';
	import PublicApiMarketingHero from '$lib/ui/templates/api-marketing/PublicApiMarketingHero.svelte';
	import PublicApiMarketingSiblingGrid from '$lib/ui/templates/api-marketing/PublicApiMarketingSiblingGrid.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let platformVm = $derived(data.platformVm);
	let platformsVm = $derived(data.platformsVm);
	let heroEyebrow = $derived(`${platformVm.platformLabel} posting API`);
</script>

<JsonLdHead schemaData={schemaData} />

{#key platformVm.slug}
	<SectionOuterContainer>
		<PublicApiMarketingHero
			eyebrow={heroEyebrow}
			title={platformVm.heroTitle}
			description={platformVm.heroDescription}
		/>

		<PublicApiMarketingFormatExplorer formatExamples={platformVm.formatExamples} />

		<PublicApiMarketingSiblingGrid
			capability="posting"
			platformsVm={platformsVm}
			activeSlug={platformVm.slug}
			activePlatformLabel={platformVm.platformLabel}
			publicApiProvidersDocsPath={platformVm.publicApiProvidersDocsPath}
		/>

		<div class="container mx-auto px-4">
			<PublicFaq
				heroTheme={landingHeroTheme}
				faqSubtitle={platformVm.faqSubtitle}
				faqTitle={platformVm.faqTitle}
				faqDescription={platformVm.faqDescription}
				faqItems={[...platformVm.faqItems]}
				sectionClass="py-12 sm:py-16"
			/>
		</div>
	</SectionOuterContainer>
{/key}
