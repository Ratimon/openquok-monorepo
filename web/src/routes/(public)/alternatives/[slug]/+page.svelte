<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
	import type { CompareProductSlug } from '$lib/content/constants/publicCompareConfig';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicAlternativesListingCard from '$lib/ui/components/alternatives/PublicAlternativesListingCard.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

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

	const PRODUCT_ICON_STYLES: Record<
		CompareProductSlug,
		{ heroContainerClass: string; cardContainerClass: string; iconClass?: string }
	> = {
		openquok: {
			heroContainerClass:
				'bg-linear-to-br from-emerald-400/30 via-lime-300/20 to-amber-300/25 text-white ring-emerald-300/35',
			cardContainerClass:
				'bg-linear-to-br from-emerald-400/22 via-lime-300/16 to-amber-300/20 text-white ring-emerald-300/28'
		},
		hootsuite: {
			heroContainerClass:
				'bg-linear-to-br from-orange-400/30 via-amber-300/20 to-yellow-300/20 text-orange-100 ring-orange-300/35',
			cardContainerClass:
				'bg-linear-to-br from-orange-400/20 via-amber-300/16 to-yellow-300/16 text-orange-100 ring-orange-300/28'
		},
		buffer: {
			heroContainerClass:
				'bg-linear-to-br from-sky-400/30 via-cyan-300/20 to-blue-300/20 text-sky-100 ring-sky-300/35',
			cardContainerClass:
				'bg-linear-to-br from-sky-400/20 via-cyan-300/16 to-blue-300/16 text-sky-100 ring-sky-300/28'
		}
	};

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
		return PRODUCT_ICON_STYLES[slug];
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">{detailVm.eyebrow}</p>
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
				<p class="text-xs font-bold tracking-wider text-primary uppercase">One-stop platform</p>
				<h2 class="mt-3 text-2xl font-black tracking-tight text-base-content sm:text-3xl">
					OpenQuok is an agentic social media scheduler
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-base text-base-content/75">
					Connect channels, review every draft on calendar or kanban, and publish across every platform
					from the dashboard — or pipe drafts in from AI agents via skills, MCP, and the Public API.
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
		<FeaturesSectionHeader
			heroTheme={sectionHeroTheme}
			headingId="alternatives-target-overview"
			subtitle="overview"
			title={`About ${detailVm.targetName}`}
			description={detailVm.targetTagline}
		/>
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
			description={`Top social media schedulers teams evaluate when they outgrow ${detailVm.targetName}.`}
		/>

		<div class="mt-10 space-y-6">
			{#each listings as listing (listing.slug)}
				<PublicAlternativesListingCard
					{listing}
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
			description="Browse other social media scheduler directories and compare tools side by side."
			items={[
				{
					id: 'all-alternatives',
					title: 'All alternatives',
					href: alternativesHubPath,
					description: 'Return to the alternatives hub and search every directory page.',
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
			description="Review how OpenQuok compares on pricing, channels, and agent workflows — then pick the right plan for your team."
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
