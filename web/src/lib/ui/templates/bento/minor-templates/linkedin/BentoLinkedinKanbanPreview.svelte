<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getLinkedinLandingKanbanCards } from './linkedinLandingKanbanMock';
	import { LINKEDIN_LANDING_MOCK_CHANNEL } from './linkedinLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getLinkedinLandingKanbanCards()}
	channels={[LINKEDIN_LANDING_MOCK_CHANNEL]}
/>
