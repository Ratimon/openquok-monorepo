<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { NavItem } from '$lib/docs/types';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { icons } from '$data/icon';

	import { cn } from '$lib/ui/helpers/common';

	import * as Collapsible from '$lib/ui/collapsible/index.js';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/ui/sidebar-main/index.js';
	import { docsConfig } from '$lib/docs/constants';
	import { sidebarMenuButtonVariants } from '$lib/ui/sidebar-main/sidebar-menu-button-variants';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SocialLinks, { type SocialLink } from '$lib/ui/components/docs/nav/DocsSocialLinks.svelte';
	import DocsSearchCommand from '$lib/ui/components/docs/search/DocsSearchCommand.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	let {
		navigation = [],
		socialLinks = [],
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { navigation?: NavItem[]; socialLinks?: SocialLink[] } = $props();

	function isActive(href: string | undefined): boolean {
		if (!href) return false;
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	function sectionHasActive(section: NavItem): boolean {
		return section.items?.some((item) => isActive(item.href)) ?? false;
	}
</script>

<Sidebar.Root
	bind:ref
	class="min-h-svh self-stretch h-auto max-md:h-full"
	aria-label="Documentation navigation"
	{...restProps}
>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				{#if docsConfig.versions}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class={cn(
								sidebarMenuButtonVariants({ size: 'lg' }),
								'data-[state=open]:bg-base-200 w-full'
							)}
						>
							<div
								class="bg-primary text-primary-content flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<AbstractIcon name={icons.LayoutTemplate.name} class="size-4" width="16" height="16" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-semibold">
									{docsConfig.site.title}
								</span>
								<span>{docsConfig.versions?.current}</span>
							</div>
							<AbstractIcon name={icons.ChevronsUpDown.name} class="ms-auto" width="16" height="16" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)" align="start">
							{#each docsConfig.versions.versions as version (version.label)}
								<DropdownMenu.Item
									onclick={() => {
										if (version.href.startsWith('http')) {
											window.open(version.href, '_blank');
										} else {
											goto(version.href);
										}
									}}
								>
									{version.label}
									{#if version.label.includes(docsConfig.versions?.current ?? '')}
										<AbstractIcon name={icons.Check.name} class="ms-auto" width="16" height="16" />
									{/if}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Sidebar.MenuButton size="lg">
						{#snippet child({ props })}
							<a href="/docs" {...props}>
								<div
									class="bg-primary text-primary-content flex aspect-square size-8 items-center justify-center rounded-lg"
								>
									<AbstractIcon name={icons.GalleryVerticalEnd.name} class="size-4" width="16" height="16" />
								</div>
								<div class="flex flex-col gap-0.5 leading-none">
									<span class="font-medium">{docsConfig.site.title}</span>
									<span class="text-base-content/60 text-xs">Docs</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				{/if}
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>
				Documentation
			</Sidebar.GroupLabel>
			<Sidebar.Menu>
				{#each navigation as section (section.title)}
					<Sidebar.MenuItem>
						<Collapsible.Root open={sectionHasActive(section)} class="group/collapsible w-full">
							<Collapsible.Trigger
								class={cn(
									sidebarMenuButtonVariants({ size: 'default' }),
									'[&[data-state=open]>svg:last-child]:rotate-90'
								)}
							>
								{#if section.iconName}
									<AbstractIcon name={section.iconName} class="size-4" width="16" height="16" />
								{/if}
								<span>{section.title}</span>
								<AbstractIcon
									name={icons.ChevronRight.name}
									class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
									width="16"
									height="16"
								/>
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub>
									{#each section.items ?? [] as item (item.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton isActive={isActive(item.href)}>
												{#snippet child({ props })}
													<a href={item.href ?? '#'} {...props}>
														<span>{item.title}</span>
													</a>
												{/snippet}
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						</Collapsible.Root>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer class="border-base-300 mt-auto shrink-0 border-t p-3">
		<div class="mb-2 w-full">
			<DocsSearchCommand {navigation} />
		</div>
		<div class="flex flex-wrap items-center gap-0.5">
			<Tooltip.Provider delayDuration={200}>
				<SocialLinks links={socialLinks} />
			</Tooltip.Provider>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
