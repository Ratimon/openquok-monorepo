<script lang="ts">
	import type { PublicAgentLandingPage } from '$lib/content/constants/publicAgentConfig';

	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { listPublicAgentsForHub } from '$lib/content/constants/publicAgentConfig';
	import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
	import { isParentRoute, route } from '$lib/utils/path';

	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		title: string;
		agentsPath: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
	};

	let {
		title,
		agentsPath,
		tabClass = '',
		whenSelected = '',
		whenUnselected = ''
	}: Props = $props();

	const agents = listPublicAgentsForHub();
	const columns = splitIntoColumns(agents, 2);

	let isActive = $derived(isParentRoute(page.url.pathname, agentsPath));

	function splitIntoColumns<T>(items: readonly T[], columnCount: number): T[][] {
		if (columnCount <= 0 || items.length === 0) return [];
		const size = Math.ceil(items.length / columnCount);
		return Array.from({ length: columnCount }, (_, index) =>
			items.slice(index * size, (index + 1) * size)
		).filter((column) => column.length > 0);
	}

	function agentHref(agent: PublicAgentLandingPage): string | undefined {
		if (!agent.available) return undefined;
		return route(getRootPathPublicAgent(agent.slug));
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		type="button"
		class="{tabClass} inline-flex cursor-pointer items-center gap-1 border-none bg-transparent {isActive
			? whenSelected
			: whenUnselected}"
	>
		{title}
		<span aria-hidden="true">
			<AbstractIcon
				name={icons.ChevronDown.name}
				width="16"
				height="16"
				class="size-4 shrink-0 opacity-70"
				focusable="false"
			/>
		</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		align="center"
		sideOffset={10}
		class="w-[min(calc(100vw-2rem),28rem)] rounded-xl border border-base-content/10 bg-base-200 p-4 shadow-xl"
	>
		<div class="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2" aria-label="AI agent integrations">
			{#each columns as column (column.map((agent) => agent.slug).join('-'))}
				<div class="flex min-w-0 flex-col gap-0.5">
					{#each column as agent (agent.slug)}
						{@const href = agentHref(agent)}
						{#if href}
							<a
								href={href}
								class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
							>
								<span
									class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
									aria-hidden="true"
								>
									<AbstractIcon
										name={agent.icon}
										width="16"
										height="16"
										class="size-4"
										focusable="false"
									/>
								</span>
								<span class="truncate">{agent.agentLabel}</span>
							</a>
						{:else}
							<span
								class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content/45"
								title="Coming soon"
							>
								<span
									class="grid size-7 shrink-0 place-items-center rounded-md border border-white/5 bg-base-100/40"
									aria-hidden="true"
								>
									<AbstractIcon
										name={agent.icon}
										width="16"
										height="16"
										class="size-4 opacity-60"
										focusable="false"
									/>
								</span>
								<span class="truncate">{agent.agentLabel}</span>
							</span>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
		<div class="mt-2 border-t border-base-content/10 pt-2">
			<a
				href={agentsPath}
				class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
			>
				<span
					class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
					aria-hidden="true"
				>
					<AbstractIcon
						name={icons.Bot.name}
						width="16"
						height="16"
						class="size-4"
						focusable="false"
					/>
				</span>
				<span class="truncate">See All</span>
			</a>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
