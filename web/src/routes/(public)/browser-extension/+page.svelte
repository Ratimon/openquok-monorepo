<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';
	import { PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG } from '$lib/content/constants/marketing/browser-extension-landing';
	import { getPublicMarketingLandingFaqSection } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
	import { buildBrowserExtensionChannelCrossLinkCardDescription } from '$lib/content/utils/buildBrowserExtensionLandingGridCopy';
	import { buildBrowserExtensionChannelCrossLinkItems } from '$lib/content/utils/buildBrowserExtensionChannelCrossLinkItems';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicBrowserExtensionHero from '$lib/ui/templates/landing-page/PublicBrowserExtensionHero.svelte';
	import PublicBrowserExtensionProductFeatureSections from '$lib/ui/templates/landing-page/PublicBrowserExtensionProductFeatureSections.svelte';
	import PublicChannelAgentIntegrationsGrid from '$lib/ui/templates/landing-page/PublicChannelAgentIntegrationsGrid.svelte';
	import PublicChannelSiblingGrid from '$lib/ui/templates/landing-page/PublicChannelSiblingGrid.svelte';
	import PublicLandingHeroStatBadges from '$lib/ui/templates/landing-page/PublicLandingHeroStatBadges.svelte';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const landing = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG;
	const faqSection = getPublicMarketingLandingFaqSection('browser-extension');

	let schemaData = $derived(data.schemaData);
	let isLoggedIn = $derived(data.isLoggedIn ?? false);

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const sectionHeroTheme = landingHeroTheme;

	const heroPrimaryCta = $derived({
		label: landing.hero.primaryCta.label,
		href: hostedMarketingHref(landing.hero.primaryCta.href, page.url.origin)
	});

	const processStepsFooterHref = $derived(
		hostedMarketingHref(landing.processSection.stepsFooter.footerLinkHref, page.url.origin)
	);

	const relatedLinkItems = $derived(
		landing.relatedLinksSection.items.map((item) => ({
			...item,
			href: hostedMarketingHref(item.href, page.url.origin)
		}))
	);

	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const processSectionId = 'browser-extension-process';

	const channelCrossLinkItems = $derived(
		buildBrowserExtensionChannelCrossLinkItems(landing.channelCrossLinkSection.channelSlugs)
	);

	const channelCrossLinkCardDescription = (
		platformLabel: string,
		available: boolean,
		channelSlug: string
	) => buildBrowserExtensionChannelCrossLinkCardDescription(channelSlug, platformLabel, available);
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-0 md:py-0">
	<PublicBrowserExtensionHero
		title={landing.hero.title}
		slogan={landing.hero.description}
		primaryCta={heroPrimaryCta}
		socialPlatformsLabel={landing.hero.heroSocialPlatformsLabel}
		extensionPlatformsLabel={landing.hero.heroExtensionPlatformsLabel}
		githubOwner="Ratimon"
		githubRepo="openquok-monorepo"
	/>

	<PublicLandingHeroStatBadges
		badges={landing.trustStats}
		ariaLabel="Browser extension highlights"
	/>

	<div class="mt-8 sm:mt-12">
		<WhoIsFor
			heroTheme={landingHeroTheme}
			landingSubtitle={landing.whoIsFor.audienceSubtitle}
			landingTitle={landing.whoIsFor.audienceTitle}
			cards={[...landing.whoIsFor.audienceCards]}
		/>
	</div>

	<FeaturesOrdered
		steps={[...landing.processSection.steps]}
		sectionId={processSectionId}
		heroTheme={sectionHeroTheme}
		sectionSubtitle={landing.processSection.subtitle}
		sectionTitle={landing.processSection.title}
		sectionDescription={landing.processSection.description}
		footerPrompt={landing.processSection.stepsFooter.footerPrompt}
		footerLinkLabel={landing.processSection.stepsFooter.footerLinkLabel}
		footerLinkHref={processStepsFooterHref}
		sectionClass="scroll-mt-24 border-t border-base-content/10 bg-base-100 py-16 sm:py-20"
		collapseDelay={8000}
	/>

	<PublicBrowserExtensionProductFeatureSections
		sections={landing.productFeatureSections}
		{isLoggedIn}
	/>

	<PublicChannelSiblingGrid
		channelsVm={channelCrossLinkItems}
		sectionTitleOverride={landing.channelCrossLinkSection.title}
		sectionDescriptionOverride={landing.channelCrossLinkSection.description}
		cardDescriptionOverride={channelCrossLinkCardDescription}
	/>

	<PublicChannelAgentIntegrationsGrid
		channelSlug={landing.agentIntegrationsSection.integrationChannelSlug}
		platformLabel={landing.agentIntegrationsSection.platformLabel}
		variant="browser-extension"
	/>

	<SimpleCardGrid
		heroTheme={sectionHeroTheme}
		headingId="browser-extension-related-links-heading"
		subtitle={landing.relatedLinksSection.subtitle}
		title={landing.relatedLinksSection.title}
		description={landing.relatedLinksSection.description}
		items={relatedLinkItems}
		getItemKey={(item) => item.id}
		sectionClass="container mx-auto mt-16 max-w-6xl scroll-mt-24 px-4"
		patternComponent={StripedPattern}
		patternClass="text-primary/12 stroke-[0.75]"
	>
		{#snippet card(item, context)}
			<SimpleLinkCard
				{item}
				pattern={context.pattern}
				patternComponent={context.patternComponent}
				patternClass={context.patternClass}
			/>
		{/snippet}
	</SimpleCardGrid>

	<div class="container mx-auto max-w-5xl px-4">
		<PublicFaq
			heroTheme={faqHeroTheme}
			faqSubtitle={faqSection.faqSubtitle}
			faqTitle={faqSection.faqTitle}
			faqDescription={faqSection.faqDescription}
			faqItems={[...faqSection.faqItems]}
			sectionClass="mt-20 scroll-mt-24"
		/>

		<AccentSplitCtaBanner
			title={landing.docsBanner.title}
			description={landing.docsBanner.description}
			ctaText={landing.docsBanner.cta.label}
			ctaHref={hostedMarketingHref(landing.docsBanner.cta.href, page.url.origin)}
			sectionClass="mt-12"
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 pt-8 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
