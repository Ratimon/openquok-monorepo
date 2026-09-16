<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { SchedulerCalendarEvent } from '$lib/posts/scheduler.types';

	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
	import {
		DEFAULT_TAG_CHIP_COLOR,
		calendarChipStatusClasses
	} from '$lib/posts/utils/tagChipTheme';
	import { normalizePostStatusSurface } from '$lib/posts/utils/postStatusColors';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import {
		CALENDAR_POST_DRAG_MIME,
		canDragCalendarPost,
		markCalendarChipClickSuppressed,
		serializeCalendarPostDrag,
		setActiveCalendarPostDrag
	} from '$lib/ui/components/calendar-scheduler/calendarDnd';
	import { formatPublishTimeLabel } from '$lib/utils/postingSchedulePreferences';
	import {
		formatRepeatScheduleLabel,
		parseRepeatIntervalDays
	} from '$lib/posts/utils/repeatScheduleLabel';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';

	type SlotSummaryItem = {
		postId?: string;
		postGroup: string;
		integrationId?: string;
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

	type CalendarEventWithPost = SchedulerCalendarEvent & {
		channel?: CreateSocialPostChannelViewModel | null;
	};

	const ev = $derived((calendarEvent ?? {}) as CalendarEventWithPost);
	const post = $derived((ev.post ?? {}) as NonNullable<SchedulerCalendarEvent['post']>);

	const postState = $derived(String(post.state ?? '').toUpperCase());
	const content = $derived(stripHtmlToPlainText(String(post.content ?? '')) || 'no content');
	const postError = $derived(String((post as { error?: string | null }).error ?? '').trim());
	const hasError = $derived(postError.length > 0);
	const isDraft = $derived(postState === 'DRAFT');
	const isScheduled = $derived(normalizePostStatusSurface(postState) === 'scheduled');
	const isFailed = $derived(hasError || postState === 'ERROR' || postState === 'FAILED');
	const isPublished = $derived(postState === 'PUBLISHED');

	const chipTagColor = $derived(
		String(ev.chipTagColor ?? '').trim() || DEFAULT_TAG_CHIP_COLOR
	);
	const headerStyle = $derived(`background-color: ${chipTagColor}`);
	const statusChrome = $derived(
		calendarChipStatusClasses(hasError && !isPublished ? 'ERROR' : postState)
	);
	const chipTitle = $derived(isFailed && postError ? postError : undefined);

	const publishDateIso = $derived(typeof post.publishDate === 'string' ? post.publishDate : '');
	const publishTimeLabel = $derived.by(() => {
		if (!publishDateIso) return '';
		return formatPublishTimeLabel(publishDateIso);
	});
	const isBeforeNow = $derived.by(() => {
		if (!publishDateIso) return false;
		const t = Date.parse(publishDateIso);
		if (!Number.isFinite(t)) return false;
		return t < Date.now();
	});

	const channelName = $derived(String(ev.title ?? ''));
	const providerBadgeIcon = $derived((ev.channel?.identifier ? ev.channel.identifier : null) as string | null);

	const postGroup = $derived(String((post as { postGroup?: string }).postGroup ?? ''));
	const postCount = $derived(Array.isArray(ev.posts) ? ev.posts.length : 1);
	const multiPosts = $derived(postCount > 1);

	const repeatIntervalDays = $derived.by(() => {
		const raw = (post as { intervalInDays?: number | null; interval_in_days?: number | null })
			.intervalInDays ??
			(post as { interval_in_days?: number | null }).interval_in_days ??
			null;
		return parseRepeatIntervalDays(raw);
	});
	const isRepeating = $derived(repeatIntervalDays > 0);
	const repeatLabel = $derived(formatRepeatScheduleLabel(repeatIntervalDays));
	const slotSummary = $derived(
		Array.isArray(ev.slotSummary) ? (ev.slotSummary as SlotSummaryItem[]) : []
	);
	const previewContent = $derived(content);
	const previewChannelName = $derived(channelName);
	const previewChannels = $derived(slotSummary.slice(0, 3));
	const hiddenChannelCount = $derived(Math.max(0, postCount - previewChannels.length));

	const postId = $derived(String((post as { id?: string }).id ?? '').trim());
	const isDraggable = $derived(
		canDragCalendarPost({ multiPosts, state: postState }) && Boolean(postId && postGroup)
	);

	function dragPayload() {
		return {
			postId,
			postGroup,
			state: postState,
			intervalInDays: repeatIntervalDays > 0 ? repeatIntervalDays : null,
			sourcePublishDateIso: publishDateIso
		};
	}

	function handleDragStart(e: DragEvent) {
		if (!isDraggable || !e.dataTransfer) return;
		const payload = dragPayload();
		e.dataTransfer.effectAllowed = 'move';
		const serialized = serializeCalendarPostDrag(payload);
		e.dataTransfer.setData(CALENDAR_POST_DRAG_MIME, serialized);
		e.dataTransfer.setData('text/plain', serialized);
		setActiveCalendarPostDrag(payload);
	}

	function handleDragEnd() {
		setActiveCalendarPostDrag(null);
		markCalendarChipClickSuppressed();
	}

	function previewChannelKey(entry: SlotSummaryItem, index: number): string {
		const postId = String(entry.postId ?? '').trim();
		const publishDate = String(entry.publishDate ?? '').trim();
		const integrationId = String(entry.integrationId ?? '').trim();
		if (postId && publishDate) return `${postId}@${publishDate}`;
		if (integrationId) return `${integrationId}-${index}`;
		return `ch-${index}`;
	}
</script>

<button
	type="button"
	class="oq-calendar-item group relative flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-base-200/30 text-base-content {statusChrome.chipRing} {isBeforeNow ? 'oq-calendar-item--past' : ''}"
	class:cursor-grab={isDraggable}
	class:active:cursor-grabbing={isDraggable}
	draggable={isDraggable}
	title={chipTitle}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	data-variant={variant}
	data-post-group={postGroup}
	data-post-id={String((post as { id?: string }).id ?? '').trim()}
	data-integration-id={String((post as { integrationId?: string | null }).integrationId ?? '').trim()}
	data-multi-post={multiPosts ? 'true' : 'false'}
	data-repeating={isRepeating ? 'true' : 'false'}
	data-repeat-label={isRepeating ? repeatLabel : ''}
	data-slot-summary={multiPosts ? encodeURIComponent(JSON.stringify(slotSummary satisfies SlotSummaryItem[])) : ''}
>
	<span
		class="pointer-events-none absolute right-0.5 top-0.5 z-[2] rounded bg-black/15 p-0.5 text-white/85 opacity-80"
		aria-hidden="true"
	>
		<AbstractIcon name={icons.MenuLine.name} class="size-3" width="12" height="12" />
	</span>

	{#if variant === 'monthGrid'}
		<div
			class="flex h-full min-h-0 items-center gap-2 px-2 text-[11px] text-white text-shadow-tags"
			style={headerStyle}
		>
			<div class="flex shrink-0 items-center gap-1">
				{#if multiPosts}
					<div class="relative h-4 w-8 shrink-0">
						{#each previewChannels as entry, i (previewChannelKey(entry, i))}
							{@const entryIcon = socialProviderIcon(entry.channelIdentifier)}
							<div class="absolute top-0" style={`left:${i * 6}px`}>
								<IntegrationChannelPicture
									profilePictureUrl={entry.channelPicture}
									integrationId={entry.integrationId}
									fallbackIcon={entryIcon}
									class="h-4 w-4 rounded object-cover ring-1 ring-white/30"
								/>
							</div>
						{/each}
						{#if previewChannels.length === 0}
							<div
								class="absolute left-0 top-0 flex h-4 w-4 items-center justify-center rounded bg-white/20 text-[9px] font-semibold text-white"
							>
								{(previewChannelName || 'CH').slice(0, 1).toUpperCase()}
							</div>
						{/if}
					</div>
				{:else}
					<div class="relative h-4 w-4 shrink-0">
						{#if ev.channel?.picture}
							<IntegrationChannelPicture
								profilePictureUrl={ev.channel.picture}
								integrationId={ev.channel.id ?? (post as { integrationId?: string }).integrationId}
								fallbackIcon={socialProviderIcon(providerBadgeIcon ?? 'threads')}
								class="h-4 w-4 rounded object-cover"
							/>
						{:else}
							<div class="h-4 w-4 rounded bg-white/20"></div>
						{/if}
						{#if providerBadgeIcon}
							<span
								class="absolute -bottom-0.5 -right-0.5 z-[1] flex size-[10px] items-center justify-center rounded-full border border-white/30 bg-base-100"
								aria-hidden="true"
							>
								<AbstractIcon name={socialProviderIcon(providerBadgeIcon)} class="size-2" width="8" height="8" />
							</span>
						{/if}
					</div>
				{/if}
				{#if isRepeating}
					<span
						class="z-[2] flex size-[12px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80 shadow-sm"
						title={repeatLabel}
						aria-label={repeatLabel}
					>
						<AbstractIcon name={icons.RefreshCw.name} class="size-2.5" width="10" height="10" />
					</span>
				{/if}
			</div>
			<div class="min-w-0 flex-1 truncate">
				{previewChannelName || 'Channel'}
			</div>
			{#if hiddenChannelCount > 0}
				<div class="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
					+{hiddenChannelCount}
				</div>
			{/if}
		</div>
	{:else}
		<div
			class="oq-calendar-item__top flex h-6 min-h-6 items-center justify-between gap-2 px-2 text-[11px] text-white text-shadow-tags"
			style={headerStyle}
		>
			{#if multiPosts}
				<div class="flex min-w-0 flex-1 items-center gap-1">
					<div class="relative h-4 w-8 shrink-0">
						{#each previewChannels as entry, i (previewChannelKey(entry, i))}
							{@const entryIcon = socialProviderIcon(entry.channelIdentifier)}
							<div class="absolute top-0" style={`left:${i * 6}px`}>
								<IntegrationChannelPicture
									profilePictureUrl={entry.channelPicture}
									integrationId={entry.integrationId}
									fallbackIcon={entryIcon}
									class="h-4 w-4 rounded object-cover ring-1 ring-white/30"
								/>
							</div>
						{/each}
						{#if previewChannels.length === 0}
							<div
								class="absolute left-0 top-0 flex h-4 w-4 items-center justify-center rounded bg-white/20 text-[9px] font-semibold text-white"
							>
								{(previewChannelName || 'CH').slice(0, 1).toUpperCase()}
							</div>
						{/if}
					</div>
					{#if isRepeating}
						<span
							class="z-[2] flex size-[12px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80 shadow-sm"
							title={repeatLabel}
							aria-label={repeatLabel}
						>
							<AbstractIcon name={icons.RefreshCw.name} class="size-2.5" width="10" height="10" />
						</span>
					{/if}
					<div class="min-w-0 flex-1 truncate">
						{previewChannelName || 'Channel'}
					</div>
				</div>
			{:else}
				<div class="flex min-w-0 flex-1 items-center gap-1">
					<div class="relative h-4 w-4 shrink-0">
						{#if ev.channel?.picture}
							<IntegrationChannelPicture
								profilePictureUrl={ev.channel.picture}
								integrationId={ev.channel.id ?? (post as { integrationId?: string }).integrationId}
								fallbackIcon={socialProviderIcon(providerBadgeIcon ?? 'threads')}
								class="h-4 w-4 rounded object-cover"
							/>
						{:else}
							<div class="h-4 w-4 rounded bg-white/20"></div>
						{/if}
					</div>
					{#if isRepeating}
						<span
							class="z-[2] flex size-[12px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80 shadow-sm"
							title={repeatLabel}
							aria-label={repeatLabel}
						>
							<AbstractIcon name={icons.RefreshCw.name} class="size-2.5" width="10" height="10" />
						</span>
					{/if}
					<div class="min-w-0 flex-1 truncate">
						{previewChannelName || 'Channel'}
					</div>
				</div>
			{/if}

			{#if hiddenChannelCount > 0}
				<div class="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
					+{hiddenChannelCount}
				</div>
			{/if}
		</div>

		<div class="oq-calendar-item__body flex min-h-0 flex-1 items-start gap-2 bg-base-100/10 p-2">
			<div class="min-w-0 flex-1">
				<div class="flex min-w-0 items-center gap-1 text-xs font-medium text-base-content/90">
					{#if isScheduled}
						<AbstractIcon
							name={icons.CalendarClock.name}
							class="size-3 shrink-0 text-primary"
							width="12"
							height="12"
							aria-hidden="true"
						/>
					{/if}
					<span class="min-w-0 truncate">
						{#if isDraft}<span class="font-semibold text-warning">Draft:</span>{/if}{previewContent ||
							'no content'}
					</span>
				</div>
				<div class="truncate text-[11px] text-base-content/60">
					{previewChannelName}{publishTimeLabel ? ` @ ${publishTimeLabel}` : ''}{#if hiddenChannelCount > 0} · +{hiddenChannelCount} more{/if}
				</div>
			</div>
			{#if statusChrome.publishedPill}
				<span class="{statusChrome.publishedPill} shrink-0">Published</span>
			{/if}
		</div>
	{/if}
</button>

<style>
	.oq-calendar-item--past {
		filter: grayscale(1);
		opacity: 0.75;
	}

	/* Tooltip bubble (matches the "Date passed" style). */
	.oq-calendar-item:hover::before {
		content: 'Open';
		position: absolute;
		right: 6px;
		top: 6px;
		max-width: calc(100% - 1.25rem);
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

	.oq-calendar-item:hover::before {
		opacity: 0.85;
	}

	/* Secondary tooltip: repeating label at center (only for repeating posts). */
	.oq-calendar-item[data-repeating='true']:hover::after {
		content: attr(data-repeat-label);
		position: absolute;
		left: 50%;
		bottom: 6px;
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

	.oq-calendar-item[data-repeating='true']:hover::after {
		opacity: 0.85;
	}

	.oq-calendar-item--past:hover::before {
		content: 'Date passed';
	}

	/* Month grid cells are tighter: keep the hint minimal. */
	.oq-calendar-item[data-variant='monthGrid']:hover::before {
		content: 'Open';
	}
</style>
