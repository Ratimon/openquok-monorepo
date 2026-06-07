<script lang="ts">
	import type { PublicChannelLandingPage } from '$lib/content/constants/publicChannelCatalog';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import PublicFaq from '$lib/ui/templates/PublicFaq.svelte';

	import PublicChannelHero from '$lib/ui/components/channels/PublicChannelHero.svelte';

	type Props = {
		channel: PublicChannelLandingPage;
	};

	let { channel }: Props = $props();

	const secondaryCtaText = 'Get Started For Free';
	const secondaryCtaHref = '/pricing';

	const LANDING_HERO_TITLE_HIGHLIGHT_PILL_CLASS =
		'bg-white text-black px-3 py-1 rounded-md -rotate-1 inline-block';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	const TITLE_PART_HIGHLIGHT_PHRASE =
		/^(?:minimal|in action|effortlessly|confidently|efficiently|correctly|channels|plan|perfect plan|questions|bulk|agents|insights|scale)$/i;

	function parseLandingHeroTitlePartSegments(text: string): LandingHeroTitleSegment[] {
		if (!text) return [];
		const parts = text.split(
			/\b(minimal|in action|effortlessly|confidently|efficiently|correctly|channels|perfect plan|plan|questions|bulk|agents|insights|scale)\b/gi
		);
		const out: LandingHeroTitleSegment[] = [];
		for (const p of parts) {
			if (p === '') continue;
			out.push({ text: p, highlight: TITLE_PART_HIGHLIGHT_PHRASE.test(p) });
		}
		return out;
	}

	function landingHeroTitlePartHasHighlight(segments: LandingHeroTitleSegment[]): boolean {
		return segments.some((segment) => segment.highlight);
	}

	const landingHeroTheme = {
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg',
		ctaButtonClass:
			'my-2 w-full max-w-xs justify-center rounded-full px-10 text-sm sm:text-base lg:text-lg',
		imageClass: 'h-auto w-full rounded-lg shadow-2xl ring-1 ring-base-content/10',
		titlePartClass: (index: number, total: number) => {
			const primaryGradient =
				'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';
			const accentGradient =
				'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

			if (index === 0) return 'text-base-content';
			if (total >= 3 && index === total - 1) return accentGradient;
			return primaryGradient;
		},
		titleHighlightPillClass: LANDING_HERO_TITLE_HIGHLIGHT_PILL_CLASS,
		parseLandingHeroTitlePartSegments,
		landingHeroTitlePartHasHighlight
	};
</script>

<PublicChannelHero
	{channel}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

{#each channel.featureSections as section, index (index)}
	{#if section.mediaOnRight !== false}
		<HeroWithRightMedia
			heroTheme={landingHeroTheme}
			landingSubtitle={section.subtitle}
			landingTitle={section.title}
			landingDescription={section.description}
			imageSrc={section.imageSrc}
			imageAlt={section.imageAlt}
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
			imageSrc={section.imageSrc ?? ''}
			imageAlt={section.imageAlt}
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
		faqSubtitle={channel.faqSubtitle}
		faqTitle={channel.faqTitle}
		faqDescription={channel.faqDescription}
		faqItems={channel.faqItems}
		sectionClass="py-16 sm:py-20"
	/>
</div>
