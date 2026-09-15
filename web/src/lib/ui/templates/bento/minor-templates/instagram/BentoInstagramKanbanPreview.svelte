<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getInstagramLandingKanbanCards } from './instagramLandingKanbanMock';
	import { INSTAGRAM_LANDING_MOCK_CHANNEL } from './instagramLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getInstagramLandingKanbanCards()}
	channels={[INSTAGRAM_LANDING_MOCK_CHANNEL]}
	subtitle="Review agent and human drafts, then move Instagram posts between Drafted and Scheduled."
/>
