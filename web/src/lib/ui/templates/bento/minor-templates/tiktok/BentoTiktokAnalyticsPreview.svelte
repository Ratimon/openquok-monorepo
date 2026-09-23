<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildTiktokLandingAnalyticsVm } from './tiktokLandingAnalyticsMock';
	import { TIKTOK_LANDING_MOCK_CHANNEL } from './tiktokLandingMock';

	const mockChannels = [TIKTOK_LANDING_MOCK_CHANNEL];
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildTiktokLandingAnalyticsVm}
/>
