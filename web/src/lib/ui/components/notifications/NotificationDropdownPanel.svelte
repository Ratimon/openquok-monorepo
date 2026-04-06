<script lang="ts">
	import type { NotificationItemVm } from '$lib/notifications/GetNotification.presenter.svelte';

	type Props = {
		previewItems: NotificationItemVm[];
		previewLoading: boolean;
		previewEmptyMessage: string | null;
		footerHref?: string;
		footerLabel?: string;
	};

	let {
		previewItems,
		previewLoading,
		previewEmptyMessage,
		footerHref,
		footerLabel = 'View all notifications'
	}: Props = $props();
</script>

<div class="max-h-64 overflow-y-auto px-2 py-2">
	{#if previewLoading}
		<p class="px-2 py-3 text-sm text-base-content/60">
			Loading…
		</p>
	{:else if previewEmptyMessage}
		<p class="px-2 py-3 text-sm text-base-content/70">
			{previewEmptyMessage}
		</p>
	{:else if previewItems.length === 0}
		<p class="px-2 py-3 text-sm text-base-content/60">
			No notifications yet.
		</p>
	{:else}
		<ul class="flex flex-col gap-1">
			{#each previewItems as row (row.id)}
				<li
					class="rounded-md border border-base-300/80 bg-base-100 px-2 py-2 text-left text-sm text-base-content"
				>
					<time class="block text-[10px] text-base-content/50" datetime={row.createdAt}>
						{row.createdAtLabel}
					</time>
					<p class="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-snug">
						{row.content}
					</p>
					{#if row.link}
						<a
							href={row.link}
							class="mt-1 inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
						>
							Open link
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
{#if footerHref}
	<div class="border-t border-base-300 bg-base-200/80 px-2 py-2">
		<a
			href={footerHref}
			class="block rounded-md px-2 py-2 text-center text-sm font-medium text-primary hover:bg-base-300/50"
		>
			{footerLabel}
		</a>
	</div>
{/if}
