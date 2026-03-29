<script lang="ts">
	import type { NavItem } from '$lib/docs/types';

	import { goto } from '$app/navigation';
	import { icons } from '$data/icon';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Command from '$lib/ui/command/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	interface PagefindResult {
		url: string;
		meta: { title: string };
		excerpt: string;
	}

	let { navigation = [] }: { navigation?: NavItem[] } = $props();

	let open = $state(false);
	let query = $state('');
	let searchResults = $state<PagefindResult[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pagefind: any = $state(null);
	let searching = $state(false);

	async function loadPagefind() {
		if (pagefind) return;
		try {
			const pagefindUrl = `${window.location.origin}/pagefind/pagefind.js`;
			/* Vite cannot analyze import(variable). Svelte may drop @vite-ignore on import(); use runtime indirection. */
			// eslint-disable-next-line no-new-func -- dynamic import URL must stay out of the static graph
			const runtimeImport = new Function('url', 'return import(url)') as (
				url: string
			) => Promise<{ init: () => Promise<void> }>;
			pagefind = await runtimeImport(pagefindUrl);
			await pagefind.init();
		} catch {
			pagefind = null;
		}
	}

	let debounceTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		const q = query;
		clearTimeout(debounceTimer);
		if (!q || q.length < 2) {
			searchResults = [];
			searching = false;
			return;
		}

		searching = true;
		debounceTimer = setTimeout(async () => {
			if (!pagefind) await loadPagefind();
			if (!pagefind) {
				searching = false;
				return;
			}

			try {
				const search = await pagefind.search(q);
				const results = await Promise.all(
					search.results.slice(0, 8).map((r: { data: () => Promise<PagefindResult> }) => r.data())
				);
				searchResults = results;
			} catch {
				searchResults = [];
			}
			searching = false;
		}, 150);

		return () => clearTimeout(debounceTimer);
	});

	$effect(() => {
		if (!open) {
			query = '';
			searchResults = [];
		}
	});

	function navigate(url: string) {
		open = false;
		query = '';
		searchResults = [];
		goto(url);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
			if (open) void loadPagefind();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Button
	variant="outline"
	class="text-base-content/70 border-base-300 relative h-8 w-full justify-start rounded-md text-sm"
	onclick={() => {
		open = true;
		void loadPagefind();
	}}
>
	<AbstractIcon name={icons.Search.name} class="mr-2 size-4" width="16" height="16" />
	<span class="inline-flex">Search docs…</span>
	<kbd
		class="bg-base-200 text-base-content/70 pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border border-base-300 px-1.5 font-mono text-[10px] font-medium sm:flex"
	>
		<span class="text-xs">⌘</span>K
	</kbd>
</Button>

<Command.Dialog bind:open title="Search documentation" description="Find a docs page">
	<Command.Input placeholder="Search documentation…" bind:value={query} />
	<Command.List>
		<Command.Empty>
			{#if searching}
				Searching…
			{:else if query.length > 0}
				No results found.
			{:else}
				Type to search…
			{/if}
		</Command.Empty>

		{#if searchResults.length > 0}
			<Command.Group heading="Results">
				{#each searchResults as result (result.url)}
					<Command.Item onSelect={() => navigate(result.url)}>
						<AbstractIcon name={icons.FileText.name} class="shrink-0" width="16" height="16" />
						<div class="flex min-w-0 flex-col gap-0.5 overflow-hidden">
							<span class="truncate">{result.meta.title}</span>
							{#if result.excerpt}
								<span class="text-base-content/60 truncate text-xs">
									{@html result.excerpt}
								</span>
							{/if}
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		{:else if !query}
			{#each navigation as section (section.title)}
				<Command.Group heading={section.title}>
					{#each section.items ?? [] as item (item.title)}
						{#if item.href}
							<Command.Item onSelect={() => navigate(item.href ?? '')}>
								<AbstractIcon name={icons.FileText.name} width="16" height="16" />
								<span>{item.title}</span>
							</Command.Item>
						{/if}
					{/each}
				</Command.Group>
			{/each}
		{/if}
	</Command.List>
</Command.Dialog>
