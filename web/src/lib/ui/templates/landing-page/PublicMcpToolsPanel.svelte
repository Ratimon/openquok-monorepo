<script lang="ts">
	import type { PublicMcpLandingPage } from '$lib/content/constants/publicMcpConfig';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const mcpTools = [
		{
			name: 'groupList',
			description: 'list channel groups when channels are organized by customer'
		},
		{
			name: 'integrationList',
			description: 'list connected channels from chat'
		},
		{
			name: 'integrationSchema',
			description: 'platform limits and compose rules'
		},
		{
			name: 'triggerTool',
			description: 'run provider helpers (subreddits, pages, Discord channels)'
		},
		{
			name: 'schedulePostTool',
			description: 'draft and schedule posts in natural language'
		}
	] as const;
</script>

<div
	class="mx-auto max-w-3xl rounded-2xl border border-base-content/10 bg-base-200/40 p-6 sm:p-8"
	role="img"
	aria-label="OpenQuok MCP tools available in your AI client"
>
	<p class="text-xs font-semibold tracking-wide text-base-content/55 uppercase">What you unlock</p>
	<ul class="mt-4 space-y-3 text-sm text-base-content/85">
		{#each mcpTools as tool (tool.name)}
			<li class="flex gap-2">
				<AbstractIcon
					name={icons.Check.name}
					class="mt-0.5 size-4 shrink-0 text-success"
					width="16"
					height="16"
				/>
				<span
					><strong class="font-medium text-base-content">{tool.name}</strong> — {tool.description}</span
				>
			</li>
		{/each}
	</ul>
	<p class="mt-5 rounded-lg border border-base-content/10 bg-base-100/80 px-3 py-2 text-sm text-base-content/75">
		Try: <em class="text-base-content">List my connected social media accounts</em>
	</p>
</div>
