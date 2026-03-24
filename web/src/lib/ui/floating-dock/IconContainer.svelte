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
	import { cn } from '$lib/ui/helpers/common';
	import { fade } from 'svelte/transition';

	type Props = {
		containerX: DockPositionStore;
		mouseX: DockPositionStore;
		item: DockItem;
		iconSize?: string;
	};

	let { containerX, mouseX, item, iconSize = '20' }: Props = $props();

	let ref = $state<HTMLDivElement | undefined>(undefined);
	let triggerRef = $state<HTMLDivElement | undefined>(undefined);
	let dropdownOpen = $state(false);
	let panelPosition = $state<{ top: number; left: number } | null>(null);

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

	function updatePanelPosition() {
		const el = triggerRef;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		panelPosition = {
			top: rect.bottom + 8,
			left: rect.left + rect.width / 2
		};
	}

	function toggleDropdown() {
		if (!dropdownOpen) {
			updatePanelPosition();
		}
		dropdownOpen = !dropdownOpen;
	}
</script>

{#if hasSublinks}
	<div
		bind:this={triggerRef}
		class="group flex items-end justify-center rounded-full bg-transparent focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-base-200 overflow-visible relative"
	>
		<button
			type="button"
			title={item.title}
			aria-label={item.ariaLabel ?? item.title}
			aria-expanded={dropdownOpen}
			aria-haspopup="true"
			class="flex items-end justify-center rounded-full bg-transparent outline-none overflow-visible"
			onclick={toggleDropdown}
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
		</button>
		{#if panelPosition != null}
			<div
				class="fixed z-[100] pointer-events-none"
				style="top: {panelPosition.top}px; left: {panelPosition.left}px; transform: translateX(-50%);"
			>
				{#if dropdownOpen}
					<div
						class={cn(
							'min-w-[160px] space-y-1 p-2 rounded-xl border border-base-300 bg-base-200 shadow-lg pointer-events-auto'
						)}
						transition:fade={{ duration: 150 }}
					>
					{#if item.dropdownHeader}
						<div class="px-2 py-2 border-b border-base-300 text-sm font-medium text-base-content truncate">
							{item.dropdownHeader}
						</div>
					{/if}
					<ul class="space-y-1">
						{#each item.sublinks ?? [] as sub (sub.label)}
							<li>
								{#if sub.href != null}
									<a
										href={sub.href}
										class={cn(
											'flex items-center gap-2 rounded-md py-2 px-2 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-300',
											sub?.customStyle
										)}
									>
										{#if sub.iconName != null}
											<AbstractIcon name={sub.iconName} width="16" height="16" class="shrink-0" focusable="false" />
										{/if}
										{sub.label}
									</a>
								{:else}
									<button
										type="button"
										onclick={() => {
											sub.onclick?.();
											dropdownOpen = false;
										}}
										class={cn(
											'flex w-full items-center gap-2 rounded-md py-2 px-2 text-left text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-300',
											sub?.customStyle
										)}
									>
										{#if sub.iconName != null}
											<AbstractIcon name={sub.iconName} width="16" height="16" class="shrink-0" focusable="false" />
										{/if}
										{sub.label}
									</button>
								{/if}
							</li>
						{/each}
					</ul>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{:else if item.href != null}
	<a
		href={item.href}
		title={item.title}
		aria-label={item.ariaLabel ?? item.title}
		class="group flex items-end justify-center rounded-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 overflow-visible"
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
	</button>
{/if}
