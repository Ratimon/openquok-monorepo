<script lang="ts">
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';

	type Props = {
		title: string;
		headingId?: string;
		heroTheme?: LandingHeroTheme;
		class?: string;
	};

	let props: Props = $props();
</script>

<PublicHeroTitle {...props} />
