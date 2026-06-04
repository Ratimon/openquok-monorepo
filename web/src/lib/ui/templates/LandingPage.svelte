<script lang="ts">
	import { CONFIG_SCHEMA_LANDING_PAGE } from '$lib/config/constants/config';

	import AnimatedBeamMultipleAgent from '$lib/ui/templates/AnimatedBeamMultipleAgent.svelte';
	import HeroDemo from '$lib/ui/templates/HeroDemo.svelte';
	import HeroMain from '$lib/ui/templates/HeroMain.svelte';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';

	type Props = {
		landingPageConfigVm?: Record<string, string>;
		demoYoutubeVideoId: string;
		demoThumbnailAlt: string;
		demoHeadingId: string;
	};

	let {
		landingPageConfigVm = {},
		demoYoutubeVideoId,
		demoThumbnailAlt,
		demoHeadingId
	}: Props = $props();

	const heroTitle = $derived(
		landingPageConfigVm.HERO_TITLE || String(CONFIG_SCHEMA_LANDING_PAGE.HERO_TITLE.default)
	);
	const heroSlogan = $derived(
		landingPageConfigVm.HERO_SLOGAN || String(CONFIG_SCHEMA_LANDING_PAGE.HERO_SLOGAN.default)
	);

	const demoSubtitle = $derived(
		landingPageConfigVm.DEMO_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_SUBTITLE.default)
	);
	const demoTitle = $derived(
		landingPageConfigVm.DEMO_TITLE || String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_TITLE.default)
	);
	const demoDescription = $derived(
		landingPageConfigVm.DEMO_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_DESCRIPTION.default)
	);

	const feature1Subtitle = $derived(
		landingPageConfigVm.FEATURE_1_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_1_SUBTITLE.default)
	);
	const feature1Title = $derived(
		landingPageConfigVm.FEATURE_1_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_1_TITLE.default)
	);
	const feature1Description = $derived(
		landingPageConfigVm.FEATURE_1_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_1_DESCRIPTION.default)
	);

	const feature2Subtitle = $derived(
		landingPageConfigVm.FEATURE_2_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_SUBTITLE.default)
	);
	const feature2Title = $derived(
		landingPageConfigVm.FEATURE_2_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_TITLE.default)
	);
	const feature2Description = $derived(
		landingPageConfigVm.FEATURE_2_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_DESCRIPTION.default)
	);

	const feature3Subtitle = $derived(
		landingPageConfigVm.FEATURE_3_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_3_SUBTITLE.default)
	);
	const feature3Title = $derived(
		landingPageConfigVm.FEATURE_3_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_3_TITLE.default)
	);
	const feature3Description = $derived(
		landingPageConfigVm.FEATURE_3_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_3_DESCRIPTION.default)
	);

	const feature4Subtitle = $derived(
		landingPageConfigVm.FEATURE_4_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_4_SUBTITLE.default)
	);
	const feature4Title = $derived(
		landingPageConfigVm.FEATURE_4_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_4_TITLE.default)
	);
	const feature4Description = $derived(
		landingPageConfigVm.FEATURE_4_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_4_DESCRIPTION.default)
	);

	const feature5Subtitle = $derived(
		landingPageConfigVm.FEATURE_5_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_5_SUBTITLE.default)
	);
	const feature5Title = $derived(
		landingPageConfigVm.FEATURE_5_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_5_TITLE.default)
	);
	const feature5Description = $derived(
		landingPageConfigVm.FEATURE_5_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_5_DESCRIPTION.default)
	);

	const secondaryCtaText = 'Get Started For Free';
	const secondaryCtaHref = '/pricing';

	const LANDING_HERO_TITLE_HIGHLIGHT_PILL_CLASS =
		'bg-white text-black px-3 py-1 rounded-md -rotate-1 inline-block';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	const TITLE_PART_HIGHLIGHT_PHRASE = /^(?:minimal|in action|effortlessly|confidently|efficiently)$/i;

	function parseLandingHeroTitlePartSegments(text: string): LandingHeroTitleSegment[] {
		if (!text) return [];
		const parts = text.split(/\b(minimal|in action|effortlessly|confidently|efficiently)\b/gi);
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

<HeroMain
	{heroTitle}
	{heroSlogan}
	ctaTextPrimary={secondaryCtaText}
	ctaHrefPrimary={secondaryCtaHref}
	githubOwner="Ratimon"
	githubRepo="openquok-monorepo"
/>

<HeroDemo
	heroTheme={landingHeroTheme}
	landingSubtitle={demoSubtitle}
	landingTitle={demoTitle}
	landingDescription={demoDescription}
	youtubeVideoId={demoYoutubeVideoId}
	thumbnailAlt={demoThumbnailAlt}
	headingId={demoHeadingId}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature1Subtitle}
	landingTitle={feature1Title}
	landingDescription={feature1Description}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
>
	{#snippet rightMedia()}
		<AnimatedBeamMultipleAgent />
	{/snippet}
</HeroWithRightMedia>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature2Subtitle}
	landingTitle={feature2Title}
	landingDescription={feature2Description}
	imageSrc="/landing/2-calendar-filters.mp4"
	imageAlt="Calendar with smart filters for scheduled posts"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature3Subtitle}
	landingTitle={feature3Title}
	landingDescription={feature3Description}
	imageSrc="/landing/3-kanban-filters.mp4"
	imageAlt="Kanban board for reviewing AI-generated drafts"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature4Subtitle}
	landingTitle={feature4Title}
	landingDescription={feature4Description}
	imageSrc="/landing/4-file-manager.mp4"
	imageAlt="Workspace-scoped file manager for media assets"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature5Subtitle}
	landingTitle={feature5Title}
	landingDescription={feature5Description}
	imageSrc="/landing/5-analytics.png"
	imageAlt="Analytics dashboard across social channels"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>
