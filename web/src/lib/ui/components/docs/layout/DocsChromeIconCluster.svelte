<script lang="ts">
	import { icons } from '$data/icons';

	import { url } from '$lib/utils/path';
	import { cn } from '$lib/ui/helpers/common';

	import DocsLocaleSwitcher from '$lib/ui/components/docs/DocsLocaleSwitcher.svelte';
	import ThemeSwitcher from '$lib/ui/daisyui/ThemeSwitcher.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	let { class: className }: { class?: string } = $props();

	/** Match docs header controls: base-200 hover, not ghost accent. */
	const headerIconHitClass = cn(
		'text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors outline-none',
		'inline-flex shrink-0 items-center justify-center'
	);
</script>

<Tooltip.Provider delayDuration={200}>
	<div class={cn('flex shrink-0 items-center gap-1', className)}>
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
