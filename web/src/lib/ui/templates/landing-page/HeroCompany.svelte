<script lang="ts">
	import { url } from '$lib/utils/path';

	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';

	type LandingHeroTheme = {
		subtitleClass: string;
		descriptionClass: string;
		ctaButtonClass: string;
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		companyNameVm: string;
		companyUrlVm?: string;
		landingSubtitle: string;
		landingDescription: string;
		aboutHref?: string;
	};

	let {
		heroTheme,
		companyNameVm,
		companyUrlVm = '',
		landingSubtitle,
		landingDescription,
		aboutHref = '/about'
	}: Props = $props();

	const headingId = 'landing-company-heading';
</script>

<section
	id="company"
	class="border-t border-base-300 bg-base-200/80"
	aria-labelledby={headingId}
>
	<div class="container mx-auto px-4 py-16 sm:py-20">
		<div class="mx-auto flex max-w-3xl flex-col items-center text-center">
			<img
				class="h-20 w-20 sm:h-24 sm:w-24"
				src={url('/pwa/favicon.svg')}
				alt="{companyNameVm} logo"
				width={96}
				height={96}
			/>

			{#if landingSubtitle}
				<p class="{heroTheme.subtitleClass} mt-8">
					{landingSubtitle}
				</p>
			{/if}

			<h2 id={headingId} class="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl">
				{companyNameVm}
			</h2>

			<p class="{heroTheme.descriptionClass} mt-4 max-w-2xl text-pretty">
				{landingDescription}
			</p>

			{#if companyUrlVm}
				<p class="mt-3 text-sm text-base-content/70">
					Website:
					<a href={companyUrlVm} class="link link-hover text-base-content/90">{companyUrlVm}</a>
				</p>
			{/if}

			<div class="mt-8">
				<ButtonGlitchBrightness
					class="{heroTheme.ctaButtonClass} rounded-full px-8"
					variant="primary"
					size="lg"
					href={aboutHref}
					preload="hover"
				>
					About our company
				</ButtonGlitchBrightness>
			</div>
		</div>
	</div>
</section>
