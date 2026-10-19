<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';
	import { PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG } from '$lib/content/constants/marketing/directory-submission-landing';
	import { getPublicMarketingLandingFaqSection } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
	import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import WithWithout from '$lib/ui/templates/WithWithout.svelte';
	import FeaturesOrdered from '$lib/ui/templates/FeaturesOrdered.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import IconTileGrid from '$lib/ui/templates/feature-grid/IconTileGrid.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import PublicDirectorySubmissionLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicDirectorySubmissionLandingBreadcrumb.svelte';
	import PublicDirectorySubmissionProductFeatureSections from '$lib/ui/templates/landing-page/PublicDirectorySubmissionProductFeatureSections.svelte';
	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const landing = PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG;
	const faqSection = getPublicMarketingLandingFaqSection('directory-submission');

	let schemaData = $derived(data.schemaData);
	let isLoggedIn = $derived(data.isLoggedIn ?? false);

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const sectionHeroTheme = landingHeroTheme;

	const heroPrimaryHref = $derived(
		hostedMarketingHref(landing.hero.primaryCta.href, page.url.origin)
	);
	const heroSecondaryHref = $derived(
		hostedMarketingHref(landing.hero.secondaryCta.href, page.url.origin)
	);
	const processStepsFooterHref = $derived(
		hostedMarketingHref(landing.processSection.stepsFooter.footerLinkHref, page.url.origin)
	);
	const pricingHref = $derived(hostedMarketingHref(publicFaqHref.pricing, page.url.origin));

	const relatedLinkItems = $derived(
		landing.relatedLinksSection.items.map((item) => ({
			id: item.id,
			title: item.title,
			description: item.description,
			href: hostedMarketingHref(item.href, page.url.origin),
			ctaLabel: item.ctaLabel,
			iconName: item.iconName
		}))
	);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const heroHeadingId = 'directory-submission-tool-hero-heading';
	const processSectionId = 'directory-submission-process';
	const pricingTableHeadingId = 'directory-submission-pricing-comparison-heading';
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-0 md:py-0">
	<header
		class="container mx-auto max-w-4xl space-y-6 px-4 py-10 text-center md:py-14"
		aria-labelledby={heroHeadingId}
	>
		<div class="flex justify-center">
			<PublicDirectorySubmissionLandingBreadcrumb />
		</div>

		<PublicHeroTitle title={landing.hero.title} headingId={heroHeadingId} />

		<p class={landingHeroTheme.descriptionClass}>{landing.hero.description}</p>

		{#if landing.hero.bullets.length > 0}
			<ul
				class="mx-auto max-w-xl space-y-2 text-left text-sm font-medium text-base-content/80 sm:text-base"
				aria-label="Directory launch highlights"
			>
				{#each landing.hero.bullets as bullet (bullet)}
					<li class="flex items-start gap-2.5">
						<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
						<span>{bullet}</span>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
			<ButtonGlitchBrightness
				class="rounded-full"
				variant="primary"
				size="default"
				href={heroPrimaryHref}
				preload="off"
			>
				{landing.hero.primaryCta.label}
			</ButtonGlitchBrightness>
			<ButtonGlitchBrightness
				class={`rounded-full ${landingHeroTheme.docsCtaButtonClass ?? ''}`}
				variant="outline"
				size="default"
				href={heroSecondaryHref}
				preload="off"
			>
				{landing.hero.secondaryCta.label}
			</ButtonGlitchBrightness>
		</div>

		<p class="text-xs font-medium tracking-wide text-base-content/55 uppercase sm:text-sm">
			{landing.hero.trustLine}
		</p>
	</header>

	<section
		class="border-t border-base-content/10 bg-base-200/30 py-12 sm:py-14"
		aria-label="Why human-paced launch"
	>
		<div class="container mx-auto max-w-5xl px-4">
			<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each landing.trustStats as stat (stat.id)}
					<li class="rounded-2xl border border-base-content/10 bg-base-100 px-5 py-6 text-center">
						<p class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
							{stat.value}
						</p>
						<p class="mt-2 text-sm font-medium text-base-content/65">{stat.label}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<div class="mt-8 sm:mt-12">
		<WhoIsFor
			heroTheme={landingHeroTheme}
			landingSubtitle={landing.whoIsFor.audienceSubtitle}
			landingTitle={landing.whoIsFor.audienceTitle}
			cards={[...landing.whoIsFor.audienceCards]}
		/>
	</div>

	<PublicDirectorySubmissionProductFeatureSections
		sections={landing.productFeatureSections}
		{isLoggedIn}
	/>

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

	<WithWithout
		heroTheme={landingHeroTheme}
		landingSubtitle={landing.compareSection.subtitle}
		landingTitle={landing.compareSection.title}
		landingDescription={landing.compareSection.description}
		withoutTitle={landing.compareSection.withoutTitle}
		withTitle={landing.compareSection.withTitle}
		points={[...landing.compareSection.points]}
		sectionClass="border-t border-base-content/10 bg-base-200 py-16 sm:py-20"
	/>

	<section
		class="border-t border-base-content/10 bg-base-200/30 py-16 sm:py-20"
		aria-labelledby={pricingTableHeadingId}
	>
		<div class="container mx-auto max-w-5xl px-4">
			<FeaturesSectionHeader
				heroTheme={sectionHeroTheme}
				headingId={pricingTableHeadingId}
				subtitle={landing.pricingComparisonSection.subtitle}
				title={landing.pricingComparisonSection.title}
				description={landing.pricingComparisonSection.description}
			/>

			<div class="mt-10 overflow-x-auto rounded-2xl border border-base-content/10 bg-base-100">
				<table class="w-full min-w-[640px] border-collapse text-left text-sm">
					<thead>
						<tr class="border-b border-base-content/10 bg-base-200/50">
							<th scope="col" class="px-4 py-3 font-semibold text-base-content">Model</th>
							<th scope="col" class="px-4 py-3 font-semibold text-base-content">Typical cost</th>
							<th scope="col" class="px-4 py-3 font-semibold text-base-content">Who submits</th>
							<th scope="col" class="px-4 py-3 font-semibold text-base-content">What you get</th>
						</tr>
					</thead>
					<tbody>
						{#each landing.pricingComparisonSection.rows as row (row.id)}
							<tr class="border-b border-base-content/10 last:border-b-0">
								<td class="px-4 py-4 align-top font-medium text-base-content">{row.model}</td>
								<td class="px-4 py-4 align-top text-base-content/80">
									{#if row.id === 'openquok-reviewed'}
										Workspace plan (<a
											href={pricingHref}
											class="font-semibold text-primary underline-offset-2 hover:underline"
											>see pricing</a
										>) + your review time
									{:else}
										{row.typicalCost}
									{/if}
								</td>
								<td class="px-4 py-4 align-top text-base-content/80">{row.whoSubmits}</td>
								<td class="px-4 py-4 align-top text-base-content/80">{row.whatYouGet}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<p class="mt-4 text-sm leading-relaxed text-base-content/65">
				{landing.pricingComparisonSection.footnote}
			</p>
			<p
				class="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-base-content/85"
			>
				{landing.pricingComparisonSection.callout}
			</p>
		</div>
	</section>

	<IconTileGrid
		heroTheme={landingHeroTheme}
		variant="directory"
		landingSubtitle={landing.featuresGridSection.subtitle}
		landingTitle={landing.featuresGridSection.title}
		landingDescription={landing.featuresGridSection.description}
		linkTiles={true}
		headingId="directory-submission-features-grid-heading"
	/>

	<SimpleCardGrid
		heroTheme={sectionHeroTheme}
		headingId="directory-submission-related-links-heading"
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
			ctaHref={landing.docsBanner.cta.href}
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
