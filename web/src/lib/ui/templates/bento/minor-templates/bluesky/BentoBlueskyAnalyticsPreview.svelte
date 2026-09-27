<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildBlueskyLandingAnalyticsVm } from './blueskyLandingAnalyticsMock';
	import { BLUESKY_LANDING_MOCK_CHANNEL } from './blueskyLandingMock';

	const mockChannels = [BLUESKY_LANDING_MOCK_CHANNEL];
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildBlueskyLandingAnalyticsVm}
/>
