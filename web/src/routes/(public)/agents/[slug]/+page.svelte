<script lang="ts">
	import type { PageData } from './$types';

	import {
		OPENCLAW_CORE_MESSAGING_CHANNELS,
		OPENCLAW_EXTENSION_MESSAGING_CHANNELS
	} from '$data/openclaw-messaging-channels';

	import { publicAgentByPagePresenter } from '$lib/area-public';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import {
		ACCENT_SPLIT_CTA_BANNER_TITLE,
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		accentSplitCtaBannerDescription
	} from '$lib/config/constants/config';

	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicAgentFeatureSection from '$lib/ui/templates/landing-page/PublicAgentFeatureSection.svelte';
	import PublicAgentHero from '$lib/ui/templates/landing-page/PublicAgentHero.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import WithWithout from '$lib/ui/templates/WithWithout.svelte';
	import CliCommandReference from '$lib/ui/templates/CliCommandReference.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicAgentByPagePresenter;

	let agentVm = $derived(data.agentVm);
	let schemaData = $derived(data.schemaData);

	const secondaryCtaText = pagePresenter.secondaryCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	let accentBannerDescription = $derived(
		accentSplitCtaBannerDescription(agentVm?.agentLabel ?? 'your agent')
	);
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

	{#if agentVm.comparisonSection}
		<WithWithout
			heroTheme={landingHeroTheme}
			landingSubtitle={agentVm.comparisonSection.subtitle}
			landingTitle={agentVm.comparisonSection.title}
			landingDescription={agentVm.comparisonSection.description}
			withoutTitle={agentVm.comparisonSection.withoutTitle}
			withTitle={agentVm.comparisonSection.withTitle}
			points={agentVm.comparisonSection.points}
		/>
	{/if}

	{#if agentVm.commandReferenceSection}
		<CliCommandReference
			heroTheme={landingHeroTheme}
			landingSubtitle={agentVm.commandReferenceSection.subtitle}
			landingTitle={agentVm.commandReferenceSection.title}
			landingDescription={agentVm.commandReferenceSection.description}
			commands={agentVm.commandReferenceSection.commands ?? []}
		/>
	{/if}

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

		<AccentSplitCtaBanner
			title={ACCENT_SPLIT_CTA_BANNER_TITLE}
			description={accentBannerDescription}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
{/if}
