<script lang="ts">
	import type { PageData } from './$types';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';

	import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';

	import { getCompareProductHeroCardIconStyles } from '$lib/content/constants/competitors/compareProductIconStyles';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import CompareProductLink from '$lib/ui/links/CompareProductLink.svelte';
	import PublicAlternativesListingCard from '$lib/ui/components/alternatives/PublicAlternativesListingCard.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import PublicAlternativesLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicAlternativesLandingBreadcrumb.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let detailVm = $derived(data.detailVm);
	let schemaData = $derived(data.schemaData);
	let faqItems = $derived(data.faqItems);
	let listings = $derived(detailVm.listings);
	let otherTargets = $derived(detailVm.otherTargets);
	let featuredListing = $derived(listings.find((listing) => listing.isOpenQuok) ?? listings[0]);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /alternatives
	const rootPathAlternatives = getRootPathPublicAlternatives();
	const alternativesHubPath = route(rootPathAlternatives);

	// /pricing
	const pricingPath = route('pricing');

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const sectionHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		parseLandingHeroTitlePartSegments: (text: string) => [{ text, highlight: false }]
	};

	function iconStyleForProduct(slug: CompareProductSlug) {
		return getCompareProductHeroCardIconStyles(slug);
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<div class="flex justify-center">
			<PublicAlternativesLandingBreadcrumb variant="detail" pageLabel={detailVm.title} />
		</div>
		<div class="flex justify-center">
			<div
				class={`flex size-16 items-center justify-center rounded-2xl shadow-sm ring-1 ${iconStyleForProduct(detailVm.targetSlug).heroContainerClass}`}
			>
				<AbstractIcon
					name={detailVm.targetIcon}
					width="32"
					height="32"
					class={iconStyleForProduct(detailVm.targetSlug).iconClass ?? 'size-8'}
					focusable="false"
				/>
			</div>
		</div>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			{detailVm.title}
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{detailVm.description}
		</p>
	</header>

	{#if featuredListing?.isOpenQuok}
		<section class="container mx-auto mt-12 max-w-5xl px-4">
			<div class="rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-10">
				<p class="text-xs font-bold tracking-wider text-primary uppercase">Open source · free to self-host</p>
				<h2 class="mt-3 text-2xl font-black tracking-tight text-base-content sm:text-3xl">
					OpenQuok is a free, open-source social media scheduler
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-base text-base-content/75">
					Self-host at no cost, or start a 7-day hosted trial. Connect your channels. Review each
					draft on the calendar or kanban. Publish from the dashboard, or send drafts from agents with
					skills, MCP, and the Public API.
				</p>
				<div class="mt-6 flex justify-center">
					<ButtonGlitchBrightness
						class="w-full max-w-sm justify-center rounded-full px-8 sm:w-auto"
						variant="primary"
						size="lg"
						href={signUpPath}
						preload="off"
					>
						Start for $0
					</ButtonGlitchBrightness>
				</div>
			</div>
		</section>
	{/if}

	<section class="container mx-auto mt-16 max-w-5xl scroll-mt-24 px-4">
		<div class="mx-auto max-w-3xl space-y-4 text-center">
			<p class={sectionHeroTheme.subtitleClass}>overview</p>
			<h2
				id="alternatives-target-overview"
				class="text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl"
			>
				About{' '}
				<CompareProductLink slug={detailVm.targetSlug}>{detailVm.targetName}</CompareProductLink>
			</h2>
			<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
				{detailVm.targetTagline}
			</p>
		</div>
		<p class="mt-6 text-base leading-relaxed text-base-content/80">
			{detailVm.targetOverview}
		</p>
	</section>

	<section class="container mx-auto mt-16 max-w-5xl scroll-mt-24 px-4">
		<FeaturesSectionHeader
			heroTheme={sectionHeroTheme}
			headingId="alternatives-best-list"
			subtitle="ranked picks"
			title={`Best alternatives to ${detailVm.targetName}`}
			description={`See alternatives to ${detailVm.targetName}. You can compare prices, channels, and features.`}
		/>

		<div class="mt-10 space-y-6">
			{#each listings as listing (listing.slug)}
				<PublicAlternativesListingCard
					listingVm={listing}
					targetName={detailVm.targetName}
					iconContainerClass={iconStyleForProduct(listing.slug).cardContainerClass}
					iconClass={iconStyleForProduct(listing.slug).iconClass}
				/>
			{/each}
		</div>
	</section>

	{#if otherTargets.length > 0}
		<SimpleCardGrid
			heroTheme={sectionHeroTheme}
			headingId="alternatives-other-targets"
			subtitle="more directories"
			title="Explore more alternatives"
			description="Open other alternative directories."
			items={[
				{
					id: 'all-alternatives',
					title: 'All alternatives',
					href: alternativesHubPath,
					description: 'Go back to the alternatives hub.',
					ctaLabel: 'Open'
				},
				...otherTargets.map((entry) => ({
					id: entry.slug,
					title: entry.title,
					iconName: entry.icon,
					iconContainerClass: iconStyleForProduct(entry.slug).cardContainerClass,
					iconClass: iconStyleForProduct(entry.slug).iconClass,
					href: entry.href,
					description: entry.description,
					ctaLabel: 'Open'
				}))
			]}
			getItemKey={(item) => item.id}
			sectionClass="pt-20 pb-0"
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
	{/if}

	<div class="container mx-auto max-w-5xl px-4">
		<PublicFaq heroTheme={faqHeroTheme} {faqItems} sectionClass="mt-20" />
	</div>

	<div class="container mx-auto px-4">
		<AccentSplitCtaBanner
			title="See plans and pricing"
			description="See OpenQuok prices, channels, and agent tools. Then pick a plan."
			ctaText="View pricing"
			ctaHref={pricingPath}
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
