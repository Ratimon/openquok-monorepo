<script lang="ts">
	import type { PublicBrowserExtensionCta } from '$lib/content/constants/marketing/browser-extension-landing';
	import {
		LANDING_HERO_BROWSER_EXTENSION_ROTATE_OPTIONS,
		LANDING_HERO_BROWSER_EXTENSION_ROTATE_TITLE_LINE
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import HeroMain from '$lib/ui/templates/landing-page/HeroMain.svelte';
	import PublicBrowserExtensionLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicBrowserExtensionLandingBreadcrumb.svelte';

	type Props = {
		title: string;
		slogan: string;
		primaryCta: PublicBrowserExtensionCta;
		socialPlatformsLabel: string;
		extensionPlatformsLabel: string;
		githubOwner?: string;
		githubRepo?: string;
	};

	let {
		title,
		slogan,
		primaryCta,
		socialPlatformsLabel,
		extensionPlatformsLabel,
		githubOwner = '',
		githubRepo = ''
	}: Props = $props();
</script>

{#snippet browserExtensionHeroBreadcrumb()}
	<PublicBrowserExtensionLandingBreadcrumb />
{/snippet}

<HeroMain
	heroTitle={title}
	heroSlogan={slogan}
	heroPlatformsLabel={socialPlatformsLabel}
	heroTitleParseMode="social-agent-rotate"
	heroTitleRotateMarker={LANDING_HERO_BROWSER_EXTENSION_ROTATE_TITLE_LINE}
	heroTitleRotateOptions={LANDING_HERO_BROWSER_EXTENSION_ROTATE_OPTIONS}
	heroPlatformStripVariant="browser-extension"
	heroBrowserExtensionPlatformsLabel={extensionPlatformsLabel}
	showSloganHumanSupportSuffix={false}
	ctaTextPrimary={primaryCta.label}
	ctaHrefPrimary={primaryCta.href}
	{githubOwner}
	{githubRepo}
	breadcrumb={browserExtensionHeroBreadcrumb}
/>
