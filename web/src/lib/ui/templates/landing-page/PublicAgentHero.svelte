<script lang="ts">
	import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';

	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import SkillInstallCommandTabs from '$lib/ui/templates/landing-page/SkillInstallCommandTabs.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		titleSegmentClass: (segmentIndex: number, segments: LandingHeroTitleSegment[]) => string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
	};

	type Props = {
		agentVm: PublicAgentHostLandingPageViewModel;
		heroTheme: LandingHeroTheme;
		ctaText: string;
		ctaHref: string;
		docsCtaText?: string;
		docsCtaHref?: string;
	};

	let { agentVm, heroTheme, ctaText, ctaHref, docsCtaText, docsCtaHref }: Props = $props();

	const showDocsCta = $derived(Boolean(docsCtaText?.trim() && docsCtaHref?.trim()));

	const headingId = 'public-agent-hero-heading';
	const installHeadingId = 'public-agent-hero-install-heading';

	const titleSegments = $derived(heroTheme.parseLandingHeroTitlePartSegments(agentVm.heroTitle));
</script>

<AuroraBackground class="relative isolate overflow-hidden">
	<div class="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
		<div class="mx-auto flex max-w-3xl flex-col items-center text-center">
			<div
				class="mb-6 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-base-100/10 shadow-lg backdrop-blur-sm"
				aria-hidden="true"
			>
				<AbstractIcon name={agentVm.icon} width="36" height="36" class="size-9" focusable="false" />
			</div>

			<p class="text-xs font-bold tracking-[0.2em] text-primary uppercase sm:text-sm">
				{agentVm.agentLabel}
			</p>

			<h1
				id={headingId}
				class="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl"
			>
				{#each titleSegments as seg, segmentIndex (segmentIndex)}
					{#if seg.highlight}
						<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
					{:else}
						<span class={heroTheme.titleSegmentClass(segmentIndex, titleSegments)}>{seg.text}</span>
					{/if}
				{/each}
			</h1>

			<p class="mt-6 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
				{agentVm.heroDescription}
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

			<section class="mt-8 w-full max-w-2xl space-y-3" aria-labelledby={installHeadingId}>
				<h2
					id={installHeadingId}
					class="text-center text-sm font-semibold tracking-tight text-base-content/75 sm:text-base"
				>
					Install our core skill:
				</h2>
				<SkillInstallCommandTabs options={agentVm.skillInstallOptions} />
			</section>
		</div>
	</div>
</AuroraBackground>
