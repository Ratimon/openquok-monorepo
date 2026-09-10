<script lang="ts">
	import type { CrossAccountPlugPreviewItem } from '$lib/ui/components/preview/crossAccountPlugPreview';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import ThreadsReplyEngagementMock from '$lib/ui/components/posts/providers/threads/ThreadsReplyEngagementMock.svelte';
	import { formatCrossAccountPlugDelayLabel } from '$lib/ui/components/preview/crossAccountPlugPreview';

	type Props = {
		items: CrossAccountPlugPreviewItem[];
		/** Connect the vertical thread line from the main post avatar. */
		threadContinuesFromRoot?: boolean;
	};

	let { items, threadContinuesFromRoot = false }: Props = $props();
</script>

{#if items.length > 0}
	<div class="pt-2">
		<span class="sr-only">Cross-account plugs</span>
		<div class="relative">
			{#if threadContinuesFromRoot}
				<div
					class="pointer-events-none absolute left-5 top-0 z-0 h-3 w-px -translate-x-1/2 bg-base-300"
					aria-hidden="true"
				></div>
			{/if}
			<ul class="flex flex-col">
				{#each items as item, index (item.id)}
					<li class="flex gap-3">
						<div class="relative flex w-10 shrink-0 flex-col items-center">
							{#if index < items.length - 1}
								<div
									class="absolute left-1/2 top-10 bottom-0 z-0 w-px -translate-x-1/2 bg-base-300"
									aria-hidden="true"
								></div>
							{/if}
							<div class="relative z-[1] h-10 w-10 shrink-0">
								{#if item.actorPicture?.trim()}
									<IntegrationChannelPicture
										profilePictureUrl={item.actorPicture}
										fallbackIcon={icons.User1.name}
										alt={item.actorName}
										class="h-10 w-10 min-h-10 min-w-10 max-h-10 max-w-10 shrink-0 rounded-full bg-base-200 object-cover ring-2 ring-base-100"
									/>
								{:else}
									<span
										class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 ring-2 ring-base-100"
									>
										<AbstractIcon
											name={icons.User1.name}
											class="size-5 text-base-content/60"
											width="20"
											height="20"
										/>
									</span>
								{/if}
								<span
									class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-base-100 ring-1 ring-base-300"
								>
									<AbstractIcon
										name={icons.Threads.name}
										class="size-3.5 text-base-content"
										width="14"
										height="14"
									/>
								</span>
							</div>
						</div>
						<div class="min-w-0 flex-1 pb-5 last:pb-0">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<div class="truncate text-[15px] font-bold leading-5 text-base-content">
										{item.actorName}
									</div>
									<div class="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-base-content/50">
										Cross-account comment
									</div>
								</div>
								<span class="inline-flex shrink-0 text-base-content/45" aria-hidden="true">
									<AbstractIcon name={icons.MoreHorizontal.name} class="size-5" width="20" height="20" />
								</span>
							</div>
							<div class="mt-0.5 text-[13px] leading-4 text-base-content/45">
								{formatCrossAccountPlugDelayLabel(item.delayMs)}
							</div>
							<p class="mt-1 whitespace-pre-wrap text-[15px] leading-6 text-base-content">
								{item.message || 'Comment from the selected channel after publish.'}
							</p>
							<ThreadsReplyEngagementMock commentCount={0} />
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
