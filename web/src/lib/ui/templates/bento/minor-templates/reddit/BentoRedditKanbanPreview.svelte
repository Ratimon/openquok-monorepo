<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getRedditLandingKanbanCards } from './redditLandingKanbanMock';
	import { REDDIT_LANDING_MOCK_CHANNEL } from './redditLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getRedditLandingKanbanCards()}
	channels={[REDDIT_LANDING_MOCK_CHANNEL]}
/>
