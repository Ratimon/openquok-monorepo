<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildLinkedInLandingAnalyticsVm } from './linkedinLandingAnalyticsMock';
	import { LINKEDIN_LANDING_MOCK_CHANNEL } from './linkedinLandingMock';

	const mockChannels = [LINKEDIN_LANDING_MOCK_CHANNEL];
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildLinkedInLandingAnalyticsVm}
/>
