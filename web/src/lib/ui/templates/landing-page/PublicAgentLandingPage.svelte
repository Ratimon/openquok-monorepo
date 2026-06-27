<script lang="ts">
	import type { PublicAgentHostLandingPage } from '$lib/content/constants/publicAgentConfig';

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
		ACCENT_SPLIT_CTA_BANNER_TITLE,
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		accentSplitCtaBannerDescription
	} from '$lib/config/constants/config';

	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';
	import PublicLandingWorkflowSection from '$lib/ui/templates/landing-page/PublicLandingWorkflowSection.svelte';
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
		agent: PublicAgentHostLandingPage;
		secondaryCtaText: string;
		secondaryCtaHref: string;
	};

	let { agent, secondaryCtaText, secondaryCtaHref }: Props = $props();

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	let accentBannerDescription = $derived(accentSplitCtaBannerDescription(agent.agentLabel));

	const coreMessagingChannels = $derived(
		agent.slug === 'hermes' ? HERMES_CORE_MESSAGING_CHANNELS : OPENCLAW_CORE_MESSAGING_CHANNELS
	);
	const extensionMessagingChannels = $derived(
		agent.slug === 'hermes'
			? HERMES_EXTENSION_MESSAGING_CHANNELS
			: OPENCLAW_EXTENSION_MESSAGING_CHANNELS
	);

	const telegramAgentBranding = $derived({
		agentIcon: agent.icon,
		agentLabel: agent.telegramBotLabel ?? agent.agentLabel
	});
</script>

<PublicAgentHero
	{agent}
	heroTheme={landingHeroTheme}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
	docsCtaText="View Docs"
	docsCtaHref={agent.docsPath}
/>

{#if agent.workflowSection}
	<PublicLandingWorkflowSection
		section={agent.workflowSection}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
		{telegramAgentBranding}
	/>
{/if}

<WhoIsFor
	heroTheme={landingHeroTheme}
	landingSubtitle={agent.audienceSubtitle}
	landingTitle={agent.audienceTitle}
	cards={agent.audienceCards}
/>

{#if agent.setupSteps.length > 0}
	<FeaturesOrdered
		steps={agent.setupSteps}
		heroTheme={landingHeroTheme}
		sectionSubtitle={agent.setupStepsSubtitle}
		sectionTitle={agent.setupStepsTitle}
		{telegramAgentBranding}
	/>
{/if}


{#each agent.featureSections as section, index (index)}
	<PublicAgentFeatureSection
		{section}
		{index}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
		{telegramAgentBranding}
	/>
{/each}

{#if agent.comparisonSection}
	<WithWithout
		heroTheme={landingHeroTheme}
		landingSubtitle={agent.comparisonSection.subtitle}
		landingTitle={agent.comparisonSection.title}
		landingDescription={agent.comparisonSection.description}
		withoutTitle={agent.comparisonSection.withoutTitle}
		withTitle={agent.comparisonSection.withTitle}
		points={agent.comparisonSection.points}
	/>
{/if}

{#if agent.commandReferenceSection}
	<CliCommandReference
		heroTheme={landingHeroTheme}
		landingSubtitle={agent.commandReferenceSection.subtitle}
		landingTitle={agent.commandReferenceSection.title}
		landingDescription={agent.commandReferenceSection.description}
		commands={agent.commandReferenceSection.commands ?? []}
	/>
{/if}

{#if agent.supportedChannelsSection}
	<SimpleCardGrid
		heroTheme={landingHeroTheme}
		headingId="agent-supported-channels-heading"
		title={agent.supportedChannelsSection.title}
		description={agent.supportedChannelsSection.description}
		subtitle={agent.supportedChannelsSection.subtitle}
		extensionLabel={agent.supportedChannelsSection.extensionLabel}
		items={coreMessagingChannels}
		extensionItems={extensionMessagingChannels}
	/>
{/if}

<div class="container mx-auto px-4">
	<PublicFaq
		heroTheme={landingHeroTheme}
		faqSubtitle={agent.faqSubtitle}
		faqTitle={agent.faqTitle}
		faqDescription={agent.faqDescription}
		faqItems={agent.faqItems}
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
