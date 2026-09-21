<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { page } from '$app/state';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';

	type Props = HTMLAnchorAttributes & {
		href: string;
		ariaLabel?: string;
		preload?: 'hover' | 'tap' | 'off' | 'intent';
		children: Snippet;
	};

	let {
		href,
		ariaLabel,
		preload = 'tap',
		children,
		class: className,
		...rest
	}: Props = $props();

	const marketing = $derived(hostedMarketingAnchorAttrs(href, page.url.origin));
</script>

<a
	href={marketing.href}
	target={marketing.target}
	rel={marketing.rel}
	data-sveltekit-preload-data={marketing.external ? 'off' : preload}
	aria-label={ariaLabel}
	class={className}
	{...rest}
>
	{@render children?.()}
</a>
