<script lang="ts">
	import { page } from '$app/state';

	import type { BrowserExtensionProductFeatureSectionsConfig } from '$lib/content/constants/marketing/browser-extension-landing';
	import { PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG } from '$lib/content/constants/marketing/browser-extension-landing';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	import BentoLandingAddChannelDialogPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingAddChannelDialogPreview.svelte';
	import BentoLandingBrowserExtensionContextMenuPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingBrowserExtensionContextMenuPreview.svelte';
	import BentoLandingBrowserExtensionWorkflowsPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingBrowserExtensionWorkflowsPreview.svelte';
	import BentoLandingComposerPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingComposerPreview.svelte';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import SafariMock from '$lib/ui/templates/device-mocks/safari/SafariMock.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		sections: BrowserExtensionProductFeatureSectionsConfig;
		isLoggedIn?: boolean;
	};

	let { sections, isLoggedIn = false }: Props = $props();

	const hero = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero;

	const primaryCtaText = hero.primaryCta.label;
	const primaryCtaHref = $derived(hostedMarketingHref(hero.primaryCta.href, page.url.origin));
	const secondaryCtaText = hero.secondaryCta.label;
	const secondaryCtaHref = $derived(hostedMarketingHref(hero.secondaryCta.href, page.url.origin));

	const dualCta = $derived({
		primaryCtaText,
		primaryCtaHref,
		secondaryCtaText,
		secondaryCtaHref
	});
</script>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature1.subtitle}
	landingTitle={sections.feature1.title}
	landingDescription={sections.feature1.description}
	mediaContainerClass="max-w-2xl"
	{...dualCta}
>
	{#snippet rightMedia()}
		<div class="overflow-hidden rounded-xl border border-base-content/10 shadow-lg ring-1 ring-base-content/10">
			<BentoLandingComposerPreview {isLoggedIn} />
		</div>
	{/snippet}
</HeroWithRightMedia>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature2.subtitle}
	landingTitle={sections.feature2.title}
	landingDescription={sections.feature2.description}
	mediaContainerClass="max-w-2xl"
	{...dualCta}
>
	{#snippet leftMedia()}
		<div class="aspect-auto w-full overflow-hidden rounded-xl border border-base-content/10 shadow-lg ring-1 ring-base-content/10">
			<SafariMock class="size-full" url="www.openquok.com/blog">
				<BentoLandingBrowserExtensionContextMenuPreview />
			</SafariMock>
		</div>
	{/snippet}
</HeroWithLeftMedia>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature3.subtitle}
	landingTitle={sections.feature3.title}
	landingDescription={sections.feature3.description}
	mediaContainerClass="max-w-4xl"
	{...dualCta}
>
	{#snippet rightMedia()}
		<div
			class="flex min-h-[320px] overflow-hidden rounded-xl border border-base-content/10 bg-base-100 shadow-lg ring-1 ring-base-content/10 lg:min-h-[380px]"
		>
			<BentoLandingAddChannelDialogPreview />
		</div>
	{/snippet}
</HeroWithRightMedia>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature4.subtitle}
	landingTitle={sections.feature4.title}
	landingDescription={sections.feature4.description}
	mediaContainerClass="max-w-2xl"
	{...dualCta}
>
	{#snippet leftMedia()}
		<div class="overflow-hidden rounded-xl border border-base-content/10 shadow-lg ring-1 ring-base-content/10">
			<BentoLandingBrowserExtensionWorkflowsPreview />
		</div>
	{/snippet}
</HeroWithLeftMedia>
