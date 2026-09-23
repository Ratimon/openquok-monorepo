<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildThreadsLandingAnalyticsVm } from './threadsLandingAnalyticsMock';
	import { THREADS_LANDING_MOCK_CHANNEL } from './threadsLandingMock';

	const mockChannels = [THREADS_LANDING_MOCK_CHANNEL];
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildThreadsLandingAnalyticsVm}
/>
