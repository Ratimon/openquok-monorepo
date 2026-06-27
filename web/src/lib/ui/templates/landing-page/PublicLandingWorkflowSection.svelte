<script lang="ts">
	import type { PublicLandingWorkflowSection } from '$lib/content/constants/publicAgentConfig';
	import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
	import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import DesktopMock from '$lib/ui/templates/device-mocks/desktop/DesktopMock.svelte';
	import DesktopMockContent from '$lib/ui/templates/device-mocks/desktop/DesktopMockContent.svelte';
	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	type Props = {
		section: PublicLandingWorkflowSection;
		ctaText: string;
		ctaHref: string;
		telegramAgentBranding?: TelegramMockAgentBranding;
		bgColorClass?: string;
	};

	let {
		section,
		ctaText,
		ctaHref,
		telegramAgentBranding,
		bgColorClass = 'bg-base-100'
	}: Props = $props();
</script>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={section.subtitle}
	landingTitle={section.title}
	landingDescription={section.description}
	showCta={false}
	{ctaText}
	{ctaHref}
	{bgColorClass}
	mediaContainerClass={section.deviceMock === 'desktop' ? 'max-w-3xl' : 'max-w-[320px]'}
	mediaColumnClass="justify-center"
>
	{#snippet leftMedia()}
		{#if section.deviceMock === 'desktop'}
			<div
				class="aspect-auto size-full overflow-hidden"
				role="img"
				aria-label={section.imageAlt ?? section.subtitle}
			>
				<DesktopMock class="size-full">
					<DesktopMockContent
						content={section.deviceMockContent as DesktopMockContentId}
					/>
				</DesktopMock>
			</div>
		{:else}
			<div
				class="mx-auto flex h-[420px] w-full max-w-[260px] items-center justify-center overflow-hidden sm:h-[460px] sm:max-w-[280px] lg:h-[500px] lg:max-w-[300px]"
				role="img"
				aria-label={section.imageAlt ?? section.subtitle}
			>
				<Iphone15ProMock class="h-full w-auto max-w-full">
					<Iphone15ProMockContent
						content={section.deviceMockContent as IphoneMockContentId}
						{telegramAgentBranding}
					/>
				</Iphone15ProMock>
			</div>
		{/if}
	{/snippet}
</HeroWithLeftMedia>
