<script lang="ts">
	import type { Snippet } from 'svelte';

	import { getRootPathAccount } from '$lib/area-protected';
	import { absoluteUrl } from '$lib/utils/path';
	import { cn } from '$lib/ui/helpers/common';
	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';

	type Props = {
		title: string;
		/** Current breadcrumb segment (Title Case). Defaults to `title`. */
		currentPageLabel?: string;
		/** When true, breadcrumb is Home → current page. Use false on `/account` home. */
		linkHome?: boolean;
		headingId?: string;
		/** `page` = in-content hero; `header` = compact row in protected top bar. */
		variant?: 'page' | 'header';
		class?: string;
		description?: Snippet;
		/** Plain-text subtitle (used with `variant="header"` from the header presenter). */
		descriptionText?: string | null;
	};

	let {
		title,
		currentPageLabel = title,
		linkHome = true,
		headingId,
		variant = 'page',
		class: className = '',
		description,
		descriptionText = null
	}: Props = $props();

	const isHeaderVariant = $derived(variant === 'header');

	// /account
	const accountHomeHref = absoluteUrl(getRootPathAccount());

	const breadcrumbItems = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		if (!linkHome) {
			return [{ label: currentPageLabel }];
		}
		return [
			{ label: 'My Dashboard', href: accountHomeHref },
			{ label: currentPageLabel }
		];
	});
</script>

<header
	class={cn(
		isHeaderVariant ? 'min-w-0 space-y-0.5 py-0.5' : 'space-y-3',
		className
	)}
>
	<PublicLandingHubBreadcrumb items={breadcrumbItems} />
	<PublicHeroTitle
		{title}
		{headingId}
		class={isHeaderVariant ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}
	/>
	{#if descriptionText}
		<p class="line-clamp-2 text-sm text-base-content/70">{descriptionText}</p>
	{:else if description}
		<div class="text-base-content/70 space-y-1 text-sm">
			{@render description()}
		</div>
	{/if}
</header>
