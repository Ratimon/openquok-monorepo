<script lang="ts">
	import type { PublicAgentFeatureSection } from '$lib/content/constants/publicAgentConfig';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import BentoPublicChannelFeature from '$lib/ui/templates/bento/minor-templates/BentoPublicChannelFeature.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import PublicAgentFeatureMedia from '$lib/ui/templates/landing-page/PublicAgentFeatureMedia.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		section: PublicAgentFeatureSection;
		index: number;
		ctaText: string;
		ctaHref: string;
	};

	let { section, index, ctaText, ctaHref }: Props = $props();

	const bgColorClass = $derived(index % 2 === 0 ? 'bg-base-100' : 'bg-base-200');
	const cliCommandsTitle = $derived(section.cliCommandsTitle ?? 'CLI command options');
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
</script>

{#snippet sectionBento()}
	{#if section.bentoId}
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

{#if section.mediaOnRight !== false}
	{#if section.deviceMock}
		<HeroWithRightMedia
			{...sharedHeroProps}
			imageSrc={undefined}
			mediaContainerClass="max-w-[320px]"
			mediaColumnClass="justify-center"
		>
			{#snippet rightMedia()}
				<PublicAgentFeatureMedia {section} />
			{/snippet}
			{#snippet children()}
				{@render cliCommandsBlock()}
			{/snippet}
		</HeroWithRightMedia>
	{:else if section.bentoId}
		<HeroWithRightMedia {...sharedHeroProps} rightMedia={sectionBento}>
			{#snippet children()}
				{@render cliCommandsBlock()}
			{/snippet}
		</HeroWithRightMedia>
	{:else}
		<HeroWithRightMedia {...sharedHeroProps}>
			{#snippet children()}
				{@render cliCommandsBlock()}
			{/snippet}
		</HeroWithRightMedia>
	{/if}
{:else if section.deviceMock}
	<HeroWithLeftMedia
		{...sharedHeroProps}
		imageSrc={undefined}
		mediaContainerClass="max-w-[320px]"
		mediaColumnClass="justify-center"
	>
		{#snippet leftMedia()}
			<PublicAgentFeatureMedia {section} />
		{/snippet}
		{#snippet children()}
			{@render cliCommandsBlock()}
		{/snippet}
	</HeroWithLeftMedia>
{:else if section.bentoId}
	<HeroWithLeftMedia {...sharedHeroProps} leftMedia={sectionBento}>
		{#snippet children()}
			{@render cliCommandsBlock()}
		{/snippet}
	</HeroWithLeftMedia>
{:else}
	<HeroWithLeftMedia {...sharedHeroProps}>
		{#snippet children()}
			{@render cliCommandsBlock()}
		{/snippet}
	</HeroWithLeftMedia>
{/if}
