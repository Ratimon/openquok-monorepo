<script lang="ts">
	import type { HumanizeChannelHubLinkViewModel } from '$lib/ai-humanize';

	import { browser } from '$app/environment';

	import { buildHumanizeFaqSection } from '$lib/ai-humanize/constants/publicHumanizeFaqConfig';
	import {
		getRootPathPublicChannel,
		getRootPathPublicChannels
	} from '$lib/area-public/constants/getRootPathPublicChannels';
	import {
		getRootPathPublicHumanizer,
		getRootPathPublicTools
	} from '$lib/area-public/constants/getRootPathPublicTools';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';

	import HumanizeChannelHubGrid from '$lib/ui/components/humanize/HumanizeChannelHubGrid.svelte';
	import HumanizeHubBreadcrumb from '$lib/ui/components/humanize/HumanizeHubBreadcrumb.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/ui/templates/banners/centeredDarkCtaBannerCopy';
	import {
		HUMANIZE_DOCS_BANNER,
		accentSplitHumanizeChannelCtaBannerDescription,
		accentSplitHumanizeChannelCtaBannerText,
		accentSplitHumanizeChannelCtaBannerTitle
	} from '$lib/ui/templates/banners/humanizeBannerCopy';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type HumanizeComposerPanelModule =
		typeof import('$lib/ui/templates/humanize/HumanizeComposerPanel.svelte');

	let composerPanelCache: Promise<HumanizeComposerPanelModule> | null = null;

	function loadHumanizeComposerPanelChunk(): Promise<HumanizeComposerPanelModule> {
		composerPanelCache ??= import('$lib/ui/templates/humanize/HumanizeComposerPanel.svelte');
		return composerPanelCache;
	}

	type Props = {
		heroTitle: string;
		metaDescription: string;
		channelSlug?: string | null;
		channelLabel?: string | null;
		focusedProviderIdentifier?: string | null;
		composerMode?: 'global' | 'custom';
		isLoggedIn?: boolean;
		channelLinksVm?: HumanizeChannelHubLinkViewModel[];
	};

	let {
		heroTitle,
		metaDescription,
		channelSlug = null,
		channelLabel = null,
		focusedProviderIdentifier = null,
		composerMode = 'global',
		isLoggedIn = false,
		channelLinksVm = []
	}: Props = $props();

	// /tools
	const rootPathPublicTools = getRootPathPublicTools();
	const toolsHubHref = url(route(rootPathPublicTools));

	// /tools/humanizer
	const rootPathPublicHumanizer = getRootPathPublicHumanizer();
	const humanizerHref = url(route(rootPathPublicHumanizer));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /channels
	const channelsHubHref = route(getRootPathPublicChannels());

	const humanizeDocsBanner = HUMANIZE_DOCS_BANNER;

	const accentBannerTitle = $derived(
		channelSlug && channelLabel
			? accentSplitHumanizeChannelCtaBannerTitle(channelLabel)
			: humanizeDocsBanner.title
	);
	const accentBannerDescription = $derived(
		channelSlug && channelLabel
			? accentSplitHumanizeChannelCtaBannerDescription(channelLabel)
			: humanizeDocsBanner.description
	);
	const accentBannerCtaText = $derived(
		channelSlug && channelLabel
			? accentSplitHumanizeChannelCtaBannerText(channelLabel)
			: humanizeDocsBanner.ctaText
	);
	const accentBannerHref = $derived(
		channelSlug ? route(getRootPathPublicChannel(channelSlug)) : channelsHubHref
	);
	const faqSection = $derived(buildHumanizeFaqSection(channelSlug, channelLabel));
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
		<HumanizeHubBreadcrumb {toolsHubHref} {humanizerHref} {channelLabel} />

		<header class="space-y-3">
			<h1 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
				{heroTitle}
			</h1>
			<p class="max-w-3xl text-base text-base-content/75">
				{metaDescription}
			</p>
		</header>

		{#if browser}
			{#await loadHumanizeComposerPanelChunk()}
				{@render composerFallback()}
			{:then { default: HumanizeComposerPanel }}
				<HumanizeComposerPanel {focusedProviderIdentifier} {composerMode} {isLoggedIn} />
			{:catch}
				<p class="text-error px-2 py-8 text-center text-sm">Could not load the composer.</p>
			{/await}
		{:else}
			{@render composerFallback()}
		{/if}

		{#if channelLinksVm.length > 0}
			<HumanizeChannelHubGrid
				{channelLinksVm}
				activeChannelSlug={channelSlug}
				genericHref={humanizerHref}
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
