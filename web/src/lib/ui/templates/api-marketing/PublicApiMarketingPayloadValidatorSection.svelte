<script lang="ts">
	import type { PublicApiHubStaticExample, PublicApiPlatformSlug } from '$lib/content/constants/apis/types';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import BentoPublicApiPayloadValidatorHub from '$lib/ui/templates/bento/minor-templates/public-api/BentoPublicApiPayloadValidatorHub.svelte';

	type Props = {
		subtitle: string;
		title: string;
		description: string;
		mediaOnRight?: boolean;
		hubStaticExample: PublicApiHubStaticExample;
		platformSlug?: PublicApiPlatformSlug | null;
		isLoggedIn?: boolean;
	};

	let {
		subtitle,
		title,
		description,
		mediaOnRight = true,
		hubStaticExample,
		platformSlug = null,
		isLoggedIn
	}: Props = $props();
</script>

{#snippet sectionBento()}
	<BentoPublicApiPayloadValidatorHub
		staticExample={hubStaticExample}
		{platformSlug}
		{isLoggedIn}
	/>
{/snippet}

{#if mediaOnRight !== false}
	<HeroWithRightMedia
		heroTheme={landingHeroTheme}
		landingSubtitle={subtitle}
		landingTitle={title}
		landingDescription={description}
		rightMedia={sectionBento}
		showCta={false}
	/>
{:else}
	<HeroWithLeftMedia
		heroTheme={landingHeroTheme}
		landingSubtitle={subtitle}
		landingTitle={title}
		landingDescription={description}
		leftMedia={sectionBento}
		showCta={false}
	/>
{/if}
