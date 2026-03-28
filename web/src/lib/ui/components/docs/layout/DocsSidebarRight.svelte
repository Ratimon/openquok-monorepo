<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { NavItem, TableOfContentsItem } from '$lib/docs/types';

	import { toc } from '$lib/docs/utils/toc-state.svelte';

	import * as Collapsible from '$lib/ui/collapsible/index.js';
	import DocsSearchCommand from '$lib/ui/components/docs/search/DocsSearchCommand.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import * as Sidebar from '$lib/ui/sidebar-main/index.js';

	let {
		ref = $bindable(null),
		navigation = [],
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { navigation?: NavItem[] } = $props();

	interface TocSection {
		parent: TableOfContentsItem;
		children: TableOfContentsItem[];
	}

	function buildTree(items: TableOfContentsItem[]): TocSection[] {
		const sections: TocSection[] = [];
		let current: TocSection | null = null;

		for (const item of items) {
			if (item.depth === 2) {
				current = { parent: item, children: [] };
				sections.push(current);
			} else if (current) {
				current.children.push(item);
			} else {
				sections.push({ parent: item, children: [] });
			}
		}

		return sections;
	}

	function sectionHasActive(section: TocSection): boolean {
		return (
			toc.activeId === section.parent.id || section.children.some((c) => toc.activeId === c.id)
		);
	}

	function handleClick(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
			toc.activeId = id;
		}
	}

	$effect(() => {
		const items = toc.items;
		if (items.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						toc.activeId = entry.target.id;
					}
				}
			},
			{ rootMargin: '-80px 0px -80% 0px' }
		);

		for (const item of items) {
			const el = document.getElementById(item.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	});
</script>

<Sidebar.Root
	bind:ref
	collapsible="none"
	class="border-base-300 sticky top-0 hidden h-svh shrink-0 border-s lg:flex"
	{...restProps}
>
	<Sidebar.Header class="p-3">
		<DocsSearchCommand {navigation} />
	</Sidebar.Header>
	<Sidebar.Content>
		{#if toc.items.length > 0}
			<Sidebar.Group>
				<Sidebar.GroupLabel>On this page</Sidebar.GroupLabel>
				<Sidebar.Menu>
					{#each buildTree(toc.items) as section (section.parent.id)}
						{#if section.children.length > 0}
							<Sidebar.MenuItem>
								<Collapsible.Root open={sectionHasActive(section)} class="group/collapsible w-full">
									<Collapsible.Trigger
										class={cn(
											'text-base-content ring-base-content/20 hover:bg-base-content/10 flex w-full items-center gap-2 rounded-md p-2 text-start text-sm outline-none focus-visible:ring-2',
											sectionHasActive(section) ? 'font-medium' : ''
										)}
									>
										<span>{section.parent.text}</span>
										<AbstractIcon
											name="ChevronDown"
											class="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
											width="16"
											height="16"
										/>
									</Collapsible.Trigger>
									<Collapsible.Content>
										<Sidebar.MenuSub>
											{#each section.children as subItem (subItem.id)}
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton isActive={toc.activeId === subItem.id}>
														{#snippet child({ props })}
															<button {...props} type="button" onclick={() => handleClick(subItem.id)}>
																<span>{subItem.text}</span>
															</button>
														{/snippet}
													</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											{/each}
										</Sidebar.MenuSub>
									</Collapsible.Content>
								</Collapsible.Root>
							</Sidebar.MenuItem>
						{:else}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									class={toc.activeId === section.parent.id ? 'font-medium' : ''}
									onclick={() => handleClick(section.parent.id)}
								>
									<span>{section.parent.text}</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/if}
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>
</Sidebar.Root>
