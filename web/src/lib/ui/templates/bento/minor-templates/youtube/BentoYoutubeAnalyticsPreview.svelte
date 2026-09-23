<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildYoutubeLandingAnalyticsVm } from './youtubeLandingAnalyticsMock';
	import { YOUTUBE_LANDING_MOCK_CHANNEL } from './youtubeLandingMock';

	const mockChannels = [YOUTUBE_LANDING_MOCK_CHANNEL];
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildYoutubeLandingAnalyticsVm}
/>
