<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getYoutubeLandingKanbanCards } from './youtubeLandingKanbanMock';
	import { YOUTUBE_LANDING_MOCK_CHANNEL } from './youtubeLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getYoutubeLandingKanbanCards()}
	channels={[YOUTUBE_LANDING_MOCK_CHANNEL]}
	subtitle="Review agent and human drafts, then drag YouTube uploads between Drafted and Scheduled."
/>
