<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getTiktokLandingKanbanCards } from './tiktokLandingKanbanMock';
	import { TIKTOK_LANDING_MOCK_CHANNEL } from './tiktokLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getTiktokLandingKanbanCards()}
	channels={[TIKTOK_LANDING_MOCK_CHANNEL]}
/>
