<script lang="ts">
	import type { IconName } from '$data/icons';

	import { icons } from '$data/icons';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	type HeroTitleSegment = { text: string; style: 'plain' | 'sticker' | 'underline' };

	type Props = {
		eyebrow: string;
		titleSegments: HeroTitleSegment[];
		description: string;
		listingIcon: IconName;
		logoImageUrl?: string | null;
		listingTitle: string;
		ctaText: string;
		ctaHref: string;
		docsCtaText?: string;
		docsCtaHref?: string;
		installHeading?: string;
		installCommand?: string | null;
		variant?: 'page' | 'inline';
	};

	let {
		eyebrow,
		titleSegments,
		description,
		listingIcon,
		logoImageUrl = null,
		listingTitle,
		ctaText,
		ctaHref,
		docsCtaText,
		docsCtaHref,
		installHeading = 'Install:',
		installCommand = null,
		variant = 'inline'
	}: Props = $props();

	const isPage = $derived(variant === 'page');
	const showDocsCta = $derived(Boolean(docsCtaText?.trim() && docsCtaHref?.trim()));
	const trimmedInstallCommand = $derived(installCommand?.trim() ?? '');
	const showInstall = $derived(isPage && trimmedInstallCommand.length > 0);
	const showListingLogo = $derived(Boolean(logoImageUrl?.trim()));

	/** Map sticker → highlight so `titleSegmentClass` gradient counting stays correct. */
	const highlightMappedSegments = $derived(
		titleSegments.map((seg) => ({ text: seg.text, highlight: seg.style === 'sticker' }))
	);

	const headingId = 'public-creator-listing-hero-heading';
	const installHeadingId = 'public-creator-listing-hero-install-heading';

	const heroIconBoxClass = $derived(
		isPage
			? 'flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-base-100/10 shadow-lg backdrop-blur-sm'
			: 'flex size-12 items-center justify-center rounded-xl border border-base-content/10 bg-base-100/40 shadow-sm'
	);
	const heroIconSize = $derived(isPage ? '36' : '28');
	const heroIconClass = $derived(isPage ? 'size-9' : 'size-7');
	const headingClass = $derived(
		isPage
			? 'mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl'
			: 'mt-4 text-2xl font-black tracking-tight text-balance sm:text-3xl'
	);
</script>

{#snippet titleSegmentsMarkup()}
	{#each titleSegments as seg, segmentIndex (segmentIndex)}
		{#if seg.style === 'sticker'}
			<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
		{:else if seg.style === 'underline'}
			<span
				class="underline decoration-2 underline-offset-[0.2em] decoration-primary text-base-content"
			>
				{seg.text}
			</span>
		{:else}
			<span class={landingHeroTheme.titleSegmentClass(segmentIndex, highlightMappedSegments)}
				>{seg.text}</span
			>
		{/if}
	{/each}
{/snippet}

{#snippet heroInner()}
	<div class="mx-auto flex max-w-3xl flex-col items-center text-center">
		<div class="mb-6 flex items-center justify-center gap-3" aria-hidden="true">
			<div class={heroIconBoxClass}>
				{#if showListingLogo}
					<img
						src={logoImageUrl}
						alt=""
						width={heroIconSize}
						height={heroIconSize}
						class="{heroIconClass} rounded-lg object-cover"
					/>
				{:else}
					<AbstractIcon
						name={listingIcon}
						width={heroIconSize}
						height={heroIconSize}
						class={heroIconClass}
						focusable="false"
					/>
				{/if}
			</div>
			<span class="text-lg font-medium text-base-content/40" aria-hidden="true">+</span>
			<div class={heroIconBoxClass}>
				<AbstractIcon
					name={icons.OpenQuok.name}
					width={heroIconSize}
					height={heroIconSize}
					class={heroIconClass}
					focusable="false"
				/>
			</div>
		</div>

		<p class="text-xs font-bold tracking-[0.2em] text-primary uppercase sm:text-sm">
			{eyebrow}
		</p>

		{#if isPage}
			<h1 id={headingId} class={headingClass}>
				{@render titleSegmentsMarkup()}
			</h1>
		{:else}
			<h2 id={headingId} class={headingClass}>
				{@render titleSegmentsMarkup()}
			</h2>
		{/if}

		<p class="mt-6 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{description}
		</p>

		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			{#if isPage}
				{#if showDocsCta}
					<ButtonGlitchBrightness
						class="my-2 w-full max-w-xs justify-center rounded-full border-white/40 bg-transparent px-10 text-sm text-white shadow-none hover:bg-white/10 sm:w-auto sm:text-base"
						variant="ghost"
						size="lg"
						href={docsCtaHref}
						preload="off"
					>
						{docsCtaText}
					</ButtonGlitchBrightness>
				{/if}
				<ButtonGlitchBrightness
					class="my-2 w-full max-w-xs justify-center rounded-full px-10 text-sm sm:w-auto sm:text-base"
					variant="primary"
					size="lg"
					href={ctaHref}
					preload="off"
				>
					{ctaText}
				</ButtonGlitchBrightness>
			{:else}
				{#if showDocsCta}
					<Button
						class="my-2 w-full max-w-xs justify-center sm:w-auto"
						variant="outline"
						size="lg"
						href={docsCtaHref}
						preload="off"
					>
						{docsCtaText}
					</Button>
				{/if}
				<Button
					class="my-2 w-full max-w-xs justify-center sm:w-auto"
					variant="primary"
					size="lg"
					href={ctaHref}
					preload="off"
				>
					{ctaText}
				</Button>
			{/if}
		</div>

		{#if showInstall}
			<section class="mt-8 w-full max-w-2xl space-y-3" aria-labelledby={installHeadingId}>
				<h2
					id={installHeadingId}
					class="text-center text-sm font-semibold tracking-tight text-base-content/75 sm:text-base"
				>
					{installHeading}
				</h2>
				<TerminalCommandMock
					code={trimmedInstallCommand}
					ariaLabel={`Install command for ${listingTitle}`}
					class="[&>div]:text-sm sm:[&>div]:text-base"
				/>
			</section>
		{/if}
	</div>
{/snippet}

{#if isPage}
	<AuroraBackground class="relative isolate overflow-hidden">
		<div class="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
			{@render heroInner()}
		</div>
	</AuroraBackground>
{:else}
	<div
		class="rounded-2xl border border-base-content/10 bg-base-200/30 px-4 py-8 sm:px-6"
	>
		{@render heroInner()}
	</div>
{/if}
