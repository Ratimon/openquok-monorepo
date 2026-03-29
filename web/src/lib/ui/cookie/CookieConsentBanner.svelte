<script lang="ts">
	import { browser } from '$app/environment';
	import { icons } from '$data/icon';
	
	import { cookieConsentStore } from '$lib/core/cookieConsent.store';
	import CookieConsentButtonDeny from '$lib/ui/cookie/CookieConsentButtonDeny.svelte';
	import CookieConsentButtonAccept from '$lib/ui/cookie/CookieConsentButtonAccept.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PageLink from '$lib/ui/nav-bars/PageLink.svelte';

	let hasCookieConsent: boolean | null = $state(null);
	let showOnScroll: boolean = $state(false);

	$effect(() => {
		const unsubscribe = cookieConsentStore.subscribe((value) => {
			hasCookieConsent = value;
		});
		return unsubscribe;
	});
	$effect(() => {
		if (!browser) return;
		if (hasCookieConsent !== null) return;

		const handleFirstScroll = () => {
			showOnScroll = true;
			window.removeEventListener('scroll', handleFirstScroll);
		};

		window.addEventListener('scroll', handleFirstScroll);

		return () => {
			window.removeEventListener('scroll', handleFirstScroll);
		};
	});

	let shouldShow = $derived(hasCookieConsent === null && showOnScroll);
</script>

{#if shouldShow}
	<div
		data-cookie-banner
		class="fixed left-6 bottom-6 shadow-lg shadow-neutral-500 z-50 max-w-96 bg-base-100 p-4 rounded-md"
	>
		<h2 class="text-lg font-semibold inline-flex items-center leading-6 py-2 text-base-content">
			Heads up! <AbstractIcon name={icons.Cookie.name} width="24" height="24" class="mx-2" />
		</h2>
		<p class="text-base-content">
			We use cookies to enhance the functionality of this website in order to give you the best
			experience. Cool?
		</p>
		<p class="py-2 text-base-content">
			Learn more in our
			<PageLink href="/privacy-policy" class="underline whitespace-nowrap px-2">
				Privacy Policy
			</PageLink>
			{' '}
			and our
			<PageLink href="/cookie-policy" class="underline whitespace-nowrap px-2">
				Cookie Policy
			</PageLink>
		</p>
		<div class="grid justify-items-end">
			<div class="space-x-2">
				<CookieConsentButtonDeny />
				<CookieConsentButtonAccept />
			</div>
		</div>
	</div>
{/if}

<style>
	:global(html[data-theme='dark']) [data-cookie-banner] {
		background-color: rgb(31 41 55); /* gray-800 */
	}

	:global(html[data-theme='dark']) [data-cookie-banner] h2 {
		color: white;
	}

	:global(html[data-theme='dark']) [data-cookie-banner] p {
		color: rgb(209 213 219); /* gray-300 */
	}
</style>

