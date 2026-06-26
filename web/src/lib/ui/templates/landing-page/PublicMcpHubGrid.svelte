<script lang="ts">
	import type { PublicMcpIntegration } from '$lib/content/constants/publicMcpConfig';

	import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
	import { route } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		integrations: readonly PublicMcpIntegration[];
	};

	let { integrations }: Props = $props();
</script>

<ul
	class="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
	aria-label="MCP clients you can connect"
>
	{#each integrations as integration (integration.slug)}
		{@const href = route(getRootPathPublicAgent(integration.slug))}
		<li>
			<a
				href={href}
				class="group flex h-full flex-col gap-4 rounded-2xl border border-base-content/10 bg-base-200/40 p-6 transition hover:border-primary/40 hover:bg-base-200/70"
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
				<div class="space-y-2 text-left">
					<h3 class="text-lg font-bold text-base-content group-hover:text-primary">
						{integration.label}
					</h3>
					<p class="text-sm leading-relaxed text-base-content/70">{integration.hubDescription}</p>
				</div>
				<span class="mt-auto text-sm font-semibold text-primary">View integration →</span>
			</a>
		</li>
	{/each}
</ul>
