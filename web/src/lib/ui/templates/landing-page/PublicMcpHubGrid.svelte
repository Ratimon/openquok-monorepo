<script lang="ts">
	import type { PublicMcpIntegration } from '$lib/content/constants/publicMcpConfig';

	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { route, url } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		integrations: readonly PublicMcpIntegration[];
		selectedClient: PublicMcpIntegration['mcpClient'];
		onSelect: (client: PublicMcpIntegration['mcpClient']) => void;
	};

	let { integrations, selectedClient, onSelect }: Props = $props();

	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);
</script>

<ul
	class="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
	aria-label="MCP clients you can connect"
>
	{#each integrations as integration (integration.slug)}
		{@const docsHref = url(`${publicDocsPath}/mcp-setup-guides/${integration.slug}`)}
		{@const isSelected = selectedClient === integration.mcpClient}
		<li>
			<div
				class={`flex h-full flex-col gap-4 rounded-2xl border p-6 transition ${
					isSelected
						? 'border-primary/50 bg-base-200/70 shadow-sm'
						: 'border-base-content/10 bg-base-200/40'
				}`}
			>
				<button
					type="button"
					class="flex flex-1 flex-col gap-4 text-left"
					aria-pressed={isSelected}
					onclick={() => onSelect(integration.mcpClient)}
				>
					<div class="flex items-start justify-between gap-3">
						<span
							class="grid size-12 place-items-center rounded-xl border border-white/10 bg-base-100/80"
							aria-hidden="true"
						>
							<AbstractIcon
								name={integration.icon}
								width="28"
								height="28"
								class="size-7"
								focusable="false"
							/>
						</span>
					</div>
					<div class="space-y-2">
						<h3 class="text-lg font-bold text-base-content">{integration.label}</h3>
						<p class="text-sm leading-relaxed text-base-content/70">{integration.hubDescription}</p>
					</div>
				</button>
				<a
					href={docsHref}
					class="mt-auto text-sm font-semibold text-primary hover:underline"
					target="_blank"
					rel="noopener noreferrer"
				>
					View setup guide →
				</a>
			</div>
		</li>
	{/each}
</ul>
