<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import {
		AGENT_MULTI_PLATFORM_MOCK_CHANNELS,
		getAgentMultiPlatformKanbanCards
	} from './agentMultiPlatformKanbanMock';
</script>

<BentoLandingKanbanPreview
	cards={getAgentMultiPlatformKanbanCards()}
	channels={AGENT_MULTI_PLATFORM_MOCK_CHANNELS}
	subtitle="Review agent and human drafts across Facebook, Threads, Instagram, and more — drag posts between Drafted and Scheduled."
/>
