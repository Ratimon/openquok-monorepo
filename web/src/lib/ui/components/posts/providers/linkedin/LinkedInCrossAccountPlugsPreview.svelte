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
	<div class="pt-3">
		<span class="sr-only">Cross-account plugs</span>
		<ul class="flex flex-col">
			{#each items as item (item.id)}
				<li class="flex gap-2 border-t border-[#383A3D] py-3 first:border-t-0 first:pt-0">
					{#if item.actorPicture?.trim()}
						<IntegrationChannelPicture
							profilePictureUrl={item.actorPicture}
							fallbackIcon={icons.User1.name}
							alt={item.actorName}
							class="h-12 w-12 min-h-12 min-w-12 max-h-12 max-w-12 shrink-0 rounded-[4px] bg-[#38434F]"
						/>
					{:else}
						<span
							class="inline-flex h-12 w-12 min-h-12 min-w-12 max-h-12 max-w-12 shrink-0 items-center justify-center rounded-[4px] bg-[#38434F]"
						>
							<AbstractIcon
								name={icons.User1.name}
								class="size-6 text-[#A3A3A3]"
								width="24"
								height="24"
							/>
						</span>
					{/if}
					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<div class="truncate text-[14px] font-semibold leading-5 text-[#E9E9E9]">
									{item.actorName}
								</div>
								<div class="truncate text-xs leading-4 text-[#A3A3A3]">
									{item.kind === 'comment' ? 'Comment' : 'Reshare'} ·
									{formatCrossAccountPlugDelayLabel(item.delayMs)}
								</div>
							</div>
							<div class="flex shrink-0 items-center gap-1 text-xs text-[#A3A3A3]">
								<span>Scheduled</span>
								<AbstractIcon name={icons.MoreHorizontal.name} class="size-4" width="16" height="16" />
							</div>
						</div>
						{#if item.kind === 'comment'}
							<p class="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#E9E9E9]">
								{item.message || 'Comment from the selected channel after publish.'}
							</p>
						{:else}
							<p class="mt-1 text-sm leading-relaxed text-[#A3A3A3]">
								Reshared this post from another channel.
							</p>
						{/if}
						<div class="mt-2 flex items-center gap-1 text-xs font-semibold text-[#A3A3A3]">
							<span>Like</span>
							<span aria-hidden="true">|</span>
							<span>Reply</span>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
{/if}
