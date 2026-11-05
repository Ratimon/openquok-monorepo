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
	import { buildAlternativesDetailNavSections } from '$lib/content/constants/competitors/comparePageSectionNav';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicAlternativesListingCard from '$lib/ui/components/alternatives/PublicAlternativesListingCard.svelte';
	import PublicCompareDirectoryLongForm from '$lib/ui/components/compare/PublicCompareDirectoryLongForm.svelte';
	import PublicComparePageSectionNav from '$lib/ui/components/compare/PublicComparePageSectionNav.svelte';
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
	import InternalLink from '$lib/ui/links/InternalLink.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let detailVm = $derived(data.detailVm);
	let schemaData = $derived(data.schemaData);
	let faqItems = $derived(data.faqItems);
	let listings = $derived(detailVm.listings);
	let otherTargets = $derived(detailVm.otherTargets);
	let longForm = $derived(detailVm.longForm);

	let navSections = $derived(
		buildAlternativesDetailNavSections(longForm, faqItems.length > 0)
	);

	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const rootPathAlternatives = getRootPathPublicAlternatives();
	const alternativesHubPath = route(rootPathAlternatives);

	const pricingPath = route('pricing');

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const sectionHeroTheme = landingHeroTheme;

	const compareNamePrimaryClass =
		'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';
	const compareNameAccentClass =
		'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

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
		<div class="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
			{#if detailVm.isDirectoryTarget}
				<InternalLink
					href={longForm.directorySubmissionToolPath}
					class="btn btn-primary my-2 w-full max-w-sm rounded-full px-8 text-sm sm:w-auto sm:max-w-none sm:px-10 sm:text-base"
				>
					Explore directory launch
				</InternalLink>
			{/if}
			<ButtonGlitchBrightness
				class="my-2 w-full max-w-sm justify-center rounded-full px-8 text-sm sm:w-auto sm:max-w-none sm:px-10 sm:text-base"
				variant={detailVm.isDirectoryTarget ? 'outline' : 'primary'}
				size="lg"
				href={signUpPath}
				preload="off"
			>
				Start free trial
			</ButtonGlitchBrightness>
		</div>
	</header>

	<PublicComparePageSectionNav sections={navSections} placement="inline" class="container mx-auto mt-10 max-w-7xl px-4" />

	<div
		class="container mx-auto mt-10 grid max-w-7xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_min(100%,16rem)] lg:gap-12"
	>
		<div class="min-w-0">
			<PublicCompareDirectoryLongForm
				{longForm}
				heroTheme={sectionHeroTheme}
				benefitsHeroTheme={landingHeroTheme}
				leftProduct={detailVm.openQuokProduct}
				rightProduct={detailVm.targetProduct}
				compareRows={detailVm.compareRows}
				channelsSection={detailVm.channelsSection}
				directoryCoverageSection={detailVm.directoryCoverageSection}
				withWithoutSection={detailVm.withWithoutSection}
				isDirectoryCompare={detailVm.isDirectoryTarget}
				omitCompareMatrixSections={true}
				{compareNamePrimaryClass}
				{compareNameAccentClass}
				iconStyleForProduct={(slug) => iconStyleForProduct(slug)}
			>
				{#snippet yourOptionsExtra()}
					<div id="alternatives-best-list" class="scroll-mt-24">
						<FeaturesSectionHeader
							heroTheme={sectionHeroTheme}
							headingId="alternatives-best-list-heading"
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
					</div>
				{/snippet}
			</PublicCompareDirectoryLongForm>

			<PublicFaq heroTheme={faqHeroTheme} {faqItems} sectionClass="mt-20 scroll-mt-24" />
		</div>

		<PublicComparePageSectionNav sections={navSections} placement="sidebar" />
	</div>

	{#if otherTargets.length > 0}
		<SimpleCardGrid
			heroTheme={sectionHeroTheme}
			headingId="alternatives-other-targets"
			subtitle={detailVm.isDirectoryTarget ? 'more directories' : 'more schedulers'}
			title="Explore more alternatives"
			description="Open other alternative directories in the same category."
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
			sectionClass="container mx-auto max-w-5xl px-4 pt-20 pb-0"
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
