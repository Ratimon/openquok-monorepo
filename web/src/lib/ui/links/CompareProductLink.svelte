<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	import type { CompareProductSlug } from '$lib/content/constants/competitors/types';
	import { getCompareProductWebsiteUrl } from '$lib/content/constants/competitors/index';
	import { resolveExternalLinkPolicy } from '$lib/utils/externalLinkRel';

	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';

	type Props = HTMLAnchorAttributes & {
		slug: CompareProductSlug;
		ariaLabel?: string;
		children: Snippet;
	};

	let {
		slug,
		ariaLabel,
		children,
		class: className,
		...rest
	}: Props = $props();

	const websiteUrl = $derived(getCompareProductWebsiteUrl(slug));
	const policy = $derived(resolveExternalLinkPolicy(websiteUrl));
</script>

<ExternalLink
	href={websiteUrl}
	trusted={policy.trusted}
	follow={policy.follow}
	{ariaLabel}
	class={className}
	{...rest}
>
	{@render children?.()}
</ExternalLink>
