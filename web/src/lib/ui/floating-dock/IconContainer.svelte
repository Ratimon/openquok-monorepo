<script lang="ts">
    import type { DockItem } from '$lib/ui/floating-dock/types';
	import type { DockPositionStore } from '$lib/ui/floating-dock/types';
	import {
		DOCK_DISTANCE_INPUT_RANGE,
		DOCK_PILL_TRANSITION,
		DOCK_WIDTH_OUTPUT_RANGE,
		DOCK_ICON_WIDTH_REST
	} from '$lib/ui/floating-dock/constants';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import NotificationDropdownPanel from '$lib/ui/components/notifications/NotificationDropdownPanel.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		containerX: DockPositionStore;
		mouseX: DockPositionStore;
		item: DockItem;
		iconSize?: string;
	};

	let { containerX, mouseX, item, iconSize = '20' }: Props = $props();

	let ref = $state<HTMLDivElement | undefined>(undefined);
	let dropdownOpen = $state(false);
	let notificationMenuOpen = $state(false);

	// Compute pill width in JS only — no svelte-motion useTransform for width (avoids NaN keyframe warnings)
	const [distMin, distMid, distMax] = DOCK_DISTANCE_INPUT_RANGE;
	const [wRest, wHover, wRestOut] = DOCK_WIDTH_OUTPUT_RANGE;

	function interpolateWidth(distance: number): number {
		const d = Math.max(distMin, Math.min(distMax, distance));
		if (d <= distMid) {
			const t = (d - distMin) / (distMid - distMin);
			return wRest + (wHover - wRest) * t;
		}
		const t = (d - distMid) / (distMax - distMid);
		return wHover + (wRestOut - wHover) * t;
	}

	let widthPx = $state(DOCK_ICON_WIDTH_REST);
	$effect(() => {
		const el = ref;
		const unsub = mouseX.subscribe((val) => {
			if (!el || !Number.isFinite(val)) {
				widthPx = DOCK_ICON_WIDTH_REST;
				return;
			}
			const bounds = el.getBoundingClientRect();
			const container = containerX.get();
			if (!Number.isFinite(container)) {
				widthPx = DOCK_ICON_WIDTH_REST;
				return;
			}
			const xDiffToContainerX = bounds.x - container;
			const d = val - bounds.width / 2 - xDiffToContainerX;
			widthPx = Number.isFinite(d) ? interpolateWidth(d) : DOCK_ICON_WIDTH_REST;
		});
		return unsub;
	});

	const pillStyle = $derived(`width: ${widthPx}px; transition: width ${DOCK_PILL_TRANSITION.duration ?? 0.2}s ease-out`);

	const iconClass = 'shrink-0 text-base-content/70 group-hover:text-base-content transition-colors';
	const hasSublinks = $derived(Array.isArray(item.sublinks) && item.sublinks.length > 0);
	const notificationsPreview = $derived(item.notificationsPreview);

	const NOTIFICATION_PREVIEW_RELOAD_MIN_MS = 30_000;
	let lastNotificationPreviewLoadAtMs = $state(0);
	let notificationPreviewLoadInFlight = $state(false);

	function handleNotificationMenuOpenChange(open: boolean) {
		const p = item.notificationsPreview;
		if (!open || !p) return;

		// Reduce redundant network calls when users rapidly toggle the bell.
		// We still allow refresh after a short TTL so the preview stays current.
		const now = Date.now();
		const hasAnyItems = Array.isArray(p.items) && p.items.length > 0;
		const shouldLoad =
			!notificationPreviewLoadInFlight &&
			!p.loading &&
			(!hasAnyItems || now - lastNotificationPreviewLoadAtMs > NOTIFICATION_PREVIEW_RELOAD_MIN_MS);

		if (!shouldLoad) return;
		notificationPreviewLoadInFlight = true;
		lastNotificationPreviewLoadAtMs = now;
		void Promise.resolve()
			.then(() => p.onOpen())
			.finally(() => {
				notificationPreviewLoadInFlight = false;
			});
	}

</script>

{#if item.notificationsPopover && notificationsPreview}
	<DropdownMenu.Root bind:open={notificationMenuOpen} onOpenChange={handleNotificationMenuOpenChange}>
		<DropdownMenu.Trigger
			title={item.title}
			aria-label={item.ariaLabel ?? item.title}
			class="group flex items-end justify-center rounded-full bg-transparent outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 overflow-visible"
		>
			<div
				bind:this={ref}
				class="relative flex aspect-square items-center justify-center overflow-visible rounded-full bg-base-200 hover:bg-base-300"
				style={pillStyle}
			>
				<div class="flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
					<AbstractIcon
						name={item.iconName}
						width={iconSize}
						height={iconSize}
						class={iconClass}
						focusable="false"
					/>
				</div>
				{#if item.badge != null && item.badge > 0}
					<span
						class="pointer-events-none absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-content"
						aria-hidden="true"
					>
						{item.badge > 99 ? '99+' : String(item.badge)}
					</span>
				{/if}
			</div>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="flex max-h-[min(75vh,32rem)] w-[min(100vw-2rem,32rem)] flex-col gap-0 overflow-hidden p-0"
			align="center"
			side="top"
			sideOffset={8}
		>
			<NotificationDropdownPanel
				previewItemsVm={notificationsPreview.items}
				previewLoading={notificationsPreview.loading}
				previewEmptyMessage={notificationsPreview.emptyMessage}
				totalItems={notificationsPreview.total}
				currentPage={notificationsPreview.currentPage}
				itemsPerPage={notificationsPreview.itemsPerPage}
				totalPages={notificationsPreview.totalPages}
				setCurrentPage={notificationsPreview.setCurrentPage}
				setItemsPerPage={notificationsPreview.setItemsPerPage}
				paginateToFirstPage={notificationsPreview.paginateToFirstPage}
				paginateToLastPage={notificationsPreview.paginateToLastPage}
				footerHref={notificationsPreview.footerHref}
				footerLabel={notificationsPreview.footerLabel}
			/>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else if hasSublinks}
	<DropdownMenu.Root bind:open={dropdownOpen}>
		<DropdownMenu.Trigger
			title={item.title}
			aria-label={item.ariaLabel ?? item.title}
			class="group flex items-end justify-center rounded-full bg-transparent outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 overflow-visible"
		>
			<div
				bind:this={ref}
				class="flex aspect-square items-center justify-center rounded-full bg-base-200 hover:bg-base-300 overflow-visible"
				style={pillStyle}
			>
				<div class="flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
					<AbstractIcon
						name={item.iconName}
						width={iconSize}
						height={iconSize}
						class={iconClass}
						focusable="false"
					/>
				</div>
			</div>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			align="center"
			side="top"
			sideOffset={8}
			class="min-w-[10rem] space-y-1 rounded-xl border border-base-300 bg-base-200 p-2 shadow-lg"
		>
			{#if item.dropdownHeader}
				<DropdownMenu.Label
					class="border-b border-base-300 px-2 py-2 text-sm font-medium text-base-content truncate"
				>
					{item.dropdownHeader}
				</DropdownMenu.Label>
			{/if}
			{#each item.sublinks ?? [] as sub (sub.label)}
				{#if sub.href != null}
					<DropdownMenu.Item class="cursor-pointer p-0 focus:bg-transparent data-[highlighted]:bg-transparent">
						<a
							href={sub.href}
							class={cn(
								'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-base-content/70 hover:bg-base-300 hover:text-base-content',
								sub?.customStyle
							)}
						>
							{#if sub.iconName != null}
								<AbstractIcon name={sub.iconName} width="16" height="16" class="shrink-0" focusable="false" />
							{/if}
							{sub.label}
						</a>
					</DropdownMenu.Item>
				{:else}
					<DropdownMenu.Item
						class={cn(
							'cursor-pointer gap-2 rounded-md py-2 text-sm font-medium text-base-content/70 data-[highlighted]:bg-base-300 data-[highlighted]:text-base-content',
							sub?.customStyle
						)}
						onclick={() => sub.onclick?.()}
					>
						{#if sub.iconName != null}
							<AbstractIcon name={sub.iconName} width="16" height="16" class="shrink-0" focusable="false" />
						{/if}
						{sub.label}
					</DropdownMenu.Item>
				{/if}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else if item.href != null}
	<a
		href={item.href}
		title={item.title}
		aria-label={item.ariaLabel ?? item.title}
		class="group flex items-end justify-center rounded-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 overflow-visible"
	>
		<div
			bind:this={ref}
			class="relative flex aspect-square items-center justify-center overflow-visible rounded-full bg-base-200 hover:bg-base-300"
			style={pillStyle}
		>
			<div class="flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
				<AbstractIcon
					name={item.iconName}
					width={iconSize}
					height={iconSize}
					class={iconClass}
					focusable="false"
				/>
			</div>
			{#if item.badge != null && item.badge > 0}
				<span
					class="pointer-events-none absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-content"
					aria-hidden="true"
				>
					{item.badge > 99 ? '99+' : String(item.badge)}
				</span>
			{/if}
		</div>
	</a>
{:else}
	<button
		type="button"
		title={item.title}
		aria-label={item.ariaLabel ?? item.title}
		class="group flex items-end justify-center rounded-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 overflow-visible"
		onclick={item.onclick}
	>
		<div
			bind:this={ref}
			class="relative flex aspect-square items-center justify-center overflow-visible rounded-full bg-base-200 hover:bg-base-300"
			style={pillStyle}
		>
			<div class="flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
				<AbstractIcon
					name={item.iconName}
					width={iconSize}
					height={iconSize}
					class={iconClass}
					focusable="false"
				/>
			</div>
			{#if item.badge != null && item.badge > 0}
				<span
					class="pointer-events-none absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-content"
					aria-hidden="true"
				>
					{item.badge > 99 ? '99+' : String(item.badge)}
				</span>
			{/if}
		</div>
	</button>
{/if}
