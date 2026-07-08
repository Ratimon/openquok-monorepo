<script lang="ts">
	import type { PageData } from './$types';
	import type { CompareProductSummaryViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';

	import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicProductComparePricing from '$lib/ui/components/compare/PublicProductComparePricing.svelte';
	import PublicProductCompareSection from '$lib/ui/components/compare/PublicProductCompareSection.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import WithWithout from '$lib/ui/templates/WithWithout.svelte';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let detailVm = $derived(data.detailVm);
	let schemaData = $derived(data.schemaData);

	let leftProductVm: CompareProductSummaryViewModel = $derived(detailVm.leftProduct);
	let rightProductVm: CompareProductSummaryViewModel = $derived(detailVm.rightProduct);
	let compareRows = $derived(detailVm.compareRows);
	let withWithoutSection = $derived(detailVm.withWithoutSection);
	let faqItems = $derived(detailVm.faqItems);
	let relatedPairs = $derived(detailVm.relatedPairs);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /compare
	const rootPathCompare = getRootPathPublicCompare();
	const compareHubPath = route(rootPathCompare);

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Compare</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			{detailVm.heroTitle}
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{detailVm.heroDescription}
		</p>
		<div class="flex justify-center pt-2">
			<ButtonGlitchBrightness
				class="my-2 w-full max-w-xs justify-center rounded-full px-10 text-sm sm:w-auto sm:text-base"
				variant="primary"
				size="lg"
				href={signUpPath}
				preload="off"
			>
				{PUBLIC_BANNER_CTA_TEXT}
			</ButtonGlitchBrightness>
		</div>
	</header>

	<section class="container mx-auto mt-16 max-w-5xl scroll-mt-24 px-4">
		<h2 class="text-center text-2xl font-bold text-base-content sm:text-3xl">Platform overview</h2>
		<div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<article class="rounded-2xl border border-primary/20 bg-primary/5 p-6">
				<h3 class="text-xl font-semibold text-base-content">
					{leftProductVm.name}
				</h3>
				<p class="mt-2 text-sm font-medium text-primary">
					{leftProductVm.tagline}
				</p>
				<p class="mt-4 text-base leading-relaxed text-base-content/80">
					{leftProductVm.overview}
				</p>
			</article>
			<article class="rounded-2xl border border-base-content/10 bg-base-200/40 p-6">
				<h3 class="text-xl font-semibold text-base-content">
					{rightProductVm.name}
				</h3>
				<p class="mt-2 text-sm font-medium text-base-content/70">
					{rightProductVm.tagline}
				</p>
				<p class="mt-4 text-base leading-relaxed text-base-content/80">
					{rightProductVm.overview}
				</p>
			</article>
		</div>
	</section>

	<div class="container mx-auto mt-20 max-w-5xl px-4">
		<PublicProductComparePricing
			leftProductName={leftProductVm.name}
			rightProductName={rightProductVm.name}
			leftPlansVm={leftProductVm.pricingPlans}
			rightPlansVm={rightProductVm.pricingPlans}
		/>
	</div>

	<section class="container mx-auto mt-20 max-w-5xl scroll-mt-24 px-4">
		<h2 class="text-center text-2xl font-bold text-base-content sm:text-3xl">Supported channels</h2>
		<div class="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
			<div class="rounded-2xl border border-primary/20 bg-primary/5 p-6">
				<h3 class="text-lg font-semibold text-base-content">
					{leftProductVm.name}
				</h3>
				<ul class="mt-4 flex flex-wrap gap-2">
					{#each leftProductVm.channels as channel (channel)}
						<li>
							<span class="badge badge-primary badge-outline badge-sm">{channel}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="rounded-2xl border border-base-content/10 bg-base-200/40 p-6">
				<h3 class="text-lg font-semibold text-base-content">
					{rightProductVm.name}
				</h3>
				<ul class="mt-4 flex flex-wrap gap-2">
					{#each rightProductVm.channels as channel (channel)}
						<li>
							<span class="badge badge-outline badge-sm">{channel}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<div class="container mx-auto mt-20 max-w-5xl px-4">
		<PublicProductCompareSection
			leftProductName={leftProductVm.name}
			rightProductName={rightProductVm.name}
			rowsVm={compareRows}
		/>
	</div>

	<WithWithout
		heroTheme={landingHeroTheme}
		landingSubtitle={withWithoutSection.subtitle}
		landingTitle={withWithoutSection.title}
		landingDescription={withWithoutSection.description}
		withoutTitle={withWithoutSection.withoutTitle}
		withTitle={withWithoutSection.withTitle}
		points={withWithoutSection.points}
		sectionClass="mt-20 bg-base-200 py-16 sm:py-20"
	/>

	{#if faqItems.length > 0}
		<div class="container mx-auto max-w-5xl px-4">
			<PublicFaq heroTheme={faqHeroTheme} {faqItems} sectionClass="mt-20" />
		</div>
	{/if}

	<section class="container mx-auto mt-20 max-w-4xl px-4">
		<h2 class="text-center text-2xl font-bold text-base-content sm:text-3xl">More comparisons</h2>
		<p class="mx-auto mt-4 max-w-2xl text-center text-base text-base-content/70">
			Explore how OpenQuok compares to other social media schedulers.
		</p>
		<ul class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
			<li>
				<a
					class="flex h-full items-center justify-between rounded-2xl border border-base-content/10 p-6 transition hover:border-primary/40 hover:shadow-md"
					href={compareHubPath}
				>
					<span class="text-lg font-semibold text-base-content">All comparisons</span>
					<span class="text-sm font-medium text-primary" aria-hidden="true">→</span>
				</a>
			</li>
			{#each relatedPairs as pair (pair.slug)}
				<li>
					<a
						class="flex h-full items-center justify-between rounded-2xl border border-base-content/10 p-6 transition hover:border-primary/40 hover:shadow-md"
						href={pair.href}
					>
						<span class="text-lg font-semibold text-base-content">vs. {pair.name}</span>
						<span class="text-sm font-medium text-primary" aria-hidden="true">→</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<div class="container mx-auto px-4">
		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
