<script lang="ts">
	import type { PublicMcpLandingPageViewModel } from '$lib/content/constants/mcps';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import PublicAgentsLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicAgentsLandingBreadcrumb.svelte';
	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		mcpVm: PublicMcpLandingPageViewModel;
		ctaText: string;
		ctaHref: string;
		docsCtaText?: string;
		docsCtaHref?: string;
		channelLabel?: string | null;
	};

	let {
		mcpVm,
		ctaText,
		ctaHref,
		docsCtaText,
		docsCtaHref,
		channelLabel = null
	}: Props = $props();

	const showDocsCta = $derived(Boolean(docsCtaText?.trim() && docsCtaHref?.trim()));

	const headingId = 'public-mcp-hero-heading';

	const heroIconBoxClass =
		'flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-base-100/10 shadow-lg backdrop-blur-sm';
</script>

<AuroraBackground class="relative isolate overflow-x-clip">
	<div class="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
		<div class="mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center text-center">
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

			<div class="mb-6 flex w-full min-w-0 justify-center">
				<PublicAgentsLandingBreadcrumb
					variant="mcp-client"
					agentSlug={mcpVm.slug}
					agentLabel={mcpVm.agentLabel}
					{channelLabel}
				/>
			</div>

			<PublicHeroTitle
				title={mcpVm.heroTitle}
				{headingId}
				class="mt-4 text-3xl sm:text-4xl lg:text-5xl"
			/>

			<p
				class="mt-6 w-full max-w-full break-words text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg"
			>
				{mcpVm.heroDescription}
			</p>

			<div class="{landingHeroTheme.dualCtaRowClass} lg:justify-center">
				{#if showDocsCta}
					<ButtonGlitchBrightness
						class="{landingHeroTheme.docsCtaButtonClass} rounded-full border-white/40 bg-transparent text-white shadow-none hover:bg-white/10"
						variant="ghost"
						size="lg"
						href={docsCtaHref}
						preload="off"
					>
						{docsCtaText}
					</ButtonGlitchBrightness>
				{/if}
				<ButtonGlitchBrightness
					class="{landingHeroTheme.ctaButtonClass} rounded-full"
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
