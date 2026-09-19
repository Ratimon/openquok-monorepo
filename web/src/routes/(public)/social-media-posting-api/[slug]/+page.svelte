<script lang="ts">
	import type { PageData } from './$types';

	import { browser } from '$app/environment';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PayloadWizardHeroPanel from '$lib/ui/templates/api-marketing/PayloadWizardHeroPanel.svelte';
	import PublicApiMarketingFormatExplorer from '$lib/ui/templates/api-marketing/PublicApiMarketingFormatExplorer.svelte';
	import PublicApiMarketingHero from '$lib/ui/templates/api-marketing/PublicApiMarketingHero.svelte';
	import PublicApiMarketingSiblingGrid from '$lib/ui/templates/api-marketing/PublicApiMarketingSiblingGrid.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let platformVm = $derived(data.platformVm);
	let platformsVm = $derived(data.platformsVm);
	let isLoggedIn = $derived(data.isLoggedIn);
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

		{#if browser}
			<PayloadWizardHeroPanel
				mode="guest"
				{isLoggedIn}
				focusedProviderIdentifier={platformVm.providerIdentifier}
				composerMode="custom"
				formatExamples={platformVm.formatExamples}
				sectionTitle="Compose with sample channels"
				sectionDescription="Build your draft, preview live JSON for POST /api/v1/public/posts, and copy the payload. Scheduling and uploads need a workspace — copy JSON stays free."
			/>
		{:else}
			<div
				class="border-base-300 text-base-content/60 flex min-h-[min(72vh,820px)] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border bg-base-100 shadow-sm"
			>
				<span class="loading loading-spinner loading-md"></span>
				<span class="text-sm">Loading composer…</span>
			</div>
		{/if}

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
