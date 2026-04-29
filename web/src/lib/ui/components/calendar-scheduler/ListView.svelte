<script lang="ts">
	import type { CalendarEventExternal } from '@schedule-x/calendar';

	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
	import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';
	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type SlotSummaryItem = {
		postGroup?: string;
		content?: string;
		channelPicture?: string;
		channelName?: string;
		publishDate?: string;
		state?: string;
		channelIdentifier?: string;
	};

	export type Props = {
		events: CalendarEventExternal[];
		onOpenPostGroup?: (postGroup: string) => void;
	};

	let { events, onOpenPostGroup }: Props = $props();

	type ListRow = {
		postGroup: string;
		content: string;
		channelPicture?: string;
		channelName?: string;
		channelIdentifier?: string;
		publishDateIso?: string;
		state?: string;
	};

	function parsePublishMs(iso: string | undefined): number {
		if (!iso) return Number.NaN;
		const ms = Date.parse(iso);
		return Number.isFinite(ms) ? ms : Number.NaN;
	}

	function formatLocalDateTime(iso: string | undefined): { date: string; time: string } {
		const ms = parsePublishMs(iso);
		if (!Number.isFinite(ms)) return { date: '', time: '' };
		const d = new Date(ms);
		return {
			date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
			time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};
	}

	function normalizeRowsFromEvents(evs: CalendarEventExternal[]): ListRow[] {
		const rows: ListRow[] = [];

		for (const ev of evs ?? []) {
			const summary = ((ev as any)?.slotSummary ?? null) as SlotSummaryItem[] | null;
			const posts = (Array.isArray(summary) && summary.length ? summary : [((ev as any)?.post ?? {}) as SlotSummaryItem])
				.filter(Boolean);

			for (const s of posts) {
				const postGroup = String(s.postGroup ?? (ev as any)?.post?.postGroup ?? '').trim();
				if (!postGroup) continue;
				rows.push({
					postGroup,
					content: stripHtmlToPlainText(String(s.content ?? '')).trim(),
					channelPicture: s.channelPicture ? String(s.channelPicture) : undefined,
					channelName: s.channelName ? String(s.channelName) : (ev as any)?.title ? String((ev as any).title) : undefined,
					channelIdentifier: s.channelIdentifier ? String(s.channelIdentifier) : undefined,
					publishDateIso: typeof s.publishDate === 'string' ? s.publishDate : undefined,
					state: s.state ? String(s.state) : undefined
				});
			}
		}

		// Dedupe by postGroup (some buckets may contain duplicated slotSummary entries after merges).
		const byGroup = new Map<string, ListRow>();
		for (const r of rows) {
			if (!byGroup.has(r.postGroup)) byGroup.set(r.postGroup, r);
		}
		return Array.from(byGroup.values());
	}

	const upcomingRows = $derived.by(() => {
		const nowMs = Date.now();
		return normalizeRowsFromEvents(events)
			.filter((r) => {
				const ms = parsePublishMs(r.publishDateIso);
				// If publishDate is missing, still show it (drafts), but keep them after dated items.
				if (!Number.isFinite(ms)) return true;
				return ms >= nowMs;
			})
			.sort((a, b) => {
				const am = parsePublishMs(a.publishDateIso);
				const bm = parsePublishMs(b.publishDateIso);
				if (Number.isFinite(am) && Number.isFinite(bm)) return am - bm;
				if (Number.isFinite(am)) return -1;
				if (Number.isFinite(bm)) return 1;
				return a.postGroup.localeCompare(b.postGroup);
			});
	});
</script>

{#if upcomingRows.length === 0}
	<div class="flex flex-1 flex-col items-center justify-center py-18">
		<div class="text-base text-base-content/70">
            No upcoming posts scheduled
        </div>
	</div>
{:else}
	<div class="space-y-2">
		{#each upcomingRows as row (row.postGroup)}
			{@const dt = formatLocalDateTime(row.publishDateIso)}
			{@const iconName = socialProviderIcon(row.channelIdentifier)}
			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-start outline-none"
				onclick={() => onOpenPostGroup?.(row.postGroup)}
			>
				<div class="relative h-9 w-9 shrink-0">
					{#if row.channelPicture}
						<img src={row.channelPicture} alt="" class="h-9 w-9 rounded-md object-cover" />
					{:else}
						<div class="flex h-9 w-9 items-center justify-center rounded-md bg-base-200 text-[10px] font-semibold text-base-content/60">
							{(row.channelName || 'CH').slice(0, 2).toUpperCase()}
						</div>
					{/if}
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
					<div class="flex items-center justify-between gap-2">
						<div class="truncate text-xs font-semibold text-base-content/70">
							{row.channelName || 'Channel'}
						</div>
						<div class="shrink-0 text-xs text-base-content/55">
							{#if dt.date || dt.time}
								{dt.date}{dt.time ? ` · ${dt.time}` : ''}
							{:else}
								Draft
							{/if}
						</div>
					</div>
					<div class="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-base-content/90">
						{row.content || 'No content'}
					</div>
				</div>

				<div class="shrink-0 text-xs text-base-content/50">
					{row.state ? String(row.state).toUpperCase() : 'Open'}
				</div>
				<AbstractIcon name={icons.ChevronRight.name} class="size-4 text-base-content/40" width="16" height="16" />
			</button>
		{/each}
	</div>
{/if}

