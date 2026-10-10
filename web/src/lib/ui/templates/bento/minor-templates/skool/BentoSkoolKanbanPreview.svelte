<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getSkoolLandingKanbanCards } from './skoolLandingKanbanMock';
	import { SKOOL_LANDING_MOCK_CHANNEL } from './skoolLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getSkoolLandingKanbanCards()}
	channels={[SKOOL_LANDING_MOCK_CHANNEL]}
/>
