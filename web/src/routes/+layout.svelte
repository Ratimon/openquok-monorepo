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
	import GoogleAnalytics from '$lib/product-analytics/GoogleAnalytics.svelte';
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
	let oauthCodeRedirectPending = $derived(
		Boolean((data as App.LayoutData)?.oauthCodeRedirectPending)
	);
	let oauthCodeRedirectUrl = $derived((data as App.LayoutData)?.oauthCodeRedirectUrl ?? '');
	let metaTags = $derived(
		deepMerge(
			data.baseMetaTags ,
			page.data.pageMetaTags
		)
	);

	let oauthRedirectDone = $state(false);
	$effect(() => {
		if (!browser || !oauthCodeRedirectPending || !oauthCodeRedirectUrl || oauthRedirectDone) return;
		oauthRedirectDone = true;
		window.location.replace(oauthCodeRedirectUrl);
	});

	$effect(() => {
		if (!browser || !oauthCodeRedirectPending) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	});
</script>

<GoogleAnalytics {MEASUREMENT_ID} />
<MetaTags {...metaTags} />
<svelte:head>
	<link rel="icon" href="/pwa/favicon.svg" type="image/svg+xml" />
</svelte:head>

<section class="w-full" style="min-height: 100vh;">
	<main>
		{#if oauthCodeRedirectPending}
			<div
				class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-base-100/95 px-6 text-center backdrop-blur-sm"
				role="status"
				aria-live="polite"
			>
				<span class="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
				<p class="max-w-md text-lg font-medium text-base-content">
					Completing sign-in… Please wait and do not close or navigate away from this page.
				</p>
			</div>
		{:else if authStatus === AuthStatus.UNKNOWN || authStatus === AuthStatus.CHECKING || authStatus === AuthStatus.ERROR}
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
