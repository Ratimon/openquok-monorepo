<script lang="ts">
	import type { PublicMcpLandingPage } from '$lib/content/constants/publicMcpConfig';

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
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicMcpClientConfiguration from '$lib/ui/templates/landing-page/PublicMcpClientConfiguration.svelte';
	import PublicMcpHero from '$lib/ui/templates/landing-page/PublicMcpHero.svelte';
	import PublicMcpToolsPanel from '$lib/ui/templates/landing-page/PublicMcpToolsPanel.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';

	type Props = {
		mcp: PublicMcpLandingPage;
		secondaryCtaText: string;
		secondaryCtaHref: string;
	};

	let { mcp, secondaryCtaText, secondaryCtaHref }: Props = $props();

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const configHeadingId = 'public-mcp-landing-config-heading';

	let accentBannerDescription = $derived(accentSplitCtaBannerDescription(mcp.agentLabel));
</script>

<PublicMcpHero
	{mcp}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
	docsCtaText="View Docs"
	docsCtaHref={mcp.docsPath}
/>

<div class="container mx-auto px-4 py-12 sm:py-16">
	<div class="mx-auto max-w-4xl">
		<PublicMcpClientConfiguration
			activeClient={mcp.mcpClient}
			headingId={configHeadingId}
			sectionTitle="Copy configuration"
			sectionDescription={`Generate an programmatic token after sign-up, then paste the snippet for ${mcp.agentLabel}.`}
		/>
	</div>
</div>

{#if mcp.setupSteps.length > 0}
	<FeaturesOrdered
		steps={mcp.setupSteps}
		heroTheme={landingHeroTheme}
		sectionSubtitle={mcp.setupStepsSubtitle}
		sectionTitle={mcp.setupStepsTitle}
	/>
{/if}

<div class="container mx-auto px-4 py-12 sm:py-16">
	<PublicMcpToolsPanel />
</div>

<div class="container mx-auto px-4">
	<PublicFaq
		heroTheme={landingHeroTheme}
		faqSubtitle={mcp.faqSubtitle}
		faqTitle={mcp.faqTitle}
		faqDescription={mcp.faqDescription}
		faqItems={mcp.faqItems}
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
