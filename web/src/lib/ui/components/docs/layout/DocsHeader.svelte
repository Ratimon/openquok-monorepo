<script lang="ts">
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

	let { socialLinks = [] }: { socialLinks?: SocialLink[] } = $props();

	/** Match DocsSocialLinks / header cluster */
	const headerIconHitClass = cn(
		'text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors outline-none',
		'inline-flex shrink-0 items-center justify-center'
	);
</script>

<header
	class="bg-base-100 border-base-300 sticky top-0 z-50 flex h-14 shrink-0 flex-row items-center justify-between border-b px-3"
>
	<div class="flex items-center gap-2">
		<Sidebar.Trigger />
		<AutoBreadcrumb />
	</div>

	<Tooltip.Provider delayDuration={200}>
		<div class="flex items-center gap-1">
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
</header>
