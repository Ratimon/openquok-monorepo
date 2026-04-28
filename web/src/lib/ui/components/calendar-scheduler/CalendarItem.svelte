<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { stripHtmlToPlainText } from '$lib/utils/stripHtml';
	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';
	type SlotSummaryItem = {
		postGroup: string;
		publishDate?: string;
		content: string;
		channelPicture?: string;
		channelName?: string;
		state?: string;
		channelIdentifier?: string;
	};

	type Props = {
		calendarEvent: any;
		variant: 'timeGrid' | 'dateGrid' | 'monthGrid';
	};

	let { calendarEvent, variant }: Props = $props();

	type CalendarEventWithPost = {
		id?: string;
		title?: string;
		start?: unknown;
		post?: {
			state?: string;
			content?: string;
			publishDate?: string;
			integrationId?: string | null;
			error?: string | null;
		};
		posts?: {
			state?: string;
			content?: string;
			publishDate?: string;
			integrationId?: string | null;
			postGroup?: string;
			error?: string | null;
		}[];
		channel?: CreateSocialPostChannelViewModel | null;
	};

	const ev = $derived((calendarEvent ?? {}) as CalendarEventWithPost);
	const post = $derived((ev.post ?? {}) as NonNullable<CalendarEventWithPost['post']>);

	const postState = $derived(String(post.state ?? '').toUpperCase());
	const content = $derived(stripHtmlToPlainText(String(post.content ?? '')) || 'no content');
	const hasError = $derived(Boolean((post as any)?.error));
	const isDraft = $derived(postState === 'DRAFT');
	const isFailed = $derived(hasError || postState === 'FAILED' || postState === 'ERROR');
	const isPublished = $derived(postState === 'PUBLISHED');
	// Calendar chip: omit QUEUE/PUBLISHED labels; surface only drafts.
	const statusLabel = $derived(isFailed ? 'Failed' : isDraft ? 'Draft' : isPublished ? 'Published' : '');

	const publishDateIso = $derived(typeof post.publishDate === 'string' ? post.publishDate : '');
	const publishTimeLabel = $derived.by(() => {
		if (!publishDateIso) return '';
		const ms = Date.parse(publishDateIso);
		if (!Number.isFinite(ms)) return '';
		return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	});
	const isBeforeNow = $derived.by(() => {
		if (!publishDateIso) return false;
		const t = Date.parse(publishDateIso);
		if (!Number.isFinite(t)) return false;
		return t < Date.now();
	});

	const channelName = $derived(String(ev.title ?? ''));
	const providerBadgeIcon = $derived((ev.channel?.identifier ? ev.channel.identifier : null) as string | null);

	const postGroup = $derived(String((post as any)?.postGroup ?? ''));
	const postCount = $derived(Array.isArray((ev as any).posts) ? ((ev as any).posts as any[]).length : 1);
	const multiPosts = $derived(postCount > 1);
	const slotSummary = $derived(
		Array.isArray((ev as any).slotSummary) ? (((ev as any).slotSummary as any[]) ?? []) : []
	);
	// Always use the representative post selected by the scheduler (upcoming-first).
	const previewContent = $derived(content);
	const previewChannelName = $derived(channelName);
	const previewPictures = $derived(
		(slotSummary as SlotSummaryItem[])
			.map((x) => (x?.channelPicture ? String(x.channelPicture) : ''))
			.filter(Boolean)
			.slice(0, 3)
	);

</script>

<button
	type="button"
	class="oq-calendar-item group relative flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-base-200/30 text-base-content {isBeforeNow ? 'oq-calendar-item--past' : ''}"
	data-variant={variant}
	data-post-group={postGroup}
	data-multi-post={multiPosts ? 'true' : 'false'}
	data-slot-summary={multiPosts ? encodeURIComponent(JSON.stringify(slotSummary satisfies SlotSummaryItem[])) : ''}
>
	<span
		class="pointer-events-none absolute right-0.5 top-0.5 z-[2] rounded bg-primary/15 p-0.5 text-primary-content/85 opacity-80"
		aria-hidden="true"
	>
		<AbstractIcon name={icons.MenuLine.name} class="size-3" width="12" height="12" />
	</span>

	{#if variant === 'monthGrid'}
		<div class="flex h-full min-h-0 items-center gap-2 bg-primary px-2 text-[11px] text-primary-content">
			<div class="relative h-4 w-4 shrink-0">
				{#if ev.channel?.picture}
					<img src={ev.channel.picture} alt="" class="h-4 w-4 rounded object-cover" />
				{:else}
					<div class="h-4 w-4 rounded bg-primary-content/20"></div>
				{/if}
				{#if providerBadgeIcon}
					<span
						class="absolute -bottom-0.5 -right-0.5 z-[1] flex size-[10px] items-center justify-center rounded-full border border-primary/30 bg-base-100"
						aria-hidden="true"
					>
						<AbstractIcon name={socialProviderIcon(providerBadgeIcon)} class="size-2" width="8" height="8" />
					</span>
				{/if}
			</div>
			<div class="min-w-0 flex-1 truncate">{statusLabel || 'Scheduled'}</div>
			{#if postCount > 1}
				<div class="ml-1 rounded bg-primary-content/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary-content/90">
					+{postCount - 1}
				</div>
			{/if}
		</div>
	{:else}
		<div class="oq-calendar-item__top flex h-6 min-h-6 items-center justify-between gap-2 bg-primary px-2 text-[11px] text-primary-content">
			{#if multiPosts}
				<div class="relative h-4 w-8 shrink-0">
					{#each previewPictures as pic, i (i)}
						<img
							src={pic}
							alt=""
							class="absolute top-0 h-4 w-4 rounded object-cover ring-1 ring-primary"
							style={`left:${i * 6}px`}
						/>
					{/each}
					{#if previewPictures.length === 0}
						<div class="absolute left-0 top-0 flex h-4 w-4 items-center justify-center rounded bg-primary-content/20 text-[9px] font-semibold text-primary-content/90">
							{(previewChannelName || 'CH').slice(0, 1).toUpperCase()}
						</div>
					{/if}
				</div>
			{:else}
				<div class="relative h-4 w-4 shrink-0">
					{#if ev.channel?.picture}
						<img src={ev.channel.picture} alt="" class="h-4 w-4 rounded object-cover" />
					{:else}
						<div class="h-4 w-4 rounded bg-primary-content/20"></div>
					{/if}
				</div>
			{/if}

			<div class="min-w-0 flex-1 truncate text-center">{statusLabel || 'Scheduled'}</div>

			{#if postCount > 1}
				<div class="shrink-0 rounded bg-primary-content/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary-content/90">
					+{postCount - 1}
				</div>
			{/if}
		</div>

		<div class="oq-calendar-item__body flex min-h-0 flex-1 items-start gap-2 bg-base-100/10 p-2">
			<div class="min-w-0 flex-1">
				<div class="truncate text-xs font-medium text-base-content/90">
					{#if isDraft}Draft: {/if}{previewContent || 'no content'}
				</div>
				<div class="truncate text-[11px] text-base-content/60">
					{previewChannelName}{publishTimeLabel ? ` @ ${publishTimeLabel}` : ''}{#if multiPosts} · +{postCount - 1} more{/if}
				</div>
			</div>
		</div>
	{/if}
</button>

<style>
	.oq-calendar-item--past {
		filter: grayscale(1);
		opacity: 0.75;
	}

	/* Tooltip bubble (matches the "Date passed" style). */
	.oq-calendar-item:hover::after {
		content: 'Open';
		position: absolute;
		left: 50%;
		top: 6px;
		transform: translateX(-50%);
		max-width: calc(100% - 0.75rem);
		padding: 0.15rem 0.4rem;
		border-radius: 0.5rem;
		background: rgba(0, 0, 0, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		pointer-events: none;
		white-space: normal;
		text-align: center;
		overflow-wrap: anywhere;
		font-weight: 600;
		font-size: 0.7rem;
		line-height: 1.1;
		letter-spacing: 0.01em;
		color: rgba(255, 255, 255, 0.75);
		opacity: 0;
		transition: opacity 120ms ease;
		z-index: 3;
	}

	.oq-calendar-item:hover::after {
		opacity: 0.85;
	}

	.oq-calendar-item--past:hover::after {
		content: 'Date passed';
	}

	/* Month grid cells are tighter: keep the hint minimal. */
	.oq-calendar-item[data-variant='monthGrid']:hover::after {
		content: 'Open';
	}
</style>

