<script lang="ts">
	import type { PayloadWizardChannelHubLinkViewModel } from '$lib/posts/constants/publicPayloadWizardChannelConfig';
	import type { PublicApiFormatExample } from '$lib/content/constants/apis/types';

	import { browser } from '$app/environment';

	import { getRootPathSocialMediaPostingApiPlatform } from '$lib/area-public/constants/getRootPathPublicApiMarketing';
	import {
		getRootPathPublicPayloadWizard,
		getRootPathPublicTools
	} from '$lib/area-public/constants/getRootPathPublicTools';
	import { buildPayloadWizardFaqSection } from '$lib/posts/constants/publicPayloadWizardFaqConfig';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';

	import PayloadWizardChannelHubGrid from '$lib/ui/components/payload-wizard/PayloadWizardChannelHubGrid.svelte';
	import PayloadWizardHubBreadcrumb from '$lib/ui/components/payload-wizard/PayloadWizardHubBreadcrumb.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/ui/templates/banners/centeredDarkCtaBannerCopy';
	import {
		PAYLOAD_WIZARD_DOCS_BANNER,
		accentSplitPayloadWizardChannelCtaBannerDescription,
		accentSplitPayloadWizardChannelCtaBannerText,
		accentSplitPayloadWizardChannelCtaBannerTitle
	} from '$lib/ui/templates/banners/payloadWizardBannerCopy';
	import PayloadWizardHeroPanel from '$lib/ui/templates/api-marketing/PayloadWizardHeroPanel.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicLandingHeroTitle from '$lib/ui/templates/landing-page/PublicLandingHeroTitle.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = {
		heroTitle: string;
		metaDescription: string;
		channelSlug?: string | null;
		channelLabel?: string | null;
		focusedProviderIdentifier?: string | null;
		composerMode?: 'global' | 'custom';
		formatExamples?: readonly PublicApiFormatExample[];
		isLoggedIn?: boolean;
		channelLinksVm?: PayloadWizardChannelHubLinkViewModel[];
	};

	let {
		heroTitle,
		metaDescription,
		channelSlug = null,
		channelLabel = null,
		focusedProviderIdentifier = null,
		composerMode = 'global',
		formatExamples = [],
		isLoggedIn = false,
		channelLinksVm = []
	}: Props = $props();

	// /tools
	const rootPathPublicTools = getRootPathPublicTools();
	const toolsHubHref = url(route(rootPathPublicTools));

	// /tools/payload-wizard
	const rootPathPublicPayloadWizard = getRootPathPublicPayloadWizard();
	const payloadWizardHref = url(route(rootPathPublicPayloadWizard));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const docsBanner = PAYLOAD_WIZARD_DOCS_BANNER;

	const accentBannerTitle = $derived(
		channelSlug && channelLabel
			? accentSplitPayloadWizardChannelCtaBannerTitle(channelLabel)
			: docsBanner.title
	);
	const accentBannerDescription = $derived(
		channelSlug && channelLabel
			? accentSplitPayloadWizardChannelCtaBannerDescription(channelLabel)
			: docsBanner.description
	);
	const accentBannerCtaText = $derived(
		channelSlug && channelLabel
			? accentSplitPayloadWizardChannelCtaBannerText(channelLabel)
			: docsBanner.ctaText
	);
	const accentBannerHref = $derived(
		channelSlug
			? route(getRootPathSocialMediaPostingApiPlatform(channelSlug))
			: route(docsBanner.docsPath)
	);
	const faqSection = $derived(buildPayloadWizardFaqSection(channelSlug, channelLabel));
</script>

{#snippet composerFallback()}
	<div
		class="border-base-300 text-base-content/60 flex min-h-[min(72vh,820px)] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border bg-base-100 shadow-sm"
	>
		<span class="loading loading-spinner loading-md"></span>
		<span class="text-sm">Loading composer…</span>
	</div>
{/snippet}

<SectionOuterContainer class="pb-16">
	<div class="space-y-6">
		<PayloadWizardHubBreadcrumb {toolsHubHref} {payloadWizardHref} {channelLabel} />

		<header class="space-y-3">
			<PublicLandingHeroTitle title={heroTitle} headingId="payload-wizard-tool-hero-heading" />
			<p class="max-w-3xl text-base text-base-content/75">
				{metaDescription}
			</p>
		</header>

		{#if browser}
			<PayloadWizardHeroPanel
				mode="guest"
				{isLoggedIn}
				{focusedProviderIdentifier}
				{composerMode}
				{formatExamples}
				sectionTitle="Compose with sample channels"
				sectionDescription="Build your draft, preview live JSON for POST /api/v1/public/posts, and copy the payload. Scheduling and uploads need a workspace — copy JSON stays free."
			/>
		{:else}
			{@render composerFallback()}
		{/if}

		{#if channelLinksVm.length > 0}
			<PayloadWizardChannelHubGrid
				{channelLinksVm}
				activeChannelSlug={channelSlug}
				genericHref={payloadWizardHref}
			/>
		{/if}
	</div>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={faqSection.faqSubtitle}
			faqTitle={faqSection.faqTitle}
			faqDescription={faqSection.faqDescription}
			faqItems={faqSection.faqItems}
			sectionClass="py-16 sm:py-20"
		/>

		<AccentSplitCtaBanner
			title={accentBannerTitle}
			description={accentBannerDescription}
			ctaText={accentBannerCtaText}
			ctaHref={accentBannerHref}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
