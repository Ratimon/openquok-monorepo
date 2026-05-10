<script lang="ts">
	import type { DocsDocTabId, DocsTabDefinition } from '$lib/docs/types';
	import { docsTabHref } from '$lib/docs/navigation';
	import { url } from '$lib/utils/path';
	import { cn } from '$lib/ui/helpers/common';

	import { icons } from '$data/icons';

	import AutoBreadcrumb from '$lib/ui/components/docs/nav/DocsAutoBreadcrumb.svelte';
	import DocsLocaleSwitcher from '$lib/ui/components/docs/DocsLocaleSwitcher.svelte';
	import SocialLinks, { type SocialLink } from '$lib/ui/components/docs/nav/DocsSocialLinks.svelte';
	import ThemeSwitcher from '$lib/ui/daisyui/ThemeSwitcher.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tooltip from '$lib/ui/tooltip';
	import * as Sidebar from '$lib/ui/sidebar-main/index.js';

	let {
		socialLinks = [],
		docsTabs = [] as DocsTabDefinition[],
		activeDocsTabId,
		locale
	}: {
		socialLinks?: SocialLink[];
		docsTabs?: DocsTabDefinition[];
		activeDocsTabId?: DocsDocTabId;
		locale?: string;
	} = $props();

	/** Match DocsSocialLinks / header cluster */
	const headerIconHitClass = cn(
		'text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors outline-none',
		'inline-flex shrink-0 items-center justify-center'
	);

	let showDocsTabs = $derived(Boolean(docsTabs.length > 0 && activeDocsTabId));
</script>

{#snippet headerIconCluster()}
	<Tooltip.Provider delayDuration={200}>
		<div class="flex shrink-0 items-center gap-1">
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props: triggerProps })}
						<span {...triggerProps} class="inline-flex">
							<Button
								variant="ghost"
								size="icon"
								class={headerIconHitClass}
								href={url('/')}
								aria-label="Home"
							>
								<AbstractIcon name={icons.House.name} class="size-4" width="16" height="16" />
							</Button>
						</span>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" sideOffset={6}>Home</Tooltip.Content>
			</Tooltip.Root>
			<div class="hidden items-center md:flex">
				<SocialLinks links={socialLinks} />
			</div>
			<DocsLocaleSwitcher variant="header" />
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props: triggerProps })}
						<span {...triggerProps} class="inline-flex">
							<ThemeSwitcher />
						</span>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" sideOffset={6}>Switch theme</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</Tooltip.Provider>
{/snippet}

<header class="bg-base-100 border-base-300 sticky top-0 z-50 flex shrink-0 flex-col border-b">
	{#if showDocsTabs}
		<div
			class="border-base-300 flex min-h-11 items-center justify-between gap-2 border-b px-2 md:min-h-12 md:px-3"
		>
			<nav
				class="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				aria-label="Documentation sections"
			>
				{#each docsTabs as tab (tab.id)}
					<a
						href={docsTabHref(tab.id, locale)}
						class={cn(
							'hover:text-base-content shrink-0 whitespace-nowrap border-b-2 px-2.5 py-2 text-sm font-medium transition-colors md:px-3',
							activeDocsTabId === tab.id
								? 'border-primary text-base-content'
								: 'border-transparent text-base-content/65'
						)}
					>
						{tab.label}
					</a>
				{/each}
			</nav>
			{@render headerIconCluster()}
		</div>
	{/if}
	<div
		class="flex h-14 min-h-14 flex-row items-center justify-between gap-2 px-3"
	>
		<div class="flex min-w-0 flex-1 items-center gap-2">
			<Sidebar.Trigger />
			<AutoBreadcrumb />
		</div>
		{#if !showDocsTabs}
			{@render headerIconCluster()}
		{/if}
	</div>
</header>
