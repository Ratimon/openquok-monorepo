<script lang="ts">
	import {
		DOCS_PAGE_CTA_BANNER_DESCRIPTION,
		DOCS_PAGE_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import BannerCtaLink from '$lib/ui/templates/banners/BannerCtaLink.svelte';

	type Props = {
		title?: string;
		description?: string;
		ctaText?: string;
		ctaHref?: string;
	};

	let {
		title = DOCS_PAGE_CTA_BANNER_TITLE,
		description = DOCS_PAGE_CTA_BANNER_DESCRIPTION,
		ctaText = PUBLIC_BANNER_CTA_TEXT,
		ctaHref = route(getRootPathSignup())
	}: Props = $props();
</script>

<section class="mt-6" aria-labelledby="docs-page-cta-banner-heading">
	<div
		class="flex flex-col items-start gap-4 rounded-xl bg-primary px-4 py-4 text-primary-content sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4"
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
</section>
