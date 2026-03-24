<script lang="ts">
	import type { Snippet } from 'svelte';

	import { browser } from '$app/environment';
	import { pushState } from '$app/navigation';

	/**
	 * Same-page anchor link: smooth scroll, update URL hash without full navigation.
	 * For `href` values that do not start with `#`, behaves like a normal link (no interception).
	 */
	type Props = {
		children: Snippet;
		href: string;
		class?: string;
	};

	let { children, href, class: className = '' }: Props = $props();

	function handleClick(event: MouseEvent): void {
		if (!browser) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
		if (!href.startsWith('#')) return;

		event.preventDefault();
		const id = href.slice(1);
		if (!id) return;

		const anchor = document.getElementById(id);
		if (!anchor) return;

		anchor.scrollIntoView({ behavior: 'smooth' });
		const next = new URL(window.location.href);
		next.hash = href;
		pushState(next, {});
		window.dispatchEvent(new HashChangeEvent('hashchange'));
	}
</script>

<a href={href} onclick={handleClick} class={className}>{@render children?.()}</a>
