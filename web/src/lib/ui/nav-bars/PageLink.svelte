<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
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
		onAfterNavigate
	}: Props = $props();

	function handleClick(e: MouseEvent) {
		if (!useGoto || !href) return;
		e.preventDefault();
		const path = href.startsWith('http://') || href.startsWith('https://') ? href : route(href);
		goto(path, { replaceState: false });
		onAfterNavigate?.();
	}

	// Path form for same-origin active detection: use pathname for absolute URLs, else normalized path
	const hrefPath = $derived.by(() => {
		if (href.startsWith('http://') || href.startsWith('https://')) {
			try {
				return new URL(href).pathname || '/';
			} catch {
				return route(href);
			}
		}
		return route(href);
	});

	let isActive = $derived(
		href === '/' || hrefPath === '/'
			? isSameRoute(page.url.pathname, hrefPath)
			: isParentRoute(page.url.pathname, hrefPath)
	);

	// Use href as-is for absolute URLs (http/https); otherwise normalize path for same-origin links
	const hrefToUse = $derived(
		href.startsWith('http://') || href.startsWith('https://') ? href : route(href)
	);
</script>

<a
	href={hrefToUse}
	data-sveltekit-preload-data={preload}
	onclick={handleClick}
	class="{className} {isActive ? whenSelected : whenUnselected}"
	>{@render children?.()}</a
>
