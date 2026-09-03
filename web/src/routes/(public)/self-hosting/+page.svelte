<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';
	import { PUBLIC_SELF_HOSTING_LANDING_CONFIG } from '$lib/content/constants/publicSelfHostingLandingConfig';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicSelfHostingHero from '$lib/ui/components/self-hosting/PublicSelfHostingHero.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
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

	const landing = PUBLIC_SELF_HOSTING_LANDING_CONFIG;

	let schemaData = $derived(data.schemaData);

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const sectionHeroTheme = landingHeroTheme;

	const startHereItems = $derived(
		landing.startHereSection.items.map((item) => ({
			id: item.id,
			title: item.title,
			description: item.description,
			href: hostedMarketingHref(item.href, page.url.origin),
			ctaLabel: item.ctaLabel,
			iconName: item.iconName
		}))
	);

	const stackGuideItems = $derived(
		landing.stackSection.items.map((item) => ({
			id: item.id,
			title: item.title,
			description: item.description,
			href: hostedMarketingHref(item.href, page.url.origin),
			ctaLabel: item.ctaLabel,
			iconName: item.iconName
		}))
	);

	const socialIntegrationItems = $derived(
		landing.socialIntegrationSection.items.map((item) => ({
			id: item.id,
			title: item.title,
			description: item.description,
			href: hostedMarketingHref(item.href, page.url.origin),
			ctaLabel: item.ctaLabel,
			iconName: item.iconName,
			iconClass: item.iconClass,
			iconContainerClass: item.iconContainerClass
		}))
	);
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-0 md:py-0">
	<PublicSelfHostingHero
		subtitle={landing.hero.subtitle}
		title={landing.hero.title}
		description={landing.hero.description}
		primaryCta={landing.hero.primaryCta}
		secondaryCta={landing.hero.secondaryCta}
		trustBadges={landing.trustBadges}
	/>

	<section
		id="choose-your-path"
		class="container mx-auto mt-16 max-w-6xl scroll-mt-24 px-4"
		aria-labelledby="self-hosting-comparison-heading"
	>
		<FeaturesSectionHeader
			heroTheme={sectionHeroTheme}
			headingId="self-hosting-comparison-heading"
			subtitle={landing.comparisonSection.subtitle}
			title={landing.comparisonSection.title}
			description={landing.comparisonSection.description}
		/>
		<div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each landing.comparisonSection.cards as card, index (card.id)}
				<article
					class={`rounded-2xl border p-6 ${
						index === 2 ? 'md:col-span-2 lg:col-span-1' : ''
					} ${
						card.id === 'hosted-cloud'
							? 'border-primary/20 bg-primary/5'
							: 'border-base-content/10 bg-base-200/40'
					}`}
				>
					<div class="flex items-center gap-3">
						<div
							class={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${
								card.id === 'hosted-cloud'
									? 'bg-primary/15 text-primary ring-primary/25'
									: 'bg-base-100/90 text-base-content ring-base-content/10'
							}`}
						>
							<AbstractIcon
								name={card.iconName}
								width="22"
								height="22"
								class="size-5.5"
								focusable="false"
							/>
						</div>
						<h2 class="text-xl font-semibold text-base-content">{card.title}</h2>
					</div>
					<p class="mt-3 text-sm leading-relaxed text-base-content/70">{card.description}</p>
					<ul class="mt-4 space-y-2 text-sm leading-relaxed text-base-content/80">
						{#each card.bullets as bullet, index (index)}
							<li class="flex gap-2">
								<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"
								></span>
								<span>{bullet}</span>
							</li>
						{/each}
					</ul>
					{#if card.cta}
						<div class="mt-6">
							<ButtonGlitchBrightness
								class="w-full justify-center rounded-full sm:w-auto"
								variant={card.id === 'hosted-cloud' ? 'primary' : 'outline'}
								size="default"
								href={card.cta.href}
								preload="off"
							>
								{card.cta.label}
							</ButtonGlitchBrightness>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	</section>

	<SimpleCardGrid
		heroTheme={sectionHeroTheme}
		headingId="self-hosting-start-here-heading"
		subtitle={landing.startHereSection.subtitle}
		title={landing.startHereSection.title}
		description={landing.startHereSection.description}
		items={startHereItems}
		getItemKey={(item) => item.id}
		sectionClass="container mx-auto mt-20 max-w-6xl scroll-mt-24 px-4"
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

	<SimpleCardGrid
		heroTheme={sectionHeroTheme}
		headingId="self-hosting-social-integration-heading"
		subtitle={landing.socialIntegrationSection.subtitle}
		title={landing.socialIntegrationSection.title}
		description={landing.socialIntegrationSection.description}
		items={socialIntegrationItems}
		getItemKey={(item) => item.id}
		sectionClass="mt-20 scroll-mt-24"
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

	<SimpleCardGrid
		heroTheme={sectionHeroTheme}
		headingId="self-hosting-stack-heading"
		subtitle={landing.stackSection.subtitle}
		title={landing.stackSection.title}
		description={landing.stackSection.description}
		items={stackGuideItems}
		getItemKey={(item) => item.id}
		sectionClass="mt-20 scroll-mt-24"
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
			faqSubtitle={landing.faqSection.faqSubtitle}
			faqTitle={landing.faqSection.faqTitle}
			faqDescription={landing.faqSection.faqDescription}
			faqItems={[...landing.faqSection.faqItems]}
			sectionClass="mt-20 scroll-mt-24"
		/>

		<AccentSplitCtaBanner
			title={landing.hostedFallbackBanner.title}
			description={landing.hostedFallbackBanner.description}
			ctaText={landing.hostedFallbackBanner.cta.label}
			ctaHref={landing.hostedFallbackBanner.cta.href}
			sectionClass="pb-16 pt-8 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
