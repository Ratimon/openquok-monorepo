<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { stripHtmlToPlainText } from '$lib/utils/stripHtml';
	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		calendarEvent: any;
		variant: 'timeGrid' | 'dateGrid' | 'monthGrid';
	};

	let { calendarEvent, variant }: Props = $props();

	type CalendarEventWithPost = {
		id?: string;
		title?: string;
		start?: unknown;
		post?: { state?: string; content?: string; publishDate?: string; integrationId?: string | null };
		channel?: CreateSocialPostChannelViewModel | null;
	};

	const ev = $derived((calendarEvent ?? {}) as CalendarEventWithPost);
	const post = $derived((ev.post ?? {}) as NonNullable<CalendarEventWithPost['post']>);

	const state = $derived(String(post.state ?? '').toUpperCase());
	const content = $derived(stripHtmlToPlainText(String(post.content ?? '')) || 'no content');
	const isDraft = $derived(state === 'DRAFT' || state === 'DRAFTS' || state === 'DRAFTED' || state === 'DRAFT_POST');
	// Calendar chip: omit QUEUE/PUBLISHED labels; surface only drafts.
	const statusLabel = $derived(isDraft ? 'Draft' : '');

	const publishDateIso = $derived(typeof post.publishDate === 'string' ? post.publishDate : '');
	const isBeforeNow = $derived.by(() => {
		if (!publishDateIso) return false;
		const t = Date.parse(publishDateIso);
		if (!Number.isFinite(t)) return false;
		return t < Date.now();
	});

	const channelName = $derived(String(ev.title ?? ''));
	const providerBadgeIcon = $derived((ev.channel?.identifier ? ev.channel.identifier : null) as string | null);

	function iconForProvider(identifier: string | null) {
		if (!identifier) return icons.Link.name;
		if (identifier === 'instagram-standalone') return icons.InstagramGlyph.name;
		if (identifier === 'instagram-business') return icons.Instagram.name;
		if (identifier === 'instagram') return icons.Instagram.name;
		if (identifier === 'facebook') return icons.Facebook.name;
		if (identifier === 'youtube') return icons.YouTube.name;
		if (identifier === 'tiktok') return icons.TikTok.name;
		if (identifier === 'x') return icons.X.name;
		if (identifier === 'threads') return icons.Threads.name;
		return icons.Link.name;
	}
</script>

<div
	class="oq-calendar-item group relative flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-base-200/30 text-base-content {isBeforeNow ? 'oq-calendar-item--past' : ''}"
	data-variant={variant}
>
	<div class="oq-calendar-item__top flex h-6 min-h-6 items-center justify-center gap-2 bg-primary px-2 text-[11px] text-primary-content">
		<div class="truncate group-hover:hidden">{statusLabel || 'Scheduled'}</div>
		<div class="hidden items-center gap-2 group-hover:flex">
			<button type="button" class="hover:opacity-80" aria-label="Copy debug (coming soon)">
				<AbstractIcon name={icons.Copy.name} class="size-3" width="12" height="12" />
			</button>
			<button type="button" class="hover:opacity-80" aria-label="Preview (coming soon)">
				<AbstractIcon name={icons.Eye.name} class="size-3" width="12" height="12" />
			</button>
			<button type="button" class="hover:opacity-80" aria-label="Post statistics (coming soon)">
				<AbstractIcon name={icons.ChartBar.name} class="size-3" width="12" height="12" />
			</button>
			<button type="button" class="hover:opacity-80" aria-label="Delete (coming soon)">
				<AbstractIcon name={icons.Trash.name} class="size-3" width="12" height="12" />
			</button>
		</div>
	</div>

	<div class="oq-calendar-item__body flex min-h-0 flex-1 items-start gap-2 bg-base-100/10 p-2">
		<div class="relative mt-0.5 h-5 w-5 shrink-0">
			{#if ev.channel?.picture}
				<img src={ev.channel.picture} alt="" class="h-5 w-5 rounded-md object-cover" />
			{:else}
				<div class="h-5 w-5 rounded-md bg-base-200"></div>
			{/if}
			{#if providerBadgeIcon}
				<span
					class="absolute -bottom-0.5 -right-0.5 z-[1] flex size-[12px] items-center justify-center rounded-full border border-base-300 bg-base-100"
					aria-hidden="true"
				>
					<AbstractIcon name={iconForProvider(providerBadgeIcon)} class="size-2.5" width="10" height="10" />
				</span>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<div class="truncate text-xs font-medium text-base-content/90">
				{#if isDraft}Draft: {/if}{content}
			</div>
			{#if variant !== 'monthGrid'}
				<div class="truncate text-[11px] text-base-content/60">{channelName}</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.oq-calendar-item--past {
		filter: grayscale(1);
		opacity: 0.75;
	}

	.oq-calendar-item--past:hover::before {
		content: 'Date passed';
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 12px;
		opacity: 0.5;
		pointer-events: none;
	}
</style>

