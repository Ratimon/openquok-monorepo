<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicChannelViewModel } from '$lib/area-public/PublicChannelByPage.presenter.svelte';

	import { publicChannelByPagePresenter } from '$lib/area-public';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import BentoPublicChannelFeature from '$lib/ui/templates/bento/minor-templates/BentoPublicChannelFeature.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';
	import PublicChannelHero from '$lib/ui/templates/landing-page/PublicChannelHero.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicChannelByPagePresenter;

	let schemaData  = $derived(data.schemaData);
	let channelVm: PublicChannelViewModel = $derived(data.channelVm);

	const secondaryCtaText = pagePresenter.secondaryCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);
</script>

<JsonLdHead schemaData={schemaData} />

{#if channelVm}
	<PublicChannelHero
		channelVm={channelVm}
		heroTheme={landingHeroTheme}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
	/>

	<WhoIsFor
		heroTheme={landingHeroTheme}
		landingSubtitle={channelVm.audienceSubtitle}
		landingTitle={channelVm.audienceTitle}
		cards={channelVm.audienceCards}
	/>

	{#each channelVm.featureSections as section, index (index)}
		{#snippet sectionBento()}
			{#if section.bentoId}
				<BentoPublicChannelFeature bentoId={section.bentoId} />
			{/if}
		{/snippet}
		{#if section.mediaOnRight !== false}
			<HeroWithRightMedia
				heroTheme={landingHeroTheme}
				landingSubtitle={section.subtitle}
				landingTitle={section.title}
				landingDescription={section.description}
				imageSrc={section.bentoId ? undefined : section.imageSrc}
				imageAlt={section.imageAlt}
				rightMedia={section.bentoId ? sectionBento : undefined}
				showCta={false}
				ctaText={secondaryCtaText}
				ctaHref={secondaryCtaHref}
				bgColorClass={index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
			/>
		{:else}
			<HeroWithLeftMedia
				heroTheme={landingHeroTheme}
				landingSubtitle={section.subtitle}
				landingTitle={section.title}
				landingDescription={section.description}
				imageSrc={section.bentoId ? undefined : section.imageSrc}
				imageAlt={section.imageAlt}
				leftMedia={section.bentoId ? sectionBento : undefined}
				showCta={false}
				ctaText={secondaryCtaText}
				ctaHref={secondaryCtaHref}
				bgColorClass={index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
			/>
		{/if}
	{/each}

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={channelVm.faqSubtitle}
			faqTitle={channelVm.faqTitle}
			faqDescription={channelVm.faqDescription}
			faqItems={channelVm.faqItems}
			sectionClass="py-16 sm:py-20"
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
{/if}
