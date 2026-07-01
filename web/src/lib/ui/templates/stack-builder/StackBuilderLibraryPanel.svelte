<script lang="ts">
	import type { IconName } from '$data/icons';
	import type {
		StackBuilderLibraryItemKind,
		StackBuilderLibraryItemViewModel
	} from '$lib/stack-builder/stackBuilder.types';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		itemsVm: StackBuilderLibraryItemViewModel[];
		onAddItem: (itemVm: StackBuilderLibraryItemViewModel) => void;
	};

	type ExtensionLibraryGroup = {
		listingSlug: string;
		listingTitle: string;
		cliItems: StackBuilderLibraryItemViewModel[];
		mcpItems: StackBuilderLibraryItemViewModel[];
	};

	let { itemsVm, onAddItem }: Props = $props();

	const extensionGroups = $derived(groupItemsByExtension(itemsVm));

	function groupItemsByExtension(items: StackBuilderLibraryItemViewModel[]): ExtensionLibraryGroup[] {
		const groups = new Map<string, ExtensionLibraryGroup>();

		for (const item of items) {
			let group = groups.get(item.listingSlug);
			if (!group) {
				group = {
					listingSlug: item.listingSlug,
					listingTitle: item.listingTitle,
					cliItems: [],
					mcpItems: []
				};
				groups.set(item.listingSlug, group);
			}

			if (item.kind === 'cli') {
				group.cliItems.push(item);
			} else {
				group.mcpItems.push(item);
			}
		}

		return [...groups.values()];
	}

	function kindIcon(kind: StackBuilderLibraryItemKind): IconName {
		return kind === 'cli' ? icons.Terminal.name : icons.Bot.name;
	}

	function kindLabel(kind: StackBuilderLibraryItemKind): string {
		return kind === 'cli' ? 'CLI' : 'MCP';
	}
</script>

<div class="flex flex-col">
	<header class="border-b border-base-content/10 px-4 py-3">
		<h2 class="text-sm font-semibold text-base-content">Commands</h2>
		<p class="mt-1 text-xs text-base-content/60">Select a command or tool to add it to the workflow.</p>
	</header>

	<div class="max-h-[min(40vh,320px)] overflow-y-auto p-3">
		{#if extensionGroups.length === 0}
			<p class="rounded-lg border border-dashed border-base-content/15 p-4 text-sm text-base-content/60">
				Select at least one extension to populate the library.
			</p>
		{:else}
			<div class="space-y-4">
				{#each extensionGroups as group (group.listingSlug)}
					<section>
						<h3
							class="mb-2 text-xs font-semibold tracking-wide text-base-content/50 uppercase"
						>
							{group.listingTitle}
						</h3>

						<div class="space-y-2">
							{#if group.cliItems.length > 0}
								<div>
									<p class="mb-1.5 text-[11px] font-medium tracking-wide text-base-content/45 uppercase">
										CLI commands
									</p>
									<div class="flex flex-wrap gap-1.5">
										{#each group.cliItems as item (item.id)}
											<button
												type="button"
												class="inline-flex h-auto max-w-full items-center gap-1.5 rounded-lg border border-base-content/15 bg-base-100 px-2 py-1.5 text-left text-xs font-normal text-base-content transition hover:border-primary/40 hover:bg-base-200/50"
												title={item.description}
												onclick={() => onAddItem(item)}
											>
												<AbstractIcon
													name={kindIcon(item.kind)}
													class="size-3.5 shrink-0 text-base-content/55"
													width="14"
													height="14"
													aria-hidden="true"
												/>
												<span class="truncate font-mono">{item.name}</span>
												<span class="sr-only">({kindLabel(item.kind)})</span>
											</button>
										{/each}
									</div>
								</div>
							{/if}

							{#if group.mcpItems.length > 0}
								<div>
									<p class="mb-1.5 text-[11px] font-medium tracking-wide text-base-content/45 uppercase">
										MCP tools
									</p>
									<div class="flex flex-wrap gap-1.5">
										{#each group.mcpItems as item (item.id)}
											<button
												type="button"
												class="inline-flex h-auto max-w-full items-center gap-1.5 rounded-lg border border-base-content/15 bg-base-100 px-2 py-1.5 text-left text-xs font-normal text-base-content transition hover:border-primary/40 hover:bg-base-200/50"
												title={item.description}
												onclick={() => onAddItem(item)}
											>
												<AbstractIcon
													name={kindIcon(item.kind)}
													class="size-3.5 shrink-0 text-base-content/55"
													width="14"
													height="14"
													aria-hidden="true"
												/>
												<span class="truncate font-mono">{item.name}</span>
												<span class="sr-only">({kindLabel(item.kind)})</span>
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</section>
				{/each}
			</div>
		{/if}
	</div>
</div>
