<script lang="ts">
	import BannerCtaLink from '$lib/ui/templates/banners/BannerCtaLink.svelte';

	type Props = {
		title: string;
		description: string;
		ctaText: string;
		ctaHref: string;
		sectionClass?: string;
	};

	let { title, description, ctaText, ctaHref, sectionClass = 'py-8 sm:py-10' }: Props = $props();
</script>

<section class={sectionClass} aria-labelledby="accent-split-cta-banner-heading">
	<div
		class="flex flex-col items-start gap-6 rounded-2xl bg-primary px-6 py-8 text-primary-content sm:rounded-3xl sm:px-10 sm:py-10 md:flex-row md:items-center md:justify-between md:gap-10"
	>
		<div class="max-w-2xl space-y-2">
			<h2
				id="accent-split-cta-banner-heading"
				class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
			>
				{title}
			</h2>
			<p class="text-sm leading-relaxed text-primary-content/90 sm:text-base">{description}</p>
		</div>

		<BannerCtaLink {ctaText} {ctaHref} variant="accent" />
	</div>
</section>
