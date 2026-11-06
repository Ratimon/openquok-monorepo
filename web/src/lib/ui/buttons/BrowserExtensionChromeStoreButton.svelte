<script lang="ts">
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import {
		getPublicBrowserExtensionChromeStoreCtaHref,
		PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL
	} from '$lib/content/constants/landing/browser-extension-chrome-cta';
	import { externalLinkAnchorAttrs } from '$lib/utils/externalLinkRel';

	type Props = {
		class?: string;
		variant?: 'primary' | 'ghost';
		label?: string;
		href?: string;
	};

	let {
		class: className = '',
		variant = 'primary',
		label = PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL,
		href = getPublicBrowserExtensionChromeStoreCtaHref()
	}: Props = $props();

	const externalAnchor = $derived(externalLinkAnchorAttrs(href));
</script>

<ButtonGlitchBrightness
	class={className}
	{variant}
	size="lg"
	{href}
	target={externalAnchor.target}
	rel={externalAnchor.rel}
	preload="off"
>
	{label}
</ButtonGlitchBrightness>
