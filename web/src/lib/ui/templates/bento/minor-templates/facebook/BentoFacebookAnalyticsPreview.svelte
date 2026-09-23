<script lang="ts">
	import BentoAnalyticsWorkspacePreview from '$lib/ui/templates/bento/minor-templates/BentoAnalyticsWorkspacePreview.svelte';

	import { buildFacebookLandingAnalyticsVm } from './facebookLandingAnalyticsMock';
	import { FACEBOOK_LANDING_ANALYTICS_MOCK_CHANNELS } from './facebookLandingMock';

	const mockChannels = FACEBOOK_LANDING_ANALYTICS_MOCK_CHANNELS;
	const mockWorkspaceId = 'landing-mock-workspace';
</script>

<BentoAnalyticsWorkspacePreview
	{mockChannels}
	{mockWorkspaceId}
	buildAnalyticsVm={buildFacebookLandingAnalyticsVm}
/>
