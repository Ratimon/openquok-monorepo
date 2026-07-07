<script lang="ts">
	import { CENTERED_DARK_CTA_BANNER_PATH_TEXT } from '$lib/ui/templates/banners/centeredDarkCtaBannerCopy';

	import BannerCtaLink from '$lib/ui/templates/banners/BannerCtaLink.svelte';
	import AnimatedPathText from '$lib/ui/texts/AnimatedPathText.svelte';

	type Props = {
		title: string;
		description: string;
		ctaText: string;
		ctaHref: string;
		pathText?: string;
		sectionClass?: string;
	};

	let {
		title,
		description,
		ctaText,
		ctaHref,
		pathText = CENTERED_DARK_CTA_BANNER_PATH_TEXT,
		sectionClass = 'py-8 sm:py-10'
	}: Props = $props();

	const bannerPath =
		'M 28,12 L 972,12 A 16,16 0 0,1 988,28 L 988,212 A 16,16 0 0,1 972,228 L 28,228 A 16,16 0 0,1 12,212 L 12,28 A 16,16 0 0,1 28,12';
</script>

<section class={sectionClass} aria-labelledby="centered-dark-cta-banner-heading">
	<div
		class="relative overflow-hidden rounded-2xl bg-neutral px-6 py-12 text-center text-neutral-content sm:rounded-3xl sm:px-10 sm:py-16"
	>
		<AnimatedPathText
			path={bannerPath}
			svgClass="pointer-events-none absolute inset-0 size-full text-neutral-content/45"
			viewBox="0 0 1000 240"
			text={pathText}
			textClass="text-[9px] font-medium uppercase tracking-[0.22em] sm:text-[10px]"
			preserveAspectRatio="none"
			duration={28}
			textAnchor="start"
			aria-hidden="true"
		/>

		<div class="relative z-10 flex flex-col items-center">
			<h2
				id="centered-dark-cta-banner-heading"
				class="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl"
			>
				{title}
			</h2>

			<p class="mt-4 max-w-xl text-sm leading-relaxed text-neutral-content/85 sm:text-base">
				{description}
			</p>

			<div class="mt-8">
				<BannerCtaLink
					{ctaText}
					{ctaHref}
					variant="inverted"
				/>
			</div>
		</div>
	</div>
</section>
