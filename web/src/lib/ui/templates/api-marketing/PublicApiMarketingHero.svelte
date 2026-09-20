<script lang="ts">
	import { page } from '$app/state';

	import type { PublicApiCapability } from '$lib/content/constants/apis/types';
	import { PUBLIC_LANDING_GETTING_STARTED_GUIDE_CTA } from '$lib/content/constants/publicLandingHeroCopy';
	import PublicApiMarketingHubBreadcrumb from '$lib/ui/templates/api-marketing/PublicApiMarketingHubBreadcrumb.svelte';
	import PublicLandingHeroTitle from '$lib/ui/templates/landing-page/PublicLandingHeroTitle.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	type Props = {
		capability: PublicApiCapability;
		platformLabel?: string | null;
		title: string;
		description: string;
		bullets?: readonly string[];
		payloadValidatorHref?: string | null;
	};

	let {
		capability,
		platformLabel = null,
		title,
		description,
		bullets = [],
		payloadValidatorHref = null
	}: Props = $props();

	const pricingHref = $derived(hostedMarketingHref('/pricing', page.url.origin));
	const docsHref = $derived(
		hostedMarketingHref('/docs/getting-started-for-public-api', page.url.origin)
	);
	const resolvedPayloadValidatorHref = $derived(
		payloadValidatorHref
			? hostedMarketingHref(payloadValidatorHref, page.url.origin)
			: null
	);

	const headingId = 'public-api-marketing-hero-heading';
</script>

<section class="py-10 md:py-16">
	<div class="container mx-auto max-w-3xl space-y-5 px-4 text-center">
		<div class="flex justify-center">
			<PublicApiMarketingHubBreadcrumb {capability} {platformLabel} />
		</div>
		<PublicLandingHeroTitle
			{title}
			{headingId}
		/>
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{description}
		</p>
		{#if bullets.length > 0}
			<ul
				class="mx-auto max-w-xl space-y-2 text-left text-sm font-medium text-base-content/80 sm:text-base"
				aria-label="API highlights"
			>
				{#each bullets as bullet (bullet)}
					<li class="flex items-start gap-2.5">
						<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
						<span>{bullet}</span>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
			<ButtonGlitchBrightness
				class={landingHeroTheme.ctaButtonClass}
				variant="primary"
				size="lg"
				href={pricingHref}
				preload="off"
			>
				Get Started For Free
			</ButtonGlitchBrightness>
			{#if resolvedPayloadValidatorHref}
				<ButtonGlitchBrightness
					class={landingHeroTheme.ctaButtonClass}
					variant="secondary"
					size="lg"
					href={resolvedPayloadValidatorHref}
					preload="off"
				>
					Try Payload Validator
				</ButtonGlitchBrightness>
			{/if}
			<ButtonGlitchBrightness
				class={landingHeroTheme.docsCtaButtonClass}
				variant="ghost"
				size="lg"
				href={docsHref}
				preload="off"
			>
				{PUBLIC_LANDING_GETTING_STARTED_GUIDE_CTA}
			</ButtonGlitchBrightness>
		</div>
	</div>
</section>
