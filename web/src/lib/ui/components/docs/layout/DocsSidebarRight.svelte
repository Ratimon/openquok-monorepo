<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { NavItem } from '$lib/docs/types';

	import { toc } from '$lib/docs/utils/toc-state.svelte';

	import DocsSearchCommand from '$lib/ui/components/docs/search/DocsSearchCommand.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import * as Sidebar from '$lib/ui/sidebar-main/index.js';

	let {
		ref = $bindable(null),
		navigation = [],
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { navigation?: NavItem[] } = $props();

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

<!-- Visibility matches desktop left nav (md+): avoid hiding the TOC rail between md and lg. -->
<div class="max-md:hidden shrink-0">
	<Sidebar.Root
		bind:ref
		collapsible="none"
		class="border-base-300 sticky top-0 h-svh border-s"
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
						{#each toc.items as item (item.id)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									class={cn(
										'text-start text-sm',
										toc.activeId === item.id ? 'font-medium' : ''
									)}
									isActive={toc.activeId === item.id}
									style={`padding-inline-start: ${Math.max(0, item.depth - 2) * 12}px`}
									onclick={() => handleClick(item.id)}
								>
									<span>{item.text}</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.Group>
			{/if}
		</Sidebar.Content>
	</Sidebar.Root>
</div>
