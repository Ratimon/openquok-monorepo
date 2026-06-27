<script lang="ts">
	import type { PublicAgentFeatureSection } from '$lib/content/constants/publicAgentConfig';
	import type { TelegramMockAgentBranding } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import BentoPublicChannelFeature from '$lib/ui/templates/bento/minor-templates/BentoPublicChannelFeature.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import PublicAgentFeatureMedia from '$lib/ui/templates/landing-page/PublicAgentFeatureMedia.svelte';

	type Props = {
		section: PublicAgentFeatureSection;
		index: number;
		ctaText: string;
		ctaHref: string;
		telegramAgentBranding?: TelegramMockAgentBranding;
	};

	let { section, index, ctaText, ctaHref, telegramAgentBranding }: Props = $props();

	const bgColorClass = $derived(index % 2 === 0 ? 'bg-base-100' : 'bg-base-200');
	const cliCommandsTitle = $derived(section.cliCommandsTitle ?? 'CLI command options');
	const hasSideMedia = $derived(Boolean(section.deviceMock || section.bentoId));
	const mediaOnRight = $derived(section.mediaOnRight !== false);

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
		...(section.deviceMock
			? {
					imageSrc: undefined,
					mediaContainerClass: 'max-w-[320px]',
					mediaColumnClass: 'justify-center'
				}
			: {})
	});
</script>

{#snippet sideMedia()}
	{#if section.deviceMock}
		<PublicAgentFeatureMedia {section} {telegramAgentBranding} />
	{:else if section.bentoId}
		<BentoPublicChannelFeature bentoId={section.bentoId} />
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
