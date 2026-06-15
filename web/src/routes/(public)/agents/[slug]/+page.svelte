<script lang="ts">
	import type { PageData } from './$types';

	import { publicAgentByPagePresenter } from '$lib/area-public';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicAgentHero from '$lib/ui/components/agents/PublicAgentHero.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicAgentByPagePresenter;

	let agentVm = $derived(data.agentVm);
	let schemaData = $derived(data.schemaData);

	const secondaryCtaText = pagePresenter.secondaryCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;
</script>

<JsonLdHead schemaData={schemaData} />

{#if agentVm}
	<PublicAgentHero
		agent={agentVm}
		heroTheme={landingHeroTheme}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
		docsCtaText="View Docs"
		docsCtaHref={agentVm.docsPath}
	/>

	<WhoIsFor
		heroTheme={landingHeroTheme}
		landingSubtitle={agentVm.audienceSubtitle}
		landingTitle={agentVm.audienceTitle}
		cards={agentVm.audienceCards}
	/>

	{#each agentVm.featureSections as section, index (index)}
		{#if section.mediaOnRight !== false}
			<HeroWithRightMedia
				heroTheme={landingHeroTheme}
				landingSubtitle={section.subtitle}
				landingTitle={section.title}
				landingDescription={section.description}
				imageSrc={section.imageSrc}
				imageAlt={section.imageAlt}
				showCta={false}
				ctaText={secondaryCtaText}
				ctaHref={secondaryCtaHref}
				bgColorClass={index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
			/>
		{:else}
			<HeroWithLeftMedia
				heroTheme={landingHeroTheme}
				landingSubtitle={section.subtitle}
				landingTitle={section.title}
				landingDescription={section.description}
				imageSrc={section.imageSrc}
				imageAlt={section.imageAlt}
				showCta={false}
				ctaText={secondaryCtaText}
				ctaHref={secondaryCtaHref}
				bgColorClass={index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
			/>
		{/if}
	{/each}

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={agentVm.faqSubtitle}
			faqTitle={agentVm.faqTitle}
			faqDescription={agentVm.faqDescription}
			faqItems={agentVm.faqItems}
			sectionClass="py-16 sm:py-20"
		/>
	</div>
{/if}
