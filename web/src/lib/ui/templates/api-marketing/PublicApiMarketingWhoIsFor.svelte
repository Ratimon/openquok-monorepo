<script lang="ts">
	import type {
		PublicApiCapability,
		PublicApiPlatformSlug
	} from '$lib/content/constants/channels/api/_shared/types';
	import {
		getPublicApiHubAudienceSection,
		getPublicApiPlatformAudienceSection
	} from '$lib/content/constants/channels/api/_shared/publicApiCapabilityAudienceConfig';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';

	type Props = {
		capability: PublicApiCapability;
		platformLabel?: string | null;
		platformSlug?: PublicApiPlatformSlug | null;
	};

	let { capability, platformLabel = null, platformSlug = null }: Props = $props();

	const section = $derived(
		platformLabel?.trim()
			? getPublicApiPlatformAudienceSection(
					capability,
					platformLabel.trim(),
					platformSlug ?? undefined
				)
			: getPublicApiHubAudienceSection(capability)
	);
</script>

<WhoIsFor
	heroTheme={landingHeroTheme}
	landingSubtitle={section.audienceSubtitle}
	landingTitle={section.audienceTitle}
	cards={[...section.audienceCards]}
/>
