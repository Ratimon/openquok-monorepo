<script lang="ts">
	import type { AccountGettingStartedChecklistItem } from '$lib/ui/components/home/accountGettingStarted.types';

	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';
	import { hostedMarketingAnchorAttrs } from '$lib/utils/hostedMarketingHref';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		checklistItems: AccountGettingStartedChecklistItem[];
	};

	let { checklistItems }: Props = $props();
</script>

<div>
	<h3 class="text-sm font-semibold text-base-content">Welcome to OpenQuok!</h3>
	<p class="mt-1 text-sm text-base-content/65">
		Complete these steps to get your workspace ready.
	</p>
	<ul class="mt-4 space-y-3">
		{#each checklistItems as item (item.id)}
			<li class="flex items-center justify-between gap-3">
				<div class="flex min-w-0 items-center gap-3">
					<span
						class={cn(
							'flex size-5 shrink-0 items-center justify-center rounded-full border',
							item.done
								? 'border-success/40 bg-success/15 text-success'
								: 'border-base-content/20 bg-base-200/50 text-base-content/30'
						)}
						aria-hidden="true"
					>
						{#if item.done}
							<AbstractIcon name={icons.Check.name} class="size-3" width="12" height="12" />
						{/if}
					</span>
					{#if item.href}
						{@const marketing = hostedMarketingAnchorAttrs(item.href, page.url.origin)}
						<a
							href={marketing.href}
							target={marketing.target}
							rel={marketing.rel}
							class={cn(
								'text-sm hover:underline',
								item.done ? 'text-base-content/50 line-through' : 'text-base-content'
							)}
						>
							{item.label}
						</a>
					{:else}
						<span
							class={cn(
								'text-sm',
								item.done ? 'text-base-content/50 line-through' : 'text-base-content'
							)}
						>
							{item.label}
						</span>
					{/if}
				</div>
				{#if item.actionLabel && item.onAction && (!item.done || item.showActionWhenDone)}
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="shrink-0"
						disabled={item.disabled}
						onclick={item.onAction}
					>
						{item.actionLabel}
					</Button>
				{/if}
			</li>
		{/each}
	</ul>
</div>
