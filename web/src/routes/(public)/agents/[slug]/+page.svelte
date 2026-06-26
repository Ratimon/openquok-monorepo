<script lang="ts">
	import type { PageData } from './$types';

	import {
		HERMES_CORE_MESSAGING_CHANNELS,
		HERMES_EXTENSION_MESSAGING_CHANNELS
	} from '$data/hermes-messaging-channels';
	import {
		OPENCLAW_CORE_MESSAGING_CHANNELS,
		OPENCLAW_EXTENSION_MESSAGING_CHANNELS
	} from '$data/openclaw-messaging-channels';

	import { publicAgentByPagePresenter, isPublicAgentHostLandingPage, isPublicMcpLandingPage } from '$lib/area-public';
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
	import PublicMcpLandingPage from '$lib/ui/templates/landing-page/PublicMcpLandingPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicAgentByPagePresenter;

	let agentVm = $derived(data.agentVm);
	let schemaData = $derived(data.schemaData);
	let agentHostVm = $derived(agentVm && isPublicAgentHostLandingPage(agentVm) ? agentVm : null);
	let mcpVm = $derived(agentVm && isPublicMcpLandingPage(agentVm) ? agentVm : null);

	const secondaryCtaText = pagePresenter.secondaryCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	let accentBannerDescription = $derived(
		accentSplitCtaBannerDescription(agentVm?.agentLabel ?? 'your agent')
	);

	const coreMessagingChannels = $derived(
		agentHostVm?.slug === 'hermes'
			? HERMES_CORE_MESSAGING_CHANNELS
			: OPENCLAW_CORE_MESSAGING_CHANNELS
	);
	const extensionMessagingChannels = $derived(
		agentHostVm?.slug === 'hermes'
			? HERMES_EXTENSION_MESSAGING_CHANNELS
			: OPENCLAW_EXTENSION_MESSAGING_CHANNELS
	);

	const telegramAgentBranding = $derived(
		agentHostVm
			? {
					agentIcon: agentHostVm.icon,
					agentLabel: agentHostVm.telegramBotLabel ?? agentHostVm.agentLabel
				}
			: undefined
	);
</script>

<JsonLdHead schemaData={schemaData} />

{#if mcpVm}
	<PublicMcpLandingPage
		mcp={mcpVm}
		secondaryCtaText={secondaryCtaText}
		secondaryCtaHref={secondaryCtaHref}
	/>
{:else if agentHostVm}
	<PublicAgentHero
		agent={agentHostVm}
		heroTheme={landingHeroTheme}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
		docsCtaText="View Docs"
		docsCtaHref={agentHostVm.docsPath}
	/>

	{#if agentHostVm.setupSteps.length > 0}
		<FeaturesOrdered
			steps={agentHostVm.setupSteps}
			heroTheme={landingHeroTheme}
			sectionSubtitle={agentHostVm.setupStepsSubtitle}
			sectionTitle={agentHostVm.setupStepsTitle}
			{telegramAgentBranding}
		/>
	{/if}

	<WhoIsFor
		heroTheme={landingHeroTheme}
		landingSubtitle={agentHostVm.audienceSubtitle}
		landingTitle={agentHostVm.audienceTitle}
		cards={agentHostVm.audienceCards}
	/>

	{#each agentHostVm.featureSections as section, index (index)}
		<PublicAgentFeatureSection
			{section}
			{index}
			ctaText={secondaryCtaText}
			ctaHref={secondaryCtaHref}
			{telegramAgentBranding}
		/>
	{/each}

	{#if agentHostVm.comparisonSection}
		<WithWithout
			heroTheme={landingHeroTheme}
			landingSubtitle={agentHostVm.comparisonSection.subtitle}
			landingTitle={agentHostVm.comparisonSection.title}
			landingDescription={agentHostVm.comparisonSection.description}
			withoutTitle={agentHostVm.comparisonSection.withoutTitle}
			withTitle={agentHostVm.comparisonSection.withTitle}
			points={agentHostVm.comparisonSection.points}
		/>
	{/if}

	{#if agentHostVm.commandReferenceSection}
		<CliCommandReference
			heroTheme={landingHeroTheme}
			landingSubtitle={agentHostVm.commandReferenceSection.subtitle}
			landingTitle={agentHostVm.commandReferenceSection.title}
			landingDescription={agentHostVm.commandReferenceSection.description}
			commands={agentHostVm.commandReferenceSection.commands ?? []}
		/>
	{/if}

	{#if agentHostVm.supportedChannelsSection}
		<SimpleCardGrid
			heroTheme={landingHeroTheme}
			headingId="agent-supported-channels-heading"
			title={agentHostVm.supportedChannelsSection.title}
			description={agentHostVm.supportedChannelsSection.description}
			subtitle={agentHostVm.supportedChannelsSection.subtitle}
			extensionLabel={agentHostVm.supportedChannelsSection.extensionLabel}
			items={coreMessagingChannels}
			extensionItems={extensionMessagingChannels}
		/>
	{/if}

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={agentHostVm.faqSubtitle}
			faqTitle={agentHostVm.faqTitle}
			faqDescription={agentHostVm.faqDescription}
			faqItems={agentHostVm.faqItems}
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
