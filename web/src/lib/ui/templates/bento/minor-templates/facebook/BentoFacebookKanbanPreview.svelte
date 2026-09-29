<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getFacebookLandingKanbanCards } from './facebookLandingKanbanMock';
	import { FACEBOOK_LANDING_MOCK_CHANNEL } from './facebookLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getFacebookLandingKanbanCards()}
	channels={[FACEBOOK_LANDING_MOCK_CHANNEL]}
/>
