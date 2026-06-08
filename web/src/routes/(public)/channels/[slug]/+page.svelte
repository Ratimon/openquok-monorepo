<script lang="ts">
	import type { PageData } from './$types';

	import { publicChannelByPagePresenter } from '$lib/area-public';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import BentoPublicChannelFeature from '$lib/ui/templates/bento/minor-templates/BentoPublicChannelFeature.svelte';
	import PublicChannelHero from '$lib/ui/components/channels/PublicChannelHero.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = publicChannelByPagePresenter;

	let channelVm = $derived(data.channelVm);
	let schemaData = $derived(data.schemaData);

	const secondaryCtaText = pagePresenter.secondaryCtaText;
	const secondaryCtaHref = pagePresenter.secondaryCtaHref;
</script>

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

{#if channelVm}
	<PublicChannelHero
		channel={channelVm}
		heroTheme={landingHeroTheme}
		ctaText={secondaryCtaText}
		ctaHref={secondaryCtaHref}
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
	</div>
{/if}
