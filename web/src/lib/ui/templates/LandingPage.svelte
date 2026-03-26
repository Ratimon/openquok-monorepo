<script lang="ts">
	import HeroMain from '$lib/ui/templates/HeroMain.svelte';
	import { CONFIG_SCHEMA_LANDING_PAGE } from '$lib/config/constants/config';

	type Props = {
		landingPageConfigVm?: Record<string, string>;
	};

	let {
		landingPageConfigVm = {}
	}: Props = $props();

	const heroTitle = $derived(
		landingPageConfigVm.HERO_TITLE || String(CONFIG_SCHEMA_LANDING_PAGE.HERO_TITLE.default)
	);
	const heroSlogan = $derived(
		landingPageConfigVm.HERO_SLOGAN || String(CONFIG_SCHEMA_LANDING_PAGE.HERO_SLOGAN.default)
	);
</script>

<HeroMain
    {heroTitle}
    {heroSlogan}
    ctaTextPrimary="Get Started"
    ctaHrefPrimary="#"
    ctaTextSecondary="Learn More"
    ctaHrefSecondary="#" />