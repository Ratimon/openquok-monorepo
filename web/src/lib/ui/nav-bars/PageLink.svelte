<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';
	import { route, isParentRoute, isSameRoute } from '$lib/utils/path';

	type Props = {
		children: Snippet;
		href: string;
		class?: string;
		whenSelected?: string;
		whenUnselected?: string;
		preload?: 'hover' | 'tap' | 'off' | 'intent';
		/** When true, navigate via goto() on click so navigation works reliably (e.g. from auth pages). */
		useGoto?: boolean;
		/** When true with useGoto, use a full page load (breaks client redirect loops). */
		hardNavigate?: boolean;
		/** Called after programmatic navigation when useGoto is true (e.g. close mobile menu). */
		onAfterNavigate?: () => void;
	};

	let {
		children,
		href = '',
		class: className = '',
		whenSelected = '',
		whenUnselected = '',
		preload,
		useGoto = false,
		hardNavigate = false,
		onAfterNavigate
	}: Props = $props();

	const marketing = $derived(hostedMarketingAnchorAttrs(href, page.url.origin));

	function handleClick(e: MouseEvent) {
		if (marketing.external) return;
		if (!useGoto || !href) return;
		e.preventDefault();
		const path = marketing.href;
		if (hardNavigate && typeof window !== 'undefined') {
			window.location.assign(path);
			onAfterNavigate?.();
			return;
		}
		goto(path, { replaceState: false });
		onAfterNavigate?.();
	}

	// Path form for same-origin active detection: use pathname for absolute URLs, else normalized path
	const hrefPath = $derived.by(() => {
		if (marketing.href.startsWith('http://') || marketing.href.startsWith('https://')) {
			try {
				return new URL(marketing.href).pathname || '/';
			} catch {
				return route(href);
			}
		}
		return route(marketing.href);
	});

	let isActive = $derived(
		href === '/' || hrefPath === '/'
			? isSameRoute(page.url.pathname, hrefPath)
			: isParentRoute(page.url.pathname, hrefPath)
	);
</script>

<a
	href={marketing.href}
	target={marketing.target}
	rel={marketing.rel}
	data-sveltekit-preload-data={marketing.external ? 'off' : preload}
	onclick={handleClick}
	class="{className} {isActive ? whenSelected : whenUnselected}"
	>{@render children?.()}</a
>
