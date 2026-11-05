<script lang="ts">
	import type { PageData } from './$types';
	import type { CompareProductSummaryViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';
	import type { CompareProductSlug } from '$lib/content/constants/competitors';

	import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';
	import { icons } from '$data/icons';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import PublicCompareDirectoryLongForm from '$lib/ui/components/compare/PublicCompareDirectoryLongForm.svelte';
	import PublicComparePageSectionNav from '$lib/ui/components/compare/PublicComparePageSectionNav.svelte';
	import { buildComparePageSectionNavItems } from '$lib/content/constants/competitors/comparePageSectionNav';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';
	import CompareProductLink from '$lib/ui/links/CompareProductLink.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import PublicCompareLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicCompareLandingBreadcrumb.svelte';
	import { getCompareProductHeroCardIconStyles } from '$lib/content/constants/competitors/compareProductIconStyles';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let detailVm = $derived(data.detailVm);
	let schemaData = $derived(data.schemaData);

	let leftProductVm: CompareProductSummaryViewModel = $derived(detailVm.leftProduct);
	let rightProductVm: CompareProductSummaryViewModel = $derived(detailVm.rightProduct);
	let compareRows = $derived(detailVm.compareRows);
	let channelsSection = $derived(detailVm.channelsSection);
	let directoryCoverageSection = $derived(detailVm.directoryCoverageSection);
	let withWithoutSection = $derived(detailVm.withWithoutSection);
	let faqItems = $derived(detailVm.faqItems);
	let relatedPairs = $derived(detailVm.relatedPairs);
	let isDirectoryLongForm = $derived(detailVm.layout === 'directory_long_form');
	let longForm = $derived(detailVm.longForm);
	let navSections = $derived(
		longForm
			? buildComparePageSectionNavItems({
					layout: detailVm.layout,
					longForm,
					includeSocialChannels: channelsSection != null,
					includeDirectoryChannels: directoryCoverageSection != null,
					includeFaq: faqItems.length > 0
				})
			: []
	);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /compare
	const rootPathCompare = getRootPathPublicCompare();
	const compareHubPath = route(rootPathCompare);

	let moreComparisonItems = $derived([
		{
			id: 'all-comparisons',
			title: 'All comparisons',
			iconName: icons.Grid3x3.name,
			iconContainerClass:
				'bg-linear-to-br from-violet-400/25 via-fuchsia-300/18 to-indigo-300/20 text-violet-100 ring-violet-300/30',
			href: compareHubPath,
			description: isDirectoryLongForm
				? 'See all directory submission comparisons.'
				: 'See all scheduler comparisons.',
			ctaLabel: 'Open'
		},
		...relatedPairs.map((pair) => ({
			id: pair.slug,
			title: `vs. ${pair.name}`,
			iconName: pair.icon,
			iconContainerClass: iconStyleForProduct(pair.slug as CompareProductSlug).cardContainerClass,
			iconClass: iconStyleForProduct(pair.slug as CompareProductSlug).iconClass,
			href: pair.href,
			description: pair.description,
			ctaLabel: 'Open'
		}))
	]);

	// /pricing
	const pricingPath = route('pricing');
	const compareHeroCtaText = 'Or Start Using OpenQuok For Free';

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const compareNamePrimaryClass =
		'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';
	const compareNameAccentClass =
		'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

	function iconStyleForProduct(slug: CompareProductSlug) {
		return getCompareProductHeroCardIconStyles(slug);
	}

	const compareSectionHeroTheme = landingHeroTheme;
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<div class="flex justify-center">
			<PublicCompareLandingBreadcrumb
				variant="detail"
				leftProductName={leftProductVm.name}
				rightProductName={rightProductVm.name}
			/>
		</div>
		<div class="flex items-center justify-center gap-3 sm:gap-4">
			<div
				class={`flex size-14 items-center justify-center rounded-2xl shadow-sm ring-1 sm:size-16 ${iconStyleForProduct(leftProductVm.slug as CompareProductSlug).heroContainerClass}`}
			>
				<AbstractIcon
					name={leftProductVm.icon}
					width="30"
					height="30"
					class={iconStyleForProduct(leftProductVm.slug as CompareProductSlug).iconClass ??
						'size-7 sm:size-8'}
					focusable="false"
				/>
			</div>
			<AbstractIcon
				name={icons.ArrowRight.name}
				width="20"
				height="20"
				class="size-5 text-base-content/45"
				focusable="false"
			/>
			<div
				class={`flex size-14 items-center justify-center rounded-2xl shadow-sm ring-1 sm:size-16 ${iconStyleForProduct(rightProductVm.slug as CompareProductSlug).heroContainerClass}`}
			>
				<AbstractIcon
					name={rightProductVm.icon}
					width="30"
					height="30"
					class={iconStyleForProduct(rightProductVm.slug as CompareProductSlug).iconClass ??
						'size-7 sm:size-8'}
					focusable="false"
				/>
			</div>
		</div>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			<CompareProductLink
				slug={leftProductVm.slug as CompareProductSlug}
				class={compareNamePrimaryClass}
			>
				{leftProductVm.name}
			</CompareProductLink>
			<span class="px-2 text-base-content/80">vs</span>
			<CompareProductLink
				slug={rightProductVm.slug as CompareProductSlug}
				class={compareNameAccentClass}
			>
				{rightProductVm.name}
			</CompareProductLink>
			<span class="pl-2 text-base-content">comparison</span>
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{detailVm.heroDescription}
		</p>
		<div class="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
			{#if isDirectoryLongForm && longForm}
				<InternalLink
					href={longForm.directorySubmissionToolPath}
					class="btn btn-primary my-2 w-full max-w-sm rounded-full px-8 text-sm sm:w-auto sm:max-w-none sm:px-10 sm:text-base"
				>
					Explore directory launch
				</InternalLink>
				<ButtonGlitchBrightness
					class="my-2 w-full max-w-sm justify-center rounded-full px-8 text-sm sm:w-auto sm:max-w-none sm:px-10 sm:text-base"
					variant="outline"
					size="lg"
					href={signUpPath}
					preload="off"
				>
					Start free trial
				</ButtonGlitchBrightness>
			{:else}
				<ButtonGlitchBrightness
					class="my-2 w-full max-w-sm justify-center rounded-full px-8 text-sm sm:w-auto sm:max-w-none sm:px-10 sm:text-base"
					variant="primary"
					size="lg"
					href={signUpPath}
					preload="off"
				>
					{compareHeroCtaText}
				</ButtonGlitchBrightness>
			{/if}
		</div>
	</header>

	{#if longForm}
		<div class="container mx-auto mt-16 max-w-7xl px-4">
			<PublicComparePageSectionNav sections={navSections} placement="inline" class="mb-10" />
			<div
				class="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,16rem)] lg:items-start lg:gap-8 xl:gap-10"
			>
				<div class="min-w-0">
					<PublicCompareDirectoryLongForm
						{longForm}
						heroTheme={compareSectionHeroTheme}
						benefitsHeroTheme={landingHeroTheme}
						leftProduct={leftProductVm}
						rightProduct={rightProductVm}
						{compareRows}
						{channelsSection}
						{directoryCoverageSection}
						{withWithoutSection}
						isDirectoryCompare={isDirectoryLongForm}
						{compareNamePrimaryClass}
						{compareNameAccentClass}
						iconStyleForProduct={(slug) => iconStyleForProduct(slug)}
					/>

					{#if faqItems.length > 0}
						<PublicFaq heroTheme={faqHeroTheme} {faqItems} sectionClass="mt-20 scroll-mt-24" />
					{/if}

					<SimpleCardGrid
						heroTheme={compareSectionHeroTheme}
						headingId="compare-more-comparisons"
						subtitle="next steps"
						title="More comparisons"
						description={isDirectoryLongForm
							? 'Open more directory submission comparisons.'
							: 'Open more product comparisons. Find a scheduler that fits your team.'}
						items={moreComparisonItems}
						getItemKey={(item) => item.id}
						sectionClass="pt-20 pb-0 scroll-mt-24"
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

					<div class="pt-4">
						<AccentSplitCtaBanner
							title="See plans and pricing"
							description="Review OpenQuok plans and pick one that fits your team."
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
				</div>

				<PublicComparePageSectionNav sections={navSections} placement="sidebar" />
			</div>
		</div>
	{/if}
</SectionOuterContainer>
