<script lang="ts">
	import { browser } from '$app/environment';

	type Props = {
		MEASUREMENT_ID: string;
	};

	let { MEASUREMENT_ID }: Props = $props();

	let gtagConfigured = $state(false);

	$effect(() => {
		if (!browser || gtagConfigured) return;
		const id = MEASUREMENT_ID;
		window.dataLayer = window.dataLayer || [];
		window.gtag = function gtag(): void {
			window.dataLayer.push(arguments);
		};
		window.gtag('js', new Date());
		window.gtag('config', id);
		gtagConfigured = true;
	});
</script>

<svelte:head>
	<script async src="https://www.googletagmanager.com/gtag/js?id={MEASUREMENT_ID}"></script>
</svelte:head>
