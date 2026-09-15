<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getDevtoLandingKanbanCards } from './devtoLandingKanbanMock';
	import { DEVTO_LANDING_MOCK_CHANNEL } from './devtoLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getDevtoLandingKanbanCards()}
	channels={[DEVTO_LANDING_MOCK_CHANNEL]}
	subtitle="Review agent and human drafts, then drag Dev.to articles between Drafted and Scheduled."
/>
