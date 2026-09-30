<script lang="ts">
	import type { BestTimeChannelHubLinkViewModel } from '$lib/best-time-to-post';
	import type { ChannelToolSeoIntro } from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';

	import {
		getRootPathPublicBestTimeToPost,
		getRootPathPublicTools
	} from '$lib/area-public/constants/getRootPathPublicTools';
	import { buildBestTimeToPostFaqSection } from '$lib/best-time-to-post';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import BestTimeToPostChannelHubGrid from '$lib/ui/components/best-time-to-post/BestTimeToPostChannelHubGrid.svelte';
	import BestTimeToPostHubBreadcrumb from '$lib/ui/components/best-time-to-post/BestTimeToPostHubBreadcrumb.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/ui/templates/banners/centeredDarkCtaBannerCopy';
	import {
		BEST_TIME_TO_POST_DOCS_BANNER,
		accentSplitBestTimeChannelCtaBannerDescription,
		accentSplitBestTimeChannelCtaBannerText,
		accentSplitBestTimeChannelCtaBannerTitle
	} from '$lib/ui/templates/banners/bestTimeToPostBannerCopy';
	import PublicToolChannelSeoIntro from '$lib/ui/components/tools/PublicToolChannelSeoIntro.svelte';
	import BestTimeToPostCalculatorPanel from '$lib/ui/templates/best-time-to-post/BestTimeToPostCalculatorPanel.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicLandingHeroTitle from '$lib/ui/templates/landing-page/PublicLandingHeroTitle.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = {
		metaTitle: string;
		heroTitle: string;
		metaDescription: string;
		channelSlug?: string | null;
		channelLabel?: string | null;
		defaultPlatformSlug: string;
		channelLinksVm?: BestTimeChannelHubLinkViewModel[];
		heroLead?: string;
		seoIntro?: ChannelToolSeoIntro;
	};

	let {
		metaTitle,
		heroTitle,
		metaDescription,
		channelSlug = null,
		channelLabel = null,
		defaultPlatformSlug,
		channelLinksVm = [],
		heroLead,
		seoIntro
	}: Props = $props();

	// /tools
	const rootPathPublicTools = getRootPathPublicTools();
	const toolsHubHref = url(route(rootPathPublicTools));

	// /tools/best-time-to-post
	const rootPathPublicBestTimeToPost = getRootPathPublicBestTimeToPost();
	const bestTimeToPostHref = url(route(rootPathPublicBestTimeToPost));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /pricing
	const pricingPath = route('pricing');

	const docsBanner = BEST_TIME_TO_POST_DOCS_BANNER;

	const pageHeading = $derived(heroTitle);

	const heroSubtitle = $derived(
		seoIntro
			? channelLabel
				? `Free benchmark planner for ${channelLabel} — set your audience timezone in the calculator, then copy a test plan.`
				: 'Free benchmark planner — set your audience timezone in the calculator, then copy a test plan.'
			: metaDescription
	);

	let accentBannerTitle = $derived(
		channelSlug && channelLabel
			? accentSplitBestTimeChannelCtaBannerTitle(channelLabel)
			: docsBanner.title
	);
	let accentBannerDescription = $derived(
		channelSlug && channelLabel
			? accentSplitBestTimeChannelCtaBannerDescription(channelLabel)
			: docsBanner.description
	);
	let accentBannerCtaText = $derived(
		channelSlug && channelLabel
			? accentSplitBestTimeChannelCtaBannerText(channelLabel)
			: docsBanner.ctaText
	);
	let accentBannerHref = $derived(pricingPath);

	let faqSection = $derived(buildBestTimeToPostFaqSection(channelSlug, channelLabel));
</script>

<SectionOuterContainer class="pb-16">
	<div class="space-y-6">
		<BestTimeToPostHubBreadcrumb {toolsHubHref} {bestTimeToPostHref} {channelLabel} />

		<header class="space-y-3">
			<PublicLandingHeroTitle title={pageHeading} headingId="best-time-to-post-tool-hero-heading" />
			<p class="max-w-2xl text-sm leading-relaxed text-base-content/70 sm:text-base">
				{heroSubtitle}
			</p>
			{#if heroLead && !seoIntro}
				<p class="max-w-2xl text-sm leading-relaxed text-base-content/70 sm:text-base">{heroLead}</p>
			{/if}
		</header>

		{#if seoIntro}
			<PublicToolChannelSeoIntro intro={seoIntro} calculatorAnchorId="best-time-calculator" />
		{/if}

		<div
			id="best-time-calculator"
			class="border-base-300 min-w-0 scroll-mt-24 rounded-2xl border bg-base-100 shadow-sm"
		>
			<div class="border-base-300 flex shrink-0 items-center gap-2 border-b px-4 py-3 sm:px-6">
				<AbstractIcon name={icons.CalendarClock.name} class="size-5" width="20" height="20" />
				<div>
					<p class="text-sm font-semibold text-base-content">Timing test calculator</p>
					<p class="text-base-content/65 text-xs">
						Benchmark windows for controlled tests — not a prediction of your account’s peak hour.
					</p>
				</div>
			</div>

			<div class="min-w-0 p-4 sm:p-6">
				{#key defaultPlatformSlug}
					<BestTimeToPostCalculatorPanel
						{defaultPlatformSlug}
						{channelLinksVm}
						lockPlatform={Boolean(channelSlug)}
					/>
				{/key}
			</div>
		</div>

		{#if channelLinksVm.length > 0}
			<BestTimeToPostChannelHubGrid
				{channelLinksVm}
				activeChannelSlug={channelSlug}
				genericHref={bestTimeToPostHref}
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
