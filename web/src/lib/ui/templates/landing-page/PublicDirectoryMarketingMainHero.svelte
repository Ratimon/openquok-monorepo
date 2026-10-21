<script lang="ts">
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import BentoLandingDirectoryAnalyticsPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryAnalyticsPreview.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		subtitle?: string;
		title: string;
		description: string;
		primaryCtaLabel: string;
		primaryCtaHref: string;
		secondaryCtaLabel?: string;
		secondaryCtaHref?: string;
		bullets?: readonly string[];
		bgColorClass?: string;
	};

	let {
		subtitle = '',
		title,
		description,
		primaryCtaLabel,
		primaryCtaHref,
		secondaryCtaLabel,
		secondaryCtaHref,
		bullets = [],
		bgColorClass = 'bg-base-100'
	}: Props = $props();

	const showDualCta = $derived(Boolean(secondaryCtaLabel?.trim() && secondaryCtaHref?.trim()));
	const heroSubtitle = $derived(subtitle.trim());
</script>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={heroSubtitle}
	landingTitle={title}
	landingTitleScale="main"
	landingTitleCommaSeparated={false}
	landingDescription={description}
	primaryCtaText={primaryCtaLabel}
	primaryCtaHref={primaryCtaHref}
	secondaryCtaText={showDualCta ? secondaryCtaLabel : undefined}
	secondaryCtaHref={showDualCta ? secondaryCtaHref : undefined}
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
