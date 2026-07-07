<script lang="ts">
	import type { PublicMcpLandingPageViewModel } from '$lib/content/constants/publicMcpConfig';

	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		mcpVm: PublicMcpLandingPageViewModel;
		ctaText: string;
		ctaHref: string;
		docsCtaText?: string;
		docsCtaHref?: string;
	};

	let { mcpVm, ctaText, ctaHref, docsCtaText, docsCtaHref }: Props = $props();

	const showDocsCta = $derived(Boolean(docsCtaText?.trim() && docsCtaHref?.trim()));

	const headingId = 'public-mcp-hero-heading';

	const titleSegments = $derived(landingHeroTheme.parseLandingHeroTitlePartSegments(mcpVm.heroTitle));

	const heroIconBoxClass =
		'flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-base-100/10 shadow-lg backdrop-blur-sm';
</script>

<AuroraBackground class="relative isolate overflow-hidden">
	<div class="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
		<div class="mx-auto flex max-w-3xl flex-col items-center text-center">
			<div class="mb-6 flex items-center justify-center gap-3" aria-hidden="true">
				<div class={heroIconBoxClass}>
					<AbstractIcon name={mcpVm.icon} width="36" height="36" class="size-9" focusable="false" />
				</div>
				{#if mcpVm.heroSecondaryIcon}
					<span class="text-lg font-medium text-base-content/40" aria-hidden="true">+</span>
					<div class={heroIconBoxClass}>
						<AbstractIcon
							name={mcpVm.heroSecondaryIcon}
							width="36"
							height="36"
							class="size-9"
							focusable="false"
						/>
					</div>
				{/if}
			</div>

			<p class="text-xs font-bold tracking-[0.2em] text-primary uppercase sm:text-sm">MCP</p>

			<p class="mt-2 text-xs font-bold tracking-[0.2em] text-base-content/60 uppercase sm:text-sm">
				{mcpVm.agentLabel}
			</p>

			<h1
				id={headingId}
				class="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl"
			>
				{#each titleSegments as seg, segmentIndex (segmentIndex)}
					{#if seg.highlight}
						<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
					{:else}
						<span class={landingHeroTheme.titleSegmentClass(segmentIndex, titleSegments)}
							>{seg.text}</span
						>
					{/if}
				{/each}
			</h1>

			<p class="mt-6 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
				{mcpVm.heroDescription}
			</p>

			<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
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
			</div>
		</div>
	</div>
</AuroraBackground>
