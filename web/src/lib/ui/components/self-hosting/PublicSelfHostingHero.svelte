<script lang="ts">
	import type {
		PublicSelfHostingCta,
		PublicSelfHostingTrustBadge
	} from '$lib/content/constants/publicSelfHostingLandingConfig';

	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		subtitle: string;
		title: string;
		description: string;
		primaryCta: PublicSelfHostingCta;
		secondaryCta: PublicSelfHostingCta;
		trustBadges: readonly PublicSelfHostingTrustBadge[];
	};

	let { subtitle, title, description, primaryCta, secondaryCta, trustBadges }: Props = $props();

	const headingId = 'public-self-hosting-hero-heading';

	const titleParts = $derived(
		title
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);
</script>

<AuroraBackground class="relative isolate !min-h-0 overflow-hidden">
	<header class="relative z-10 container mx-auto max-w-4xl space-y-6 px-4 py-10 text-center md:py-14">
		<p class={landingHeroTheme.subtitleClass}>{subtitle}</p>

		<h1
			id={headingId}
			class="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl"
		>
			{#each titleParts as part, index (index)}
				{@const partClass = landingHeroTheme.titlePartClass(index, titleParts.length)}
				{@const segments = landingHeroTheme.parseLandingHeroTitlePartSegments(part)}
				{@const layoutClass =
					titleParts.length >= 3 ? 'block' : index > 0 ? 'block sm:inline' : ''}
				{#if landingHeroTheme.landingHeroTitlePartHasHighlight(segments)}
					<span class={layoutClass}>
						{#each segments as seg, segmentIndex (segmentIndex)}
							{#if seg.highlight}
								<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
							{:else}
								<span class={partClass}>{seg.text}</span>
							{/if}
						{/each}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
					</span>
				{:else}
					<span class="{partClass} {layoutClass}">
						{part}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
					</span>
				{/if}
			{/each}
		</h1>

		<p class={landingHeroTheme.descriptionClass}>
			{description}
		</p>

		<div class="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
			<ButtonGlitchBrightness
				class="w-full max-w-sm justify-center rounded-full px-8 sm:w-auto"
				variant="primary"
				size="lg"
				href={primaryCta.href}
				preload="off"
			>
				{primaryCta.label}
			</ButtonGlitchBrightness>
			<ExternalLink
				href={secondaryCta.href}
				trusted
				follow
				class="inline-flex w-full max-w-sm items-center justify-center rounded-full border border-base-content/15 bg-base-100 px-8 py-3 text-sm font-semibold text-base-content transition-colors hover:border-primary/35 hover:bg-base-200 sm:w-auto"
			>
				{secondaryCta.label}
			</ExternalLink>
		</div>

		<div class="mx-auto grid max-w-3xl grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
			{#each trustBadges as badge (badge.id)}
				<article
					class="rounded-2xl border border-base-content/10 bg-base-200/40 p-5 text-left shadow-sm"
				>
					<div class="flex items-start gap-3">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20"
						>
							<AbstractIcon
								name={badge.iconName}
								width="20"
								height="20"
								class="size-5"
								focusable="false"
							/>
						</div>
						<div class="min-w-0 space-y-1">
							{#if badge.href}
								<ExternalLink
									href={badge.href}
									trusted
									follow
									class="text-sm font-semibold text-base-content underline-offset-2 hover:underline"
								>
									{badge.label}
								</ExternalLink>
							{:else}
								<p class="text-sm font-semibold text-base-content">{badge.label}</p>
							{/if}
							<p class="text-sm leading-relaxed text-base-content/65">{badge.description}</p>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</header>
</AuroraBackground>
