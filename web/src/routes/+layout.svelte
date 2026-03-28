<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
	import { Toaster } from '$lib/ui/sonner';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import '../app.postcss';
	import { page } from '$app/state';
	import CookieConsentBanner from '$lib/ui/cookie/CookieConsentBanner.svelte';
	import GoogleAnalytics from '$lib/analytics/GoogleAnalytics.svelte';
	import { THEME_STORAGE_KEY } from '$lib/ui/daisyui/ThemeSwitcher.svelte';

	type Props = {
		data: PageData & App.LayoutData;
		children: Snippet;
	};

	let { data, children }: Props = $props();

	/** Landing uses Aurora/forest; sync DOM + localStorage so returning from /docs does not stay on light. */
	afterNavigate(({ to }) => {
		if (!browser || !to || to.url.pathname !== '/') return;
		document.documentElement.setAttribute('data-theme', 'forest');
		try {
			localStorage.setItem(THEME_STORAGE_KEY, 'forest');
		} catch {
			/* ignore */
		}
	});

	let MEASUREMENT_ID = import.meta.env.VITE_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID;

	let authStatus = $derived((data as App.LayoutData)?.authStatus ?? AuthStatus.UNAUTHENTICATED);
	let metaTags = $derived(
		deepMerge(
			data.baseMetaTags ,
			page.data.pageMetaTags
		)
	);
</script>

<GoogleAnalytics {MEASUREMENT_ID} />
<MetaTags {...metaTags} />
<svelte:head>
	<link rel="icon" href="/pwa/favicon.svg" type="image/svg+xml" />
</svelte:head>

<section class="w-full" style="min-height: 100vh;">
	<main>
		{#if authStatus === AuthStatus.UNKNOWN || authStatus === AuthStatus.CHECKING || authStatus === AuthStatus.ERROR}
			<div class="flex min-h-[50vh] items-center justify-center">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{:else}
			{@render children?.()}
		{/if}
	</main>
	<Toaster />
	<CookieConsentBanner />
</section>
