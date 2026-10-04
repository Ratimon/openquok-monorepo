<script lang="ts">
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import PublicLandingSectionHeading from '$lib/ui/templates/titles/PublicLandingSectionHeading.svelte';

	type HeadingLevel = 'h1' | 'h2' | 'h3';
	type GradientMode = 'segment' | 'part';

	type Props = {
		title: string;
		headingId?: string;
		heroTheme?: LandingHeroTheme;
		class?: string;
		headingLevel?: HeadingLevel;
		commaSeparated?: boolean;
		gradientMode?: GradientMode;
	};

	let props: Props = $props();
</script>

<PublicLandingSectionHeading {...props} />
