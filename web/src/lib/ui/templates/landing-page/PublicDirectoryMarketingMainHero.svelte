<script lang="ts">
	import type { IconName } from '$data/icons';

	import type { PublicChannelKind } from '$lib/content/constants/channels/catalog/types';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import BentoLandingDirectoryAnalyticsPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryAnalyticsPreview.svelte';
	import PublicChannelsLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicChannelsLandingBreadcrumb.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		subtitle?: string;
		title: string;
		description: string;
		/** Branded mark above the hero title (directory channel landings). */
		iconName?: IconName;
		platformLabel?: string;
		channelKind?: PublicChannelKind;
		primaryCtaLabel: string;
		primaryCtaHref: string;
		secondaryCtaLabel?: string;
		secondaryCtaHref?: string;
		tertiaryCtaLabel?: string;
		tertiaryCtaHref?: string;
		bullets?: readonly string[];
		bgColorClass?: string;
	};

	let {
		subtitle = '',
		title,
		description,
		iconName,
		platformLabel,
		channelKind = 'directory',
		primaryCtaLabel,
		primaryCtaHref,
		secondaryCtaLabel,
		secondaryCtaHref,
		tertiaryCtaLabel,
		tertiaryCtaHref,
		bullets = [],
		bgColorClass = 'bg-base-100'
	}: Props = $props();

	const showDualCta = $derived(Boolean(secondaryCtaLabel?.trim() && secondaryCtaHref?.trim()));
	const showTertiaryCta = $derived(Boolean(tertiaryCtaLabel?.trim() && tertiaryCtaHref?.trim()));
	const heroSubtitle = $derived(subtitle.trim());

	const showChannelHeroHeader = $derived(Boolean(iconName && platformLabel?.trim()));
</script>

{#snippet directoryChannelHeaderAboveGrid()}
	{#if iconName}
		<div
			class="flex size-16 items-center justify-center rounded-2xl border border-base-content/10 bg-base-100 shadow-lg"
			aria-hidden="true"
		>
			<AbstractIcon name={iconName} width="36" height="36" class="size-9" focusable="false" />
		</div>
	{/if}
	{#if platformLabel}
		<div class="flex w-full min-w-0 justify-center">
			<PublicChannelsLandingBreadcrumb {platformLabel} {channelKind} />
		</div>
	{/if}
{/snippet}

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	headerAboveGrid={showChannelHeroHeader ? directoryChannelHeaderAboveGrid : undefined}
	landingSubtitle={heroSubtitle}
	landingTitle={title}
	landingTitleScale="main"
	landingTitleCommaSeparated={false}
	landingDescription={description}
	primaryCtaText={primaryCtaLabel}
	primaryCtaHref={primaryCtaHref}
	secondaryCtaText={showDualCta ? secondaryCtaLabel : undefined}
	secondaryCtaHref={showDualCta ? secondaryCtaHref : undefined}
	tertiaryCtaText={showTertiaryCta ? tertiaryCtaLabel : undefined}
	tertiaryCtaHref={showTertiaryCta ? tertiaryCtaHref : undefined}
	showCta={true}
	{bgColorClass}
	mediaContainerClass="max-w-xl"
>
	{#snippet rightMedia()}
		<div
			class="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-lg shadow-base-content/5"
		>
			<BentoLandingDirectoryAnalyticsPreview />
		</div>
	{/snippet}

	{#snippet children()}
		{#if bullets.length > 0}
			<ul
				class="mx-auto max-w-xl space-y-2 text-left text-sm font-medium text-base-content/80 lg:mx-0 sm:text-base"
				aria-label="Highlights"
			>
				{#each bullets as bullet (bullet)}
					<li class="flex items-start gap-2.5">
						<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
						<span>{bullet}</span>
					</li>
				{/each}
			</ul>
		{/if}
	{/snippet}
</HeroWithRightMedia>
