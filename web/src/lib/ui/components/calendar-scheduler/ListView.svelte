<script lang="ts">
	import type { CalendarEventExternal } from '@schedule-x/calendar';

	import {
		formatListViewRowMeta,
		listViewRowAccentState,
		postStatusAccentTextClass
	} from '$lib/posts/utils/postStatusColors';
	import {
		formatLocalDateTime,
		groupRowsByDate,
		LIST_VIEW_PAGE_SIZE,
		normalizeRowsFromEvents,
		paginateRows,
		resolveListViewEmptyMessage,
		sortListRows,
		type ListViewRow
	} from '$lib/posts/utils/scheduler/listViewRows';
	import { cn } from '$lib/ui/helpers/common';
	import { socialProviderIcon } from '$data/social-providers';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';

	export type Props = {
		events: CalendarEventExternal[];
		/** Rows in the fetch window before post-type / tag filters; drives empty-state copy. */
		windowRowCount?: number;
		onOpenPostGroup?: (postGroup: string, focusPostId?: string, focusIntegrationId?: string) => void;
	};

	let { events, windowRowCount, onOpenPostGroup }: Props = $props();

	let pageIndex = $state(0);

	const sortedRows = $derived(sortListRows(normalizeRowsFromEvents(events)));
	const pagination = $derived(paginateRows(sortedRows, pageIndex, LIST_VIEW_PAGE_SIZE));
	const dateGroups = $derived(groupRowsByDate(pagination.rows));
	const emptyMessage = $derived(resolveListViewEmptyMessage(sortedRows.length, windowRowCount));

	$effect(() => {
		events;
		pageIndex = 0;
	});

	function rowKey(row: ListViewRow): string {
		return `${row.postGroup}:${row.postId ?? row.integrationId ?? ''}`;
	}
</script>

{#if emptyMessage}
	<div class="flex flex-1 flex-col items-center justify-center py-18">
		<div class="text-base text-base-content/70">
			{emptyMessage}
		</div>
	</div>
{:else}
	<div class="space-y-4">
		{#each dateGroups as group (group.dateKey)}
			<section class="space-y-2">
				<h3 class="sticky top-0 z-10 bg-base-100/95 px-1 py-1 text-xs font-semibold uppercase tracking-wide text-base-content/55 backdrop-blur-sm">
					{group.label}
				</h3>
				{#each group.rows as row (rowKey(row))}
					{@const dt = formatLocalDateTime(row.publishDateIso)}
					{@const iconName = socialProviderIcon(row.channelIdentifier)}
					{@const metaLabel = formatListViewRowMeta(row.publishDateIso, row.state, dt.time)}
					{@const accentState = listViewRowAccentState(row.publishDateIso, row.state)}
					<button
						type="button"
						class="hover:bg-base-200/60 flex w-full flex-col gap-1.5 rounded-lg border border-base-300 border-l-4 bg-base-100 px-3 py-2 text-start outline-none"
						style:border-left-color={row.chipTagColor}
						onclick={() => {
							const pid = row.postId?.trim();
							const iid = row.integrationId?.trim();
							onOpenPostGroup?.(row.postGroup, pid || undefined, iid || undefined);
						}}
					>
						{#if metaLabel}
							<div
								class={cn(
									'text-center text-xs font-semibold tracking-wide',
									postStatusAccentTextClass(accentState)
								)}
							>
								{metaLabel}
							</div>
						{/if}

						<div class="flex w-full items-center gap-3">
							<div class="relative h-9 w-9 shrink-0">
								<IntegrationChannelPicture
									profilePictureUrl={row.channelPicture}
									integrationId={row.integrationId}
									fallbackIcon={iconName}
									class="h-9 w-9 rounded-md object-cover"
								/>
								{#if row.channelIdentifier}
									<span
										class="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
										aria-hidden="true"
									>
										<AbstractIcon name={iconName} class="size-3.5" width="14" height="14" />
									</span>
								{/if}
							</div>

							<div class="min-w-0 flex-1">
								<div class="truncate text-xs font-semibold text-base-content/70">
									{row.channelName || 'Channel'}
								</div>
								<div class="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-base-content/90">
									{row.content || 'No content'}
								</div>
							</div>

							<AbstractIcon
								name={icons.ChevronRight.name}
								class="size-4 shrink-0 text-base-content/40"
								width="16"
								height="16"
							/>
						</div>
					</button>
				{/each}
			</section>
		{/each}
	</div>

	{#if pagination.totalCount > LIST_VIEW_PAGE_SIZE}
		<div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-3 text-sm text-base-content/70">
			<p>
				Showing {pagination.rangeStart}–{pagination.rangeEnd} of {pagination.totalCount}
			</p>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="btn btn-sm btn-ghost"
					disabled={pagination.pageIndex <= 0}
					onclick={() => {
						pageIndex = Math.max(0, pagination.pageIndex - 1);
					}}
				>
					Previous
				</button>
				<button
					type="button"
					class="btn btn-sm btn-ghost"
					disabled={pagination.pageIndex >= pagination.pageCount - 1}
					onclick={() => {
						pageIndex = Math.min(pagination.pageCount - 1, pagination.pageIndex + 1);
					}}
				>
					Load more
				</button>
			</div>
		</div>
	{/if}
{/if}
