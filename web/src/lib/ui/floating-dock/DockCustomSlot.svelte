<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DockPositionStore } from '$lib/ui/floating-dock/types';
	import {
		DOCK_DISTANCE_INPUT_RANGE,
		DOCK_PILL_TRANSITION,
		DOCK_WIDTH_OUTPUT_RANGE,
		DOCK_ICON_WIDTH_REST
	} from '$lib/ui/floating-dock/constants';
	import { fade } from 'svelte/transition';

	type Props = {
		containerX: DockPositionStore;
		mouseX: DockPositionStore;
		title?: string;
		children?: Snippet;
	};

	let { containerX, mouseX, title = 'Theme', children }: Props =
		$props();

	let ref = $state<HTMLDivElement | undefined>(undefined);

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

	let hovered = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group flex items-end justify-center overflow-visible"
	title={title}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	<div
		bind:this={ref}
		class="flex aspect-square items-center justify-center rounded-full bg-base-200 hover:bg-base-300 overflow-visible"
		style={pillStyle}
	>
			{#if hovered && title}
				<div
					class="px-2 py-1 whitespace-nowrap rounded-md bg-base-100 border border-base-300 text-base-content text-xs absolute left-1/2 -translate-x-1/2 -top-9 z-10 shadow-lg pointer-events-none"
					transition:fade={{ duration: 150 }}
				>
					{title}
				</div>
			{/if}
			<div class="relative w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
				{#if children}
					{@render children()}
			{/if}
		</div>
	</div>
</div>
