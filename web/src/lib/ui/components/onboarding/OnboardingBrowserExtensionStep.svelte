<script lang="ts">
	import type { OnboardingMode } from '$lib/ui/components/onboarding/onboarding.types';

	import { page } from '$app/state';
	import { getRootPathPublicBrowserExtensionLanding } from '$lib/area-public/constants/getRootPathPublicBrowserExtensionLanding';
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import {
		getPublicBrowserExtensionChromeStoreCtaHref,
		PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL
	} from '$lib/content/constants/landing/browser-extension-chrome-cta';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import ChromeWebStoreSafariPreview from '$lib/ui/components/onboarding/ChromeWebStoreSafariPreview.svelte';

	type Props = {
		mode: OnboardingMode;
	};

	let { mode }: Props = $props();

	const chromeStoreHref = `${getPublicBrowserExtensionChromeStoreCtaHref()}?utm_source=onboarding-wizard`;

	const installGuideHref = $derived(
		hostedMarketingHref(
			`${route(getRootPathPublicDocs())}/installation/chrome-extension`,
			page.url.origin
		)
	);
	const overviewHref = $derived(
		hostedMarketingHref(route(getRootPathPublicBrowserExtensionLanding()), page.url.origin)
	);

	const stepDescription = $derived.by(() => {
		if (mode === 'agent' || mode === 'mcp') {
			return 'The side panel schedules posts from any tab. Skool, Reddit, and right-click drafts need the extension in Chrome.';
		}
		return 'The side panel schedules posts from any tab. Skool, Reddit, and directory autofill need the extension in Chrome.';
	});
</script>

<div class="px-6 py-6">
	<div class="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,340px)] lg:items-start">
		<div class="min-w-0 text-center lg:text-start">
			<h3 class="text-lg font-semibold text-base-content">Install the browser extension</h3>
			<p class="mt-2 text-sm text-base-content/70">
				{stepDescription} This step is optional.
			</p>

			<ol class="mt-3 space-y-1.5 text-sm text-base-content/75 lg:mx-0 lg:max-w-none">
				<li class="flex gap-2">
					<span class="shrink-0 font-medium text-base-content/55">1.</span>
					<span>Connect one channel in a previous step.</span>
				</li>
				<li class="flex gap-2">
					<span class="shrink-0 font-medium text-base-content/55">2.</span>
					<span>Install the extension. Use the same Chrome profile as Skool or Reddit.</span>
				</li>
				<li class="flex gap-2">
					<span class="shrink-0 font-medium text-base-content/55">3.</span>
					<span>Open the side panel. Link your signed-in OpenQuok session.</span>
				</li>
			</ol>

			<div class="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
				<Button href={chromeStoreHref} target="_blank" rel="noopener noreferrer">
					{PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL}
				</Button>
				<Button variant="outline" href={installGuideHref} target="_blank" rel="noopener noreferrer">
					Install guide
				</Button>
				<Button variant="ghost" href={overviewHref} target="_blank" rel="noopener noreferrer">
					How it works
				</Button>
			</div>
		</div>

		<div class="mx-auto w-full max-w-[340px] lg:mx-0 lg:max-w-none">
			<ChromeWebStoreSafariPreview href={chromeStoreHref} class="lg:sticky lg:top-2" />
		</div>
	</div>
</div>
