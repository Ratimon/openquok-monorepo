<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildDevtoLandingAnalyticsVm } from './devtoLandingAnalyticsMock';
	import { DEVTO_LANDING_MOCK_CHANNEL } from './devtoLandingMock';

	const mockChannels = [DEVTO_LANDING_MOCK_CHANNEL];
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildDevtoLandingAnalyticsVm}
/>
