<script lang="ts">
	import type { PublicAgentFeatureSection } from '$lib/content/constants/agents';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	import { page } from '$app/state';
	import { getPublicChannelBySlug } from '$lib/content/constants/channels';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import BentoPublicChannelFeature from '$lib/ui/templates/bento/minor-templates/BentoPublicChannelFeature.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import PublicAgentConnectOnceBeamMedia from '$lib/ui/templates/landing-page/PublicAgentConnectOnceBeamMedia.svelte';
	import PublicAgentFeatureMedia from '$lib/ui/templates/landing-page/PublicAgentFeatureMedia.svelte';
	import PublicAgentParallelMocks from '$lib/ui/templates/landing-page/PublicAgentParallelMocks.svelte';

	type Props = {
		section: PublicAgentFeatureSection;
		index: number;
		ctaText: string;
		ctaHref: string;
		telegramAgentBranding?: TelegramMockAgentBranding;
		activeChannelSlug?: string | null;
	};

	let {
		section,
		index,
		ctaText,
		ctaHref,
		telegramAgentBranding,
		activeChannelSlug = null
	}: Props = $props();

	const isConnectOnceIphoneSection = $derived(
		section.subtitle.toLowerCase() === 'connect once' && section.deviceMock === 'iphone-15-pro'
	);
	const connectOnceChannelIconName = $derived(
		activeChannelSlug ? getPublicChannelBySlug(activeChannelSlug)?.icon ?? null : null
	);

	const isLoggedIn = $derived(
		Boolean((page.data as { isLoggedIn?: boolean } | undefined)?.isLoggedIn)
	);
	const bgColorClass = $derived(index % 2 === 0 ? 'bg-base-100' : 'bg-base-200');
	const cliCommandsTitle = $derived(section.cliCommandsTitle ?? 'CLI command options');
	const hasSideMedia = $derived(
		Boolean(section.parallelMocks?.length || section.deviceMock || section.bentoId)
	);
	const mediaOnRight = $derived(section.mediaOnRight !== false);
	const isWideMedia = $derived(
		Boolean(section.parallelMocks?.length) ||
			section.deviceMock === 'desktop' ||
			section.deviceMock === 'settings-panel'
	);

	const sharedHeroProps = $derived({
		heroTheme: landingHeroTheme,
		landingSubtitle: section.subtitle,
		landingTitle: section.title,
		landingDescription: section.description,
		imageSrc: section.bentoId ? undefined : section.imageSrc,
		imageAlt: section.imageAlt,
		showCta: false,
		ctaText,
		ctaHref,
		bgColorClass
	});

	const heroProps = $derived({
		...sharedHeroProps,
		...(isWideMedia
			? {
					imageSrc: undefined,
					mediaContainerClass: 'max-w-3xl',
					mediaColumnClass: 'justify-center'
				}
			: section.deviceMock
				? {
						imageSrc: undefined,
						mediaContainerClass: isConnectOnceIphoneSection ? 'max-w-4xl' : 'max-w-[320px]',
						mediaColumnClass: 'justify-center'
					}
				: {})
	});
</script>

{#snippet sideMedia()}
	{#if section.parallelMocks?.length}
		<PublicAgentParallelMocks
			items={section.parallelMocks}
			sectionSubtitle={section.subtitle}
			{telegramAgentBranding}
		/>
	{:else if section.deviceMock}
		{#if isConnectOnceIphoneSection}
			<PublicAgentConnectOnceBeamMedia
				{section}
				{telegramAgentBranding}
				channelIconName={connectOnceChannelIconName}
			/>
		{:else}
			<PublicAgentFeatureMedia {section} {telegramAgentBranding} />
		{/if}
	{:else if section.bentoId}
		<BentoPublicChannelFeature bentoId={section.bentoId} {isLoggedIn} />
	{/if}
{/snippet}

{#snippet cliCommandsBlock()}
	{#if section.cliCommands}
		<div class="space-y-3">
			<p class="text-sm font-semibold text-base-content/80">{cliCommandsTitle}</p>
			<TerminalCommandMock
				code={section.cliCommands}
				ariaLabel="OpenQuok CLI commands for agent draft review"
			/>
		</div>
	{/if}
{/snippet}

{#if mediaOnRight}
	<HeroWithRightMedia {...heroProps} rightMedia={hasSideMedia ? sideMedia : undefined}>
		{@render cliCommandsBlock()}
	</HeroWithRightMedia>
{:else}
	<HeroWithLeftMedia {...heroProps} leftMedia={hasSideMedia ? sideMedia : undefined}>
		{@render cliCommandsBlock()}
	</HeroWithLeftMedia>
{/if}
