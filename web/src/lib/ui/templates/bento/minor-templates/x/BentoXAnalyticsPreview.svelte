<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildXLandingAnalyticsVm } from './xLandingAnalyticsMock';
	import { X_LANDING_MOCK_CHANNEL } from './xLandingMock';

	const mockChannels = [X_LANDING_MOCK_CHANNEL];
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildXLandingAnalyticsVm}
/>
