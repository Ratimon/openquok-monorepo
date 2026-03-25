<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PageData } from './$types';
	import { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
	import { Toaster } from 'svelte-hot-french-toast';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import '../app.postcss';
	import { page } from '$app/state';
	import CookieConsentBanner from '$lib/ui/cookie/CookieConsentBanner.svelte';
	import GoogleAnalytics from '$lib/analytics/GoogleAnalytics.svelte';

	type Props = {
		data: PageData & App.LayoutData;
		children: Snippet;
	};

	let { data, children }: Props = $props();

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
