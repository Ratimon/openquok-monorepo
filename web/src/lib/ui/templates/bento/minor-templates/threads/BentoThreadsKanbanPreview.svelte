<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getThreadsLandingKanbanCards } from './threadsLandingKanbanMock';
	import { THREADS_LANDING_MOCK_CHANNEL } from './threadsLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getThreadsLandingKanbanCards()}
	channels={[THREADS_LANDING_MOCK_CHANNEL]}
	subtitle="Review agent and human drafts, then move Threads posts between Drafted and Scheduled."
/>
