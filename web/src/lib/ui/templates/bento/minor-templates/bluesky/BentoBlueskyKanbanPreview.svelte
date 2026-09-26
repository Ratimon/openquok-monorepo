<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getBlueskyLandingKanbanCards } from './blueskyLandingKanbanMock';
	import { BLUESKY_LANDING_MOCK_CHANNEL } from './blueskyLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getBlueskyLandingKanbanCards()}
	channels={[BLUESKY_LANDING_MOCK_CHANNEL]}
	subtitle="Review agent and human drafts, then move Bluesky posts between Drafted and Scheduled."
/>
