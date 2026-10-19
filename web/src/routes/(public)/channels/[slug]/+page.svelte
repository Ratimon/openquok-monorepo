<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicDirectoryChannelSlug } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelProcessSection';
	import type { PublicChannelViewModel } from '$lib/area-public/PublicChannelByPage.presenter.svelte';

	import { page } from '$app/state';
	import { publicChannelByPagePresenter } from '$lib/area-public';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route, url } from '$lib/utils/path';
	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import {
		listPublicChannelsForHub,
		listPublicDirectoryChannelsForHub
	} from '$lib/content/constants/channels/index';
	import { enrichPublicChannelSiblingGridItems } from '$lib/content/constants/channels/catalog/channelPageSeo';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import BentoPublicChannelFeature from '$lib/ui/templates/bento/minor-templates/BentoPublicChannelFeature.svelte';
	import { PUBLIC_LANDING_GETTING_STARTED_GUIDE_CTA } from '$lib/content/constants/landing/hero-copy';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		CONFIG_SCHEMA_LANDING_PAGE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		accentSplitDocsCtaBannerDescription,
		accentSplitDocsCtaBannerTitle
	} from '$lib/config/constants/config';
	import PublicChannelHero from '$lib/ui/templates/landing-page/PublicChannelHero.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicComingSoonIntegrationPage from '$lib/ui/templates/landing-page/PublicComingSoonIntegrationPage.svelte';
	import PublicChannelAgentIntegrationsGrid from '$lib/ui/templates/landing-page/PublicChannelAgentIntegrationsGrid.svelte';
	import PublicChannelSiblingGrid from '$lib/ui/templates/landing-page/PublicChannelSiblingGrid.svelte';
	import PublicLandingTeamFeatureHero from '$lib/ui/templates/landing-page/PublicLandingTeamFeatureHero.svelte';
	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicChannelByPagePresenter;

	let schemaData = $derived(data.schemaData);
	let channelVm: PublicChannelViewModel = $derived(data.channelVm);
	let isLoggedIn = $derived(data.isLoggedIn === true);
	let isDirectoryChannel = $derived(channelVm.channelKind === 'directory');

	const heroCtaText = pagePresenter.heroCtaText;
	const featureCtaText = pagePresenter.featureCtaText;
	const secondaryCtaHref = $derived(
		hostedMarketingHref(pagePresenter.secondaryCtaHref, page.url.origin)
	);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	let accentBannerTitle = $derived(accentSplitDocsCtaBannerTitle(channelVm.platformLabel));
	let accentBannerDescription = $derived(accentSplitDocsCtaBannerDescription(channelVm.platformLabel));

	const directoryProcessSectionId = 'directory-channel-process';

	const directoryProcessFooterHref = $derived(
		channelVm.processSection
			? hostedMarketingHref(channelVm.processSection.stepsFooter.footerLinkHref, page.url.origin)
			: ''
	);

	const directoryChannelSlug = $derived(
		isDirectoryChannel && (channelVm.slug === 'peerpush' || channelVm.slug === 'uneed')
			? (channelVm.slug as PublicDirectoryChannelSlug)
			: undefined
	);

	const siblingChannels = $derived(
		enrichPublicChannelSiblingGridItems(
			(isDirectoryChannel ? listPublicDirectoryChannelsForHub() : listPublicChannelsForHub()).map(
				(channel) => ({
					slug: channel.slug,
					platformLabel: channel.platformLabel,
					icon: channel.icon,
					href: route(getRootPathPublicChannel(channel.slug)),
					available: channel.available
				})
			),
			channelVm.slug
		)
	);
</script>

<JsonLdHead schemaData={schemaData} />

{#if channelVm}
	{#if channelVm.available}
		<PublicChannelHero
			channelVm={channelVm}
			heroTheme={landingHeroTheme}
			ctaText={heroCtaText}
			ctaHref={secondaryCtaHref}
			docsCtaText={PUBLIC_LANDING_GETTING_STARTED_GUIDE_CTA}
			docsCtaHref={channelVm.docsPath}
		/>
	{:else}
		<PublicComingSoonIntegrationPage
			heroOnly
			platformLabel={channelVm.platformLabel}
			icon={channelVm.icon}
			channelKind={channelVm.channelKind ?? 'social'}
		/>
	{/if}

	<WhoIsFor
		heroTheme={landingHeroTheme}
		landingSubtitle={channelVm.audienceSubtitle}
		landingTitle={channelVm.audienceTitle}
		cards={channelVm.audienceCards}
	/>

	{#if channelVm.processSection}
		<FeaturesOrdered
			steps={[...channelVm.processSection.steps]}
			sectionId={directoryProcessSectionId}
			heroTheme={landingHeroTheme}
			sectionSubtitle={channelVm.processSection.subtitle}
			sectionTitle={channelVm.processSection.title}
			sectionDescription={channelVm.processSection.description}
			footerPrompt={channelVm.processSection.stepsFooter.footerPrompt}
			footerLinkLabel={channelVm.processSection.stepsFooter.footerLinkLabel}
			footerLinkHref={directoryProcessFooterHref}
			directoryChannelSlug={directoryChannelSlug}
			sectionClass="scroll-mt-24 border-t border-base-content/10 bg-base-100 py-16 sm:py-20"
			collapseDelay={8000}
		/>
	{/if}

	{#if !isDirectoryChannel}
		<PublicLandingTeamFeatureHero
			heroTheme={landingHeroTheme}
			landingSubtitle={String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_SUBTITLE.default)}
			landingTitle={String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_TITLE.default)}
			landingDescription={String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_DESCRIPTION.default)}
			showCta={false}
			ctaText={featureCtaText}
			ctaHref={secondaryCtaHref}
			bgColorClass="bg-base-100"
			{isLoggedIn}
		/>
	{/if}

	{#each channelVm.featureSections as section, index (index)}
		{#snippet sectionBento()}
			{#if section.bentoId}
				<BentoPublicChannelFeature bentoId={section.bentoId} {isLoggedIn} />
			{/if}
		{/snippet}
		{#if section.mediaOnRight !== false}
			<HeroWithRightMedia
				heroTheme={landingHeroTheme}
				landingSubtitle={section.subtitle}
				landingTitle={section.title}
				landingDescription={section.description}
				imageSrc={section.bentoId ? undefined : section.imageSrc}
				imageAlt={section.imageAlt}
				rightMedia={section.bentoId ? sectionBento : undefined}
				showCta={false}
				ctaText={featureCtaText}
				ctaHref={secondaryCtaHref}
				bgColorClass={(index + 1) % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
			/>
		{:else}
			<HeroWithLeftMedia
				heroTheme={landingHeroTheme}
				landingSubtitle={section.subtitle}
				landingTitle={section.title}
				landingDescription={section.description}
				imageSrc={section.bentoId ? undefined : section.imageSrc}
				imageAlt={section.imageAlt}
				leftMedia={section.bentoId ? sectionBento : undefined}
				showCta={false}
				ctaText={featureCtaText}
				ctaHref={secondaryCtaHref}
				bgColorClass={(index + 1) % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
			/>
		{/if}
	{/each}

	{#if !isDirectoryChannel}
		<PublicChannelAgentIntegrationsGrid
			channelSlug={channelVm.slug}
			platformLabel={channelVm.platformLabel}
		/>
	{/if}

	<PublicChannelSiblingGrid
		channelsVm={siblingChannels}
		activeChannelSlug={channelVm.slug}
		activePlatformLabel={channelVm.platformLabel}
	/>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={channelVm.faqSubtitle}
			faqTitle={channelVm.faqTitle}
			faqDescription={channelVm.faqDescription}
			faqItems={channelVm.faqItems}
			sectionClass="py-16 sm:py-20"
		/>

		<AccentSplitCtaBanner
			title={accentBannerTitle}
			description={accentBannerDescription}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={channelVm.docsPath}
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
