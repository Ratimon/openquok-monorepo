<script lang="ts">
	import type { CrossAccountPlugPreviewItem } from '$lib/ui/components/preview/crossAccountPlugPreview';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import { formatCrossAccountPlugDelayLabel } from '$lib/ui/components/preview/crossAccountPlugPreview';

	type Props = {
		items: CrossAccountPlugPreviewItem[];
	};

	let { items }: Props = $props();
</script>

{#if items.length > 0}
	<div class="mt-4 border-t border-base-300 pt-4">
		<div class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
			Cross-account plugs
		</div>
		<ul class="flex flex-col gap-2">
			{#each items as item (item.id)}
				<li class="rounded-lg border border-base-300/80 bg-base-200/20 px-3 py-2.5">
					<div class="flex items-center gap-2">
						{#if item.actorPicture?.trim()}
							<IntegrationChannelPicture
								profilePictureUrl={item.actorPicture}
								fallbackIcon={icons.User1.name}
								alt={item.actorName}
								class="h-8 w-8 min-h-8 min-w-8 max-h-8 max-w-8 shrink-0 rounded-full bg-base-200 object-cover"
							/>
						{:else}
							<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-200">
								<AbstractIcon name={icons.User1.name} class="size-4 text-base-content/60" width="16" height="16" />
							</span>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="text-sm font-semibold text-base-content">{item.actorName}</div>
							<div class="text-[11px] text-base-content/50">
								Reposted · {formatCrossAccountPlugDelayLabel(item.delayMs)}
							</div>
						</div>
						<AbstractIcon name={icons.Repeat2.name} class="size-4 shrink-0 text-base-content/50" width="16" height="16" />
					</div>
				</li>
			{/each}
		</ul>
	</div>
{/if}
