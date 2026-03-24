<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import type { SettingsSidebarContext } from '$lib/ui/sidebar-main/types';
	import * as Sidebar from '$lib/ui/sidebar-main/index';
	import { cn } from '$lib/ui/helpers/common';
	import { SETTINGS_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';

	let {
		children,
		contextKey,
		centerContent = true
	}: { children?: Snippet; contextKey?: string; centerContent?: boolean } = $props();

	const ctx = (() => getContext<SettingsSidebarContext>(contextKey ?? SETTINGS_SIDEBAR_KEY))();
	if (!ctx) {
		throw new Error('SidebarSecondary must be used under a layout that provides sidebar context.');
	}

	const currentSection = $derived(ctx.getCurrentSection());
	const sectionTitle = $derived(ctx.getSectionTitle());
	const basePath = $derived(ctx.getBasePath());
	const headerTitle = $derived(ctx.getHeaderTitle?.() ?? 'Settings');

	function sectionUrl(id: string): string {
		return ctx.getItemHref ? ctx.getItemHref(id) : `${basePath}?section=${id}`;
	}
</script>

<Sidebar.Provider
	style="--sidebar-width: 14rem; --sidebar-width-icon: 3rem;"
	class="flex w-full flex-1 flex-row min-h-0 rounded-lg border border-base-300 overflow-hidden bg-base-100"
>
	<Sidebar.Root collapsible="none" class="w-[--sidebar-width] shrink-0 flex-col border-r border-base-300 rounded-l-lg">
		<Sidebar.Header class="border-b border-base-300 pb-3">
			<h2 class="px-2 text-lg font-semibold text-base-content">
				{headerTitle}</h2>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Sections</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each ctx.navItems as item (item.id)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={currentSection === item.id}
									class={cn(
										currentSection === item.id &&
											"border-l-2 border-primary bg-base-200 pl-[calc(0.5rem-2px)]"
									)}
								>
									{#snippet child({ props })}
										<a
											href={sectionUrl(item.id)}
											class="flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left text-sm"
											{...props}
										>
											<span>{item.label}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>

	<Sidebar.Inset class="min-w-0 flex-1 overflow-auto pl-2 pr-6 py-6">
		<div class={cn('w-full max-w-3xl space-y-8', centerContent && 'mx-auto')}>
			<h1 class="text-2xl font-bold text-base-content">
				{sectionTitle}</h1>
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
