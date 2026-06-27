<script lang="ts">
	import type { PublicMcpLandingPageViewModel, PublicMcpIntegrationTab } from '$lib/content/constants/publicMcpConfig';
	import {
		resolvePublicMcpSkillSetupSteps,
		resolvePublicMcpSkillSetupStepsSubtitle,
		resolvePublicMcpSkillSetupStepsTitle
	} from '$lib/content/constants/publicMcpConfig';

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
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicMcpIntegrationSetup from '$lib/ui/templates/landing-page/PublicMcpIntegrationSetup.svelte';
	import PublicMcpHero from '$lib/ui/templates/landing-page/PublicMcpHero.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';

	type Props = {
		mcpVm: PublicMcpLandingPageViewModel;
		secondaryCtaText: string;
		secondaryCtaHref: string;
	};

	let { mcpVm, secondaryCtaText, secondaryCtaHref }: Props = $props();

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const configHeadingId = 'public-mcp-landing-config-heading';

	let integrationTab = $state<PublicMcpIntegrationTab>('mcp');

	let resolvedSkillSetupSteps = $derived(resolvePublicMcpSkillSetupSteps(mcpVm));

	let activeSetupSteps = $derived(
		integrationTab === 'skill' ? resolvedSkillSetupSteps : (mcpVm.setupSteps ?? [])
	);
	let activeSetupStepsTitle = $derived(
		integrationTab === 'skill'
			? resolvePublicMcpSkillSetupStepsTitle(mcpVm)
			: mcpVm.setupStepsTitle
	);
	let activeSetupStepsSubtitle = $derived(
		integrationTab === 'skill'
			? resolvePublicMcpSkillSetupStepsSubtitle(mcpVm)
			: mcpVm.setupStepsSubtitle
	);

	let accentBannerDescription = $derived(accentSplitCtaBannerDescription(mcpVm.agentLabel));
</script>

<PublicMcpHero
	{mcpVm}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
	docsCtaText="View Docs"
	docsCtaHref={mcpVm.docsPath}
/>

<div class="container mx-auto px-4 py-12 sm:py-16">
	<div class="mx-auto max-w-4xl">
		<PublicMcpIntegrationSetup
			agentLabel={mcpVm.agentLabel}
			activeClient={mcpVm.mcpClient}
			headingId={configHeadingId}
			bind:integrationTab
		/>
	</div>
</div>

<PublicLandingWorkflowSection
	section={mcpVm.workflowSection}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<WhoIsFor
	heroTheme={landingHeroTheme}
	landingSubtitle={mcpVm.audienceSubtitle}
	landingTitle={mcpVm.audienceTitle}
	cards={mcpVm.audienceCards}
/>

{#if activeSetupSteps.length > 0}
	{#key integrationTab}
		<FeaturesOrdered
			steps={activeSetupSteps}
			heroTheme={landingHeroTheme}
			sectionSubtitle={activeSetupStepsSubtitle}
			sectionTitle={activeSetupStepsTitle}
		/>
	{/key}
{/if}

<div class="container mx-auto px-4">
	<PublicFaq
		heroTheme={landingHeroTheme}
		faqSubtitle={mcpVm.faqSubtitle}
		faqTitle={mcpVm.faqTitle}
		faqDescription={mcpVm.faqDescription}
		faqItems={mcpVm.faqItems}
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
