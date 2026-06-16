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

<section class={sectionClass} aria-labelledby="centered-dark-cta-banner-heading">
	<div
		class="flex flex-col items-center rounded-2xl bg-neutral px-6 py-12 text-center text-neutral-content sm:rounded-3xl sm:px-10 sm:py-16"
	>
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
			<BannerCtaLink {ctaText} {ctaHref} variant="inverted" />
		</div>
	</div>
</section>
