<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getXLandingKanbanCards } from './xLandingKanbanMock';
	import { X_LANDING_MOCK_CHANNEL } from './xLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getXLandingKanbanCards()}
	channels={[X_LANDING_MOCK_CHANNEL]}
	subtitle="Review agent and human drafts, then move X posts between Drafted and Scheduled."
/>
