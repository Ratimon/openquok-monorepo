<script lang="ts">
	import type { IconName } from '$data/icons';
	import type { PublicAgentLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
	import type { PublicMcpLandingPageViewModel } from '$lib/content/constants/publicMcpConfig';

	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { listPublicAgentsForHub } from '$lib/content/constants/publicAgentConfig';
	import { listPublicMcpLandingPages } from '$lib/content/constants/publicMcpConfig';
	import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
	import { isParentRoute, route } from '$lib/utils/path';

	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicNavCollapsibleSection from '$lib/ui/nav-bars/PublicNavCollapsibleSection.svelte';

	type Props = {
		title: string;
		agentsPath: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
		inline?: boolean;
		onAfterNavigate?: () => void;
	};

	type AgentsNavEntry = {
		slug: string;
		label: string;
		icon: IconName;
		available: boolean;
	};

	let {
		title,
		agentsPath,
		tabClass = '',
		whenSelected = '',
		whenUnselected = '',
		inline = false,
		onAfterNavigate
	}: Props = $props();

	const agentHosts = listPublicAgentsForHub();
	const mcpClients = listPublicMcpLandingPages();
	const agentColumns = splitIntoColumns(agentHosts.map(toNavEntry), 2);
	const mcpColumns = splitIntoColumns(mcpClients.map(toNavEntry), 3);

	let isActive = $derived(isParentRoute(page.url.pathname, agentsPath));

	function toNavEntry(
		landingPage: PublicAgentLandingPageViewModel | PublicMcpLandingPageViewModel
	): AgentsNavEntry {
		return {
			slug: landingPage.slug,
			label: landingPage.agentLabel,
			icon: landingPage.icon,
			available: landingPage.available
		};
	}

	function splitIntoColumns<T>(items: readonly T[], columnCount: number): T[][] {
		if (columnCount <= 0 || items.length === 0) return [];
		const size = Math.ceil(items.length / columnCount);
		return Array.from({ length: columnCount }, (_, index) =>
			items.slice(index * size, (index + 1) * size)
		).filter((column) => column.length > 0);
	}

	function entryHref(entry: AgentsNavEntry): string | undefined {
		if (!entry.available) return undefined;
		return route(getRootPathPublicAgent(entry.slug));
	}

	function handleNavigate() {
		onAfterNavigate?.();
	}
</script>

{#snippet agentsNavContent()}
	<div>
		<p class="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
			Autonomous Agent
		</p>
		<div
			class="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2"
			aria-label="Autonomous agent integrations"
		>
			{#each agentColumns as column (column.map((entry) => entry.slug).join('-'))}
				<div class="flex min-w-0 flex-col gap-0.5">
					{#each column as entry (entry.slug)}
						{@const href = entryHref(entry)}
						{#if href}
							<a
								href={href}
								onclick={handleNavigate}
								class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
							>
								<span
									class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
									aria-hidden="true"
								>
									<AbstractIcon
										name={entry.icon}
										width="16"
										height="16"
										class="size-4"
										focusable="false"
									/>
								</span>
								<span class="truncate">{entry.label}</span>
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
										name={entry.icon}
										width="16"
										height="16"
										class="size-4 opacity-60"
										focusable="false"
									/>
								</span>
								<span class="truncate">{entry.label}</span>
							</span>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</div>
	<div class="mt-3 border-t border-base-content/10 pt-3">
		<p class="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">MCP</p>
		<div
			class="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3"
			aria-label="MCP client integrations"
		>
			{#each mcpColumns as column (column.map((entry) => entry.slug).join('-'))}
				<div class="flex min-w-0 flex-col gap-0.5">
					{#each column as entry (entry.slug)}
						{@const href = entryHref(entry)}
						{#if href}
							<a
								href={href}
								onclick={handleNavigate}
								class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
							>
								<span
									class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
									aria-hidden="true"
								>
									<AbstractIcon
										name={entry.icon}
										width="16"
										height="16"
										class="size-4"
										focusable="false"
									/>
								</span>
								<span class="truncate">{entry.label}</span>
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
										name={entry.icon}
										width="16"
										height="16"
										class="size-4 opacity-60"
										focusable="false"
									/>
								</span>
								<span class="truncate">{entry.label}</span>
							</span>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</div>
	<div class="mt-2 border-t border-base-content/10 pt-2">
		<a
			href={agentsPath}
			onclick={handleNavigate}
			class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
		>
			<span
				class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
				aria-hidden="true"
			>
				<AbstractIcon
					name={icons.Grid3x3.name}
					width="16"
					height="16"
					class="size-4"
					focusable="false"
				/>
			</span>
			<span class="truncate">See All</span>
		</a>
	</div>
{/snippet}

{#if inline}
	<PublicNavCollapsibleSection
		{title}
		{tabClass}
		{whenSelected}
		{whenUnselected}
		{isActive}
	>
		{@render agentsNavContent()}
	</PublicNavCollapsibleSection>
{:else}
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
			class="w-[min(calc(100vw-2rem),42rem)] rounded-xl border border-base-content/10 bg-base-200 p-4 shadow-xl"
		>
			{@render agentsNavContent()}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
