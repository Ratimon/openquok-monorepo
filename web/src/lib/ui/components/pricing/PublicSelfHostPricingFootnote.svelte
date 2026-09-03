<script lang="ts">
	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG } from '$lib/content/constants/publicSelfHostPricingFootnoteConfig';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const linkClass =
		'font-medium text-base-content/75 underline decoration-base-content/25 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary/40';

	const footnoteLinks = $derived(
		PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.links.map((link) => ({
			...link,
			attrs: hostedMarketingAnchorAttrs(link.href, page.url.origin)
		}))
	);
</script>

<div class="bg-base-100 px-6 pb-16 sm:pb-20">
	<div class="mx-auto max-w-7xl">
		<div
			class="rounded-2xl border border-base-content/10 bg-base-200/50 px-6 py-5 sm:px-8 sm:py-6"
		>
			<div class="flex flex-col gap-3 sm:gap-4">
				<div class="flex items-center gap-2.5">
					<AbstractIcon
						name={icons.Lock.name}
						class="size-5 shrink-0 text-base-content/60 sm:size-6"
						width="24"
						height="24"
						aria-hidden="true"
					/>
					<p class="text-base font-semibold text-base-content sm:text-lg">
						{PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.headline}
					</p>
				</div>
				<p class="text-sm leading-relaxed text-base-content/65 sm:text-base">
					{PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG.body}
				</p>
				<p class="text-sm text-base-content/65 sm:text-base">
					{#each footnoteLinks as link, index (link.id)}
						{#if index > 0}
							<span aria-hidden="true"> · </span>
						{/if}
						<a
							href={link.attrs.href}
							target={link.attrs.target}
							rel={link.attrs.rel}
							class={linkClass}
						>
							{link.label}
						</a>
					{/each}
				</p>
			</div>
		</div>
	</div>
</div>
