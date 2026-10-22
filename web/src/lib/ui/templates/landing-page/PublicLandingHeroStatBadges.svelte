<script lang="ts">
	import { page } from '$app/state';

	import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
	import {
		createPublicHeroStatBadgesSEOSchema,
		PUBLIC_LANDING_HERO_STAT_BADGES_SECTION_ID
	} from '$lib/content/utils/createPublicHeroStatBadgesSEOSchema';
	import { createJsonLdWithContext } from '$lib/seo/jsonLdSchema';
	import { jsonLdScriptHtml } from '$lib/seo/jsonLdScriptHtml';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		badges: readonly PublicLandingHeroStatBadge[];
		ariaLabel?: string;
		class?: string;
	};

	let { badges, ariaLabel = 'Product highlights', class: className = '' }: Props = $props();

	const schemaDocument = $derived.by(() => {
		const node = createPublicHeroStatBadgesSEOSchema({
			pageUrl: page.url.href,
			pageOrigin: page.url.origin,
			sectionName: ariaLabel,
			badges
		});
		if (node == null) {
			return null;
		}
		return createJsonLdWithContext(node);
	});

	const gridColsClass = $derived(
		badges.length <= 2
			? 'sm:grid-cols-2'
			: badges.length === 3
				? 'sm:grid-cols-2 lg:grid-cols-3'
				: 'sm:grid-cols-2 lg:grid-cols-4'
	);

	const cardClass =
		'rounded-2xl border border-base-content/10 bg-base-100 px-5 py-6 text-center transition-colors';
</script>

<svelte:head>
	{#if schemaDocument}
		{@html jsonLdScriptHtml(schemaDocument)}
	{/if}
</svelte:head>

{#if badges.length > 0}
	<section
		id={PUBLIC_LANDING_HERO_STAT_BADGES_SECTION_ID}
		class={cn('border-t border-base-content/10 bg-base-200/30 py-12 sm:py-14', className)}
		aria-label={ariaLabel}
	>
		<div class="container mx-auto max-w-6xl px-4">
			<ul class={cn('grid gap-6', gridColsClass)}>
				{#each badges as badge (badge.id)}
					<li>
						{#if badge.href}
							<a
								href={badge.href}
								class="{cardClass} block hover:border-primary/35 hover:bg-base-100/90"
							>
								<p class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
									{badge.value}
								</p>
								<p class="mt-2 text-sm font-medium text-base-content/65">{badge.label}</p>
							</a>
						{:else}
							<div class={cardClass}>
								<p class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
									{badge.value}
								</p>
								<p class="mt-2 text-sm font-medium text-base-content/65">{badge.label}</p>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}
