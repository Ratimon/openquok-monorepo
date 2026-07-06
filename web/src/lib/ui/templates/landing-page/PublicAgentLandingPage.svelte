<script lang="ts">
	import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
	import type { PublicListingsPreviewVm } from '$lib/listings/server/loadAgentListingsPreview.server';

	import {
		HERMES_CORE_MESSAGING_CHANNELS,
		HERMES_EXTENSION_MESSAGING_CHANNELS
	} from '$data/hermes-messaging-channels';
	import {
		OPENCLAW_CORE_MESSAGING_CHANNELS,
		OPENCLAW_EXTENSION_MESSAGING_CHANNELS
	} from '$data/openclaw-messaging-channels';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		accentSplitDocsCtaBannerDescription,
		accentSplitDocsCtaBannerTitle
	} from '$lib/config/constants/config';

	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';
	import PublicLandingWorkflowSection from '$lib/ui/templates/landing-page/PublicLandingWorkflowSection.svelte';
	import PublicListingsPreviewDualGrid from '$lib/ui/components/listings/PublicListingsPreviewDualGrid.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicAgentFeatureSection from '$lib/ui/templates/landing-page/PublicAgentFeatureSection.svelte';
	import PublicAgentHero from '$lib/ui/templates/landing-page/PublicAgentHero.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import WithWithout from '$lib/ui/templates/WithWithout.svelte';
	import CliCommandReference from '$lib/ui/templates/CliCommandReference.svelte';

	type Props = {
		agentVm: PublicAgentHostLandingPageViewModel;
		listingsPreviewVm: PublicListingsPreviewVm;
		secondaryCtaText: string;
		secondaryCtaHref: string;
	};

	let { agentVm, listingsPreviewVm, secondaryCtaText, secondaryCtaHref }: Props = $props();

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	let accentBannerTitle = $derived(accentSplitDocsCtaBannerTitle(agentVm.agentLabel));
	let accentBannerDescription = $derived(accentSplitDocsCtaBannerDescription(agentVm.agentLabel));

	const coreMessagingChannels = $derived(
		agentVm.slug === 'hermes' ? HERMES_CORE_MESSAGING_CHANNELS : OPENCLAW_CORE_MESSAGING_CHANNELS
	);
	const extensionMessagingChannels = $derived(
		agentVm.slug === 'hermes'
			? HERMES_EXTENSION_MESSAGING_CHANNELS
			: OPENCLAW_EXTENSION_MESSAGING_CHANNELS
	);

	const telegramAgentBranding = $derived({
		agentIcon: agentVm.icon,
		agentLabel: agentVm.telegramBotLabel ?? agentVm.agentLabel
	});
</script>

<PublicAgentHero
	{agentVm}
	heroTheme={landingHeroTheme}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
	docsCtaText="View Docs"
	docsCtaHref={agentVm.docsPath}
/>

{#if agentVm.workflowSection}
	<PublicLandingWorkflowSection
		section={agentVm.workflowSection}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
		{telegramAgentBranding}
	/>
{/if}

<WhoIsFor
	heroTheme={landingHeroTheme}
	landingSubtitle={agentVm.audienceSubtitle}
	landingTitle={agentVm.audienceTitle}
	cards={agentVm.audienceCards}
/>

{#if agentVm.setupSteps.length > 0}
	<FeaturesOrdered
		steps={agentVm.setupSteps}
		heroTheme={landingHeroTheme}
		sectionSubtitle={agentVm.setupStepsSubtitle}
		sectionTitle={agentVm.setupStepsTitle}
		{telegramAgentBranding}
	/>
{/if}


{#each agentVm.featureSections as section, index (index)}
	<PublicAgentFeatureSection
		{section}
		{index}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
		{telegramAgentBranding}
	/>
{/each}

<PublicListingsPreviewDualGrid
	heroTheme={landingHeroTheme}
	previewVm={listingsPreviewVm}
	/>

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
		items={coreMessagingChannels}
		extensionItems={extensionMessagingChannels}
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
		title={accentBannerTitle}
		description={accentBannerDescription}
		ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
		ctaHref={agentVm.docsPath}
	/>

	<CenteredDarkCtaBanner
		title={CENTERED_DARK_CTA_BANNER_TITLE}
		description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
		ctaText={PUBLIC_BANNER_CTA_TEXT}
		ctaHref={signUpPath}
		sectionClass="pb-16 sm:pb-20"
	/>
</div>
