<script lang="ts">
	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { ShiftingTabDropdown } from '$lib/ui/dropdown-shifting';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicNavCollapsibleSection from '$lib/ui/nav-bars/PublicNavCollapsibleSection.svelte';
	import { isParentRoute, route } from '$lib/utils/path';

	type Props = {
		title: string;
		playbooksPath: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
		inline?: boolean;
		onAfterNavigate?: () => void;
	};

	type NavEntry = {
		label: string;
		href: string;
		description: string;
		icon: string;
	};

	const rootPathPublicPlaybooks = getRootPathPublicPlaybooks();
	const rootPathPublicBuildingBlocks = getRootPathPublicBuildingBlocks();
	const rootPathPublicSkillBuilder = getRootPathPublicSkillBuilder();

	const playbooksHubPath = route(rootPathPublicPlaybooks);
	const buildingBlocksHubPath = route(rootPathPublicBuildingBlocks);
	const skillBuilderPath = route(rootPathPublicSkillBuilder);

	const tabs = [
		{ id: 'playbook', label: 'Playbook' },
		{ id: 'building-blocks', label: 'Building Blocks' }
	] as const;

	const playbookEntries: NavEntry[] = [
		{
			label: 'Skill Builder',
			href: skillBuilderPath,
			description: 'Build and export a SKILL.md from building blocks.',
			icon: icons.LayoutTemplate.name
		},
		{
			label: 'See All',
			href: playbooksHubPath,
			description: 'Browse every published playbook.',
			icon: icons.Grid3x3.name
		},
	];

	const buildingBlockEntries: NavEntry[] = [
		{
			label: 'OpenQuok Core',
			href: `${buildingBlocksHubPath}?type=official`,
			description: 'First-party building blocks from OpenQuok.',
			icon: icons.OpenQuok.name
		},
		{
			label: 'Skills',
			href: `${buildingBlocksHubPath}?type=skills`,
			description: 'Browse skills-only building blocks.',
			icon: icons.Terminal.name
		},
		{
			label: 'MCP',
			href: `${buildingBlocksHubPath}?type=mcp`,
			description: 'Browse MCP-only building blocks.',
			icon: icons.Bot.name
		},
		{
			label: 'Both',
			href: `${buildingBlocksHubPath}?type=both`,
			description: 'Listings that ship skills and MCP together.',
			icon: icons.FileText.name
		}
	];

	const buildingBlocksSeeAllEntry: NavEntry = {
		label: 'See All',
		href: buildingBlocksHubPath,
		description: 'Browse every published building block.',
		icon: icons.Grid3x3.name
	};

	let {
		title,
		playbooksPath,
		tabClass = '',
		whenSelected = '',
		whenUnselected = '',
		inline = false,
		onAfterNavigate
	}: Props = $props();

	let open = $state(false);
	let selectedTabId = $state<(typeof tabs)[number]['id']>('playbook');

	let isActive = $derived(
		isParentRoute(page.url.pathname, playbooksPath) ||
			isParentRoute(page.url.pathname, buildingBlocksHubPath) ||
			isParentRoute(page.url.pathname, skillBuilderPath)
	);

	function handleNavigate() {
		open = false;
		onAfterNavigate?.();
	}

	function sectionEntries(tabId: (typeof tabs)[number]['id']): NavEntry[] {
		return tabId === 'playbook' ? playbookEntries : buildingBlockEntries;
	}
</script>

{#snippet navEntryList(entries: NavEntry[])}
	<div
		class="grid gap-2 {entries.length > 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}"
		aria-label={selectedTabId === 'playbook' ? 'Playbook links' : 'Building blocks links'}
	>
		{#each entries as entry (entry.href)}
			<a
				href={entry.href}
				onclick={handleNavigate}
				class="flex min-w-0 items-start gap-3 rounded-xl border border-base-content/10 bg-base-100/75 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-base-100"
			>
				<span
					class="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-base-200"
					aria-hidden="true"
				>
					<AbstractIcon name={entry.icon} width="18" height="18" class="size-4.5" focusable="false" />
				</span>
				<span class="min-w-0">
					<span class="block truncate text-sm font-semibold text-base-content">{entry.label}</span>
					<span class="mt-1 block text-xs leading-relaxed text-base-content/60">
						{entry.description}
					</span>
				</span>
			</a>
		{/each}
	</div>
{/snippet}

{#snippet seeAllLink(entry: NavEntry)}
	<div class="mt-3 border-t border-base-content/10 pt-3">
		<a
			href={entry.href}
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
	</div>
{/snippet}

{#snippet inlineContent()}
	<div class="space-y-4">
		<div>
			<p class="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
				Playbook
			</p>
			{@render navEntryList(playbookEntries)}
		</div>
		<div class="border-t border-base-content/10 pt-4">
			<p class="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
				Building Blocks
			</p>
			{@render navEntryList(buildingBlockEntries)}
			{@render seeAllLink(buildingBlocksSeeAllEntry)}
		</div>
	</div>
{/snippet}

{#if inline}
	<PublicNavCollapsibleSection
		{title}
		{tabClass}
		{whenSelected}
		{whenUnselected}
		{isActive}
		contentClass="max-w-xl"
	>
		{@render inlineContent()}
	</PublicNavCollapsibleSection>
{:else}
	<ShiftingTabDropdown
		bind:open
		bind:selectedTabId
		tabs={tabs}
		panelAlign="start"
		panelClass="!min-w-[min(100vw-2rem,26rem)] !max-w-[min(100vw-2rem,34rem)] !rounded-2xl !border-base-content/10 !bg-base-200 !p-4"
	>
		{#snippet trigger({ toggle, expanded })}
			<button
				type="button"
				class="{tabClass} inline-flex cursor-pointer items-center gap-1 border-none bg-transparent {isActive
					? whenSelected
					: whenUnselected}"
				aria-expanded={expanded}
				aria-haspopup="dialog"
				onclick={toggle}
			>
				{title}
				<span aria-hidden="true">
					<AbstractIcon
						name={icons.ChevronDown.name}
						width="16"
						height="16"
						class="size-4 shrink-0 opacity-70 transition-transform {expanded ? 'rotate-180' : ''}"
						focusable="false"
					/>
				</span>
			</button>
		{/snippet}

		<div class="space-y-3">
			<p class="px-1 text-xs font-medium text-base-content/60">
				{selectedTabId === 'playbook'
					? 'Browse playbooks or jump into the builder.'
					: 'Explore building blocks to build your own playbooks e.g. OpenQuok Core, Skills, MCP, and combo listings.'}
			</p>
			{@render navEntryList(sectionEntries(selectedTabId))}
			{#if selectedTabId === 'building-blocks'}
				{@render seeAllLink(buildingBlocksSeeAllEntry)}
			{/if}
		</div>
	</ShiftingTabDropdown>
{/if}
