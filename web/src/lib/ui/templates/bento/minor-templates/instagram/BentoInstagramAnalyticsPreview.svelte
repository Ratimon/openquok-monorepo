<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import {
		buildInstagramLandingAnalyticsVm,
		landingInstagramAnalyticsProviderIcon
	} from './instagramLandingAnalyticsMock';
	import { INSTAGRAM_LANDING_ANALYTICS_MOCK_CHANNELS } from './instagramLandingMock';

	const mockChannels = INSTAGRAM_LANDING_ANALYTICS_MOCK_CHANNELS;
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildInstagramLandingAnalyticsVm}
	providerIcon={landingInstagramAnalyticsProviderIcon}
/>
