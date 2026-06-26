<script lang="ts">
	import { PUBLIC_AGENTS_HUB } from '$lib/content/constants/publicAgentConfig';
	import { listPublicMcpIntegrationsForHub } from '$lib/content/constants/publicMcpConfig';

	import PublicMcpHubGrid from '$lib/ui/templates/landing-page/PublicMcpHubGrid.svelte';

	const integrations = listPublicMcpIntegrationsForHub();

	const sectionHeadingId = 'public-mcp-hub-heading';
</script>

<section class="border-t border-base-content/10 py-10 md:py-14" aria-labelledby={sectionHeadingId}>
	<div class="mx-auto max-w-3xl space-y-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">
			{PUBLIC_AGENTS_HUB.mcpHubSubtitle}
		</p>
		<h2
			id={sectionHeadingId}
			class="text-2xl font-black tracking-tight text-balance text-base-content sm:text-3xl"
		>
			{PUBLIC_AGENTS_HUB.mcpHubTitle}
		</h2>
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{PUBLIC_AGENTS_HUB.mcpHubDescription}
		</p>
	</div>

	<div class="mt-12">
		<PublicMcpHubGrid {integrations} />
	</div>
</section>
