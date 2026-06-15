<script lang="ts">
	import type { PageData } from './$types';

	import {
		OPENCLAW_CORE_MESSAGING_CHANNELS,
		OPENCLAW_EXTENSION_MESSAGING_CHANNELS
	} from '$data/openclaw-messaging-channels';

	import { publicAgentByPagePresenter } from '$lib/area-public';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicAgentFeatureSection from '$lib/ui/templates/landing-page/PublicAgentFeatureSection.svelte';
	import PublicAgentHero from '$lib/ui/templates/landing-page/PublicAgentHero.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

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

	{#if agentVm.setupSteps.length > 0}
		<FeaturesOrdered
			steps={agentVm.setupSteps}
			heroTheme={landingHeroTheme}
			sectionSubtitle={agentVm.setupStepsSubtitle}
			sectionTitle={agentVm.setupStepsTitle}
		/>
	{/if}

	<WhoIsFor
		heroTheme={landingHeroTheme}
		landingSubtitle={agentVm.audienceSubtitle}
		landingTitle={agentVm.audienceTitle}
		cards={agentVm.audienceCards}
	/>

	{#each agentVm.featureSections as section, index (index)}
		<PublicAgentFeatureSection
			{section}
			{index}
			ctaText={secondaryCtaText}
			ctaHref={secondaryCtaHref}
		/>
	{/each}

	{#if agentVm.supportedChannelsSection}
		<SimpleCardGrid
			heroTheme={landingHeroTheme}
			headingId="agent-supported-channels-heading"
			title={agentVm.supportedChannelsSection.title}
			description={agentVm.supportedChannelsSection.description}
			subtitle={agentVm.supportedChannelsSection.subtitle}
			extensionLabel={agentVm.supportedChannelsSection.extensionLabel}
			items={OPENCLAW_CORE_MESSAGING_CHANNELS}
			extensionItems={OPENCLAW_EXTENSION_MESSAGING_CHANNELS}
		/>
	{/if}

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
