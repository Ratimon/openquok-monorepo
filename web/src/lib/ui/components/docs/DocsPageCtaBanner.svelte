<script lang="ts">
	import {
		DOCS_PAGE_CTA_BANNER_DESCRIPTION,
		DOCS_PAGE_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import { CENTERED_DARK_CTA_BANNER_PATH_TEXT } from '$lib/ui/templates/banners/centeredDarkCtaBannerCopy';
	import BannerCtaLink from '$lib/ui/templates/banners/BannerCtaLink.svelte';
	import AnimatedPathText from '$lib/ui/texts/AnimatedPathText.svelte';

	type Props = {
		title?: string;
		description?: string;
		pathText?: string;
		ctaText?: string;
		ctaHref?: string;
	};

	let {
		title = DOCS_PAGE_CTA_BANNER_TITLE,
		description = DOCS_PAGE_CTA_BANNER_DESCRIPTION,
		pathText = CENTERED_DARK_CTA_BANNER_PATH_TEXT,
		ctaText = PUBLIC_BANNER_CTA_TEXT,
		ctaHref = route(getRootPathSignup())
	}: Props = $props();

	const bannerPath =
		'M 28,8 L 972,8 A 12,12 0 0,1 984,20 L 984,68 A 12,12 0 0,1 972,80 L 28,80 A 12,12 0 0,1 16,68 L 16,20 A 12,12 0 0,1 28,8';
</script>

<section class="mt-6" aria-labelledby="docs-page-cta-banner-heading">
	<div
		class="relative overflow-hidden rounded-xl bg-primary px-4 py-4 text-primary-content sm:px-5 sm:py-4"
	>
		<AnimatedPathText
			path={bannerPath}
			svgClass="pointer-events-none absolute inset-0 size-full text-primary-content/40"
			viewBox="0 0 1000 88"
			text={pathText}
			textClass="text-[7px] font-medium uppercase tracking-[0.2em] sm:text-[8px]"
			preserveAspectRatio="none"
			duration={24}
			textAnchor="start"
			aria-hidden="true"
		/>

		<div
			class="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
		>
			<div class="min-w-0 space-y-1">
				<h2 id="docs-page-cta-banner-heading" class="text-base font-semibold sm:text-lg">
					{title}
				</h2>
				<p class="text-sm leading-relaxed text-primary-content/90">{description}</p>
			</div>

			<BannerCtaLink
				{ctaText}
				{ctaHref}
				variant="accent"
				class="w-full justify-center px-5 py-2.5 text-sm sm:w-auto sm:px-6 sm:py-3"
			/>
		</div>
	</div>
</section>
