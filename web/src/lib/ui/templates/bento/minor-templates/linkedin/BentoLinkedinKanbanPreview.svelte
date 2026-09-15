<script lang="ts">
	import BentoLandingKanbanPreview from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingKanbanPreview.svelte';
	import { getLinkedinLandingKanbanCards } from './linkedinLandingKanbanMock';
	import { LINKEDIN_LANDING_MOCK_CHANNEL } from './linkedinLandingMock';
</script>

<BentoLandingKanbanPreview
	cards={getLinkedinLandingKanbanCards()}
	channels={[LINKEDIN_LANDING_MOCK_CHANNEL]}
	subtitle="Review B2B drafts for profile and Page, then move posts from Drafted to Scheduled."
/>
