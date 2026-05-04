<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { SetGridTableRowViewModel } from '$lib/sets/SetGrid.presenter.svelte';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let { row }: ICellProps = $props();

	const vm = $derived(row as unknown as SetGridTableRowViewModel);
	const display = $derived(vm.channelsDisplay);
</script>

{#if !display}
	<span class="text-base-content/55 text-xs">{vm.channelsSummary}</span>
{:else}
	<div class="flex min-w-0 items-center gap-1.5 py-0.5">
		<div class="flex shrink-0 -space-x-2">
			{#each display.preview as ch, i (ch.integrationId)}
				<div
					class="relative h-8 w-8 shrink-0 rounded-md ring-2 ring-base-100"
					style="z-index: {10 - i}"
				>
					{#if ch.pictureUrl}
						<img src={ch.pictureUrl} alt="" class="h-8 w-8 rounded-md object-cover" />
					{:else}
						<div
							class="flex h-8 w-8 items-center justify-center rounded-md bg-base-200 text-[10px] font-semibold text-base-content/60"
						>
							{ch.displayName.slice(0, 2).toUpperCase()}
						</div>
					{/if}
					<span
						class="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
						aria-hidden="true"
					>
						<AbstractIcon
							name={socialProviderIcon(ch.providerIdentifier)}
							class="size-3"
							width="12"
							height="12"
						/>
					</span>
				</div>
			{/each}
		</div>
		{#if display.restCount > 0}
			<span class="text-base-content/60 shrink-0 text-[11px] font-semibold tabular-nums">
				+{display.restCount}
			</span>
		{/if}
	</div>
{/if}
