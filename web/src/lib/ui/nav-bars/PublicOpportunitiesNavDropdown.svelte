<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import {
		PUBLIC_OPPORTUNITIES_NAV_SECTIONS,
		type PublicOpportunitiesNavLinkKey
	} from '$lib/content/constants/publicOpportunitiesNavCatalog';
	import {
		OPEN_PUBLIC_OPPORTUNITIES_NAV_EVENT,
		PUBLIC_NAVBAR_OPPORTUNITIES_ANCHOR_ID,
		type PublicOpportunitiesNavTab
	} from '$lib/config/constants/config';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';
	import { isParentRoute, route, url } from '$lib/utils/path';

	import { ShiftingTabDropdown } from '$lib/ui/dropdown-shifting';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicNavCollapsibleSection from '$lib/ui/nav-bars/PublicNavCollapsibleSection.svelte';

	type Props = {
		title: string;
		opportunitiesPath: string;
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

	const playbooksHubPath = route(getRootPathPublicPlaybooks());
	const buildingBlocksHubPath = route(getRootPathPublicBuildingBlocks());
	const skillBuilderPath = route(getRootPathPublicSkillBuilder());

	const linkIcons: Record<PublicOpportunitiesNavLinkKey, string> = {
		'see-all': icons.Grid3x3.name,
		categories: icons.FolderInput.name,
		tags: icons.Tags.name,
		'skill-builder': icons.LayoutTemplate.name,
		'openquok-core': icons.OpenQuok.name,
		skills: icons.Terminal.name,
		mcp: icons.Bot.name,
		both: icons.FileText.name
	};

	const tabs = PUBLIC_OPPORTUNITIES_NAV_SECTIONS.map((section) => ({
		id: section.id,
		label: section.label
	}));

	function catalogEntries(sectionId: PublicOpportunitiesNavTab): NavEntry[] {
		const section = PUBLIC_OPPORTUNITIES_NAV_SECTIONS.find((item) => item.id === sectionId);
		if (!section) return [];
		return section.links.map((link) => ({
			label: link.label,
			href: url(link.pathname),
			description: link.description,
			icon: linkIcons[link.key]
		}));
	}

	let {
		title,
		opportunitiesPath,
		tabClass = '',
		whenSelected = '',
		whenUnselected = '',
		inline = false,
		onAfterNavigate
	}: Props = $props();

	let open = $state(false);
	let selectedTabId = $state<(typeof tabs)[number]['id']>('backlinks');

	let isActive = $derived(
		isParentRoute(page.url.pathname, opportunitiesPath) ||
			isParentRoute(page.url.pathname, playbooksHubPath) ||
			isParentRoute(page.url.pathname, buildingBlocksHubPath) ||
			isParentRoute(page.url.pathname, skillBuilderPath)
	);

	let tabBlurb = $derived(
		PUBLIC_OPPORTUNITIES_NAV_SECTIONS.find((section) => section.id === selectedTabId)?.blurb ?? ''
	);

	function handleNavigate() {
		open = false;
		onAfterNavigate?.();
	}

	function sectionEntries(tabId: PublicOpportunitiesNavTab): NavEntry[] {
		return catalogEntries(tabId);
	}

	function entriesAriaLabel(tabId: PublicOpportunitiesNavTab): string {
		const section = PUBLIC_OPPORTUNITIES_NAV_SECTIONS.find((item) => item.id === tabId);
		return section ? `${section.label} links` : 'Opportunities links';
	}

	function isValidOpportunitiesTab(tab: unknown): tab is PublicOpportunitiesNavTab {
		return tab === 'backlinks' || tab === 'playbook' || tab === 'building-blocks';
	}

	$effect(() => {
		if (!browser) return;

		const handler = (event: Event) => {
			const tab = (event as CustomEvent<{ tab?: PublicOpportunitiesNavTab }>).detail?.tab;
			if (!isValidOpportunitiesTab(tab)) return;
			selectedTabId = tab;
			open = true;
		};

		window.addEventListener(OPEN_PUBLIC_OPPORTUNITIES_NAV_EVENT, handler);
		return () => window.removeEventListener(OPEN_PUBLIC_OPPORTUNITIES_NAV_EVENT, handler);
	});
</script>

{#snippet navEntryList(entries: NavEntry[], ariaLabel: string)}
	<div
		class="grid gap-2 {entries.length > 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}"
		aria-label={ariaLabel}
	>
		{#each entries as entry (entry.href)}
			{@const marketing = hostedMarketingAnchorAttrs(entry.href, page.url.origin)}
			<a
				href={marketing.href}
				target={marketing.target}
				rel={marketing.rel}
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

{#snippet inlineContent()}
	<div class="space-y-4">
		<div>
			<p class="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
				Backlinks
			</p>
			{@render navEntryList(catalogEntries('backlinks'), 'Backlinks links')}
		</div>
		<div class="border-t border-base-content/10 pt-4">
			<p class="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
				Playbooks
			</p>
			{@render navEntryList(catalogEntries('playbook'), 'Playbooks links')}
		</div>
		<div class="border-t border-base-content/10 pt-4">
			<p class="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
				Building Blocks
			</p>
			{@render navEntryList(catalogEntries('building-blocks'), 'Building blocks links')}
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
		{tabs}
		panelAlign="start"
		panelClass="!min-w-[min(100vw-2rem,26rem)] !max-w-[min(100vw-2rem,34rem)] !rounded-2xl !border-base-content/10 !bg-base-200 !p-4"
	>
		{#snippet trigger({ toggle, expanded })}
			<button
				type="button"
				id={PUBLIC_NAVBAR_OPPORTUNITIES_ANCHOR_ID}
				class="{tabClass} inline-flex scroll-mt-4 cursor-pointer items-center gap-1 border-none bg-transparent {isActive
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
			<p class="px-1 text-xs font-medium text-base-content/60">{tabBlurb}</p>
			{@render navEntryList(sectionEntries(selectedTabId), entriesAriaLabel(selectedTabId))}
		</div>
	</ShiftingTabDropdown>
{/if}
