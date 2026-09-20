<script lang="ts">
	import type { PublicApiCapability } from '$lib/content/constants/apis/types';
	import {
		getPublicApiHubAudienceSection,
		getPublicApiPlatformAudienceSection
	} from '$lib/content/constants/apis/publicApiCapabilityAudienceConfig';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';

	type Props = {
		capability: PublicApiCapability;
		platformLabel?: string | null;
	};

	let { capability, platformLabel = null }: Props = $props();

	const section = $derived(
		platformLabel?.trim()
			? getPublicApiPlatformAudienceSection(capability, platformLabel.trim())
			: getPublicApiHubAudienceSection(capability)
	);
</script>

<WhoIsFor
	heroTheme={landingHeroTheme}
	landingSubtitle={section.audienceSubtitle}
	landingTitle={section.audienceTitle}
	cards={[...section.audienceCards]}
/>
