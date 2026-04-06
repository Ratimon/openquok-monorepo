<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DockItem, DockPositionStore } from '$lib/ui/floating-dock/types';

	import { get, writable } from 'svelte/store';
	import IconContainer from '$lib/ui/floating-dock/IconContainer.svelte';
	import DockCustomSlot from '$lib/ui/floating-dock/DockCustomSlot.svelte';
	import DockSeparator from '$lib/ui/floating-dock/DockSeparator.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	export type DockMotionSlotProps = {
		mouseX: DockPositionStore;
		containerX: DockPositionStore;
	};

	type Props = {
		items: DockItem[];
		class?: string;
		/** Optional slot for custom dock nodes (e.g. ThemeSwitcher) - gets same motion effect as icons */
		children?: Snippet;
		/** If true, render customSlots or children first, then a separator, then items */
		childrenFirst?: boolean;
		/** When childrenFirst, use this to render multiple custom slots (e.g. Theme + Feedback). Receives motion values. */
		customSlots?: Snippet<[DockMotionSlotProps]>;
		/** When childrenFirst, 0-based indices after which to show a separator (e.g. [2] = separator after 3rd item) */
		separatorAfterItemIndices?: number[];
	};

	let {
		items,
		class: className = '',
		children,
		childrenFirst = false,
		customSlots,
		separatorAfterItemIndices = []
	}: Props = $props();

	const mouseXStore = writable(Infinity);
	const containerXStore = writable(0);
	const mouseX = { subscribe: mouseXStore.subscribe, get: () => get(mouseXStore) };
	const containerX = { subscribe: containerXStore.subscribe, get: () => get(containerXStore) };

	let containerRef: HTMLDivElement;

	const showSeparatorAfterItem = $derived(new Set(separatorAfterItemIndices));
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerRef}
	onmouseleave={() => mouseXStore.set(Infinity)}
	onmousemove={(e) => {
		const rect = containerRef?.getBoundingClientRect();
		if (rect) {
			mouseXStore.set(e.clientX - rect.left);
			containerXStore.set(rect.x);
		}
	}}
	class="flex h-16 items-end gap-2 rounded-2xl bg-base-200 px-3 pb-3 pt-1 overflow-visible {className}"
	role="navigation"
	aria-label="Dock"
>
		<Tooltip.Provider delayDuration={200}>
		{#if childrenFirst && customSlots}
			{@render customSlots({ mouseX, containerX })}
			<DockSeparator />
		{:else if childrenFirst && children}
			<DockCustomSlot {mouseX} {containerX} title="Theme" children={children}>
			</DockCustomSlot>
			<DockSeparator />
		{/if}
		{#each items as item, i (item.title)}
			{#if item.notificationsPopover}
				<span class="flex items-end justify-center rounded-full bg-transparent overflow-visible">
					<IconContainer {mouseX} {containerX} {item} />
				</span>
			{:else}
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props: triggerProps })}
							<span {...triggerProps} class="flex items-end justify-center rounded-full bg-transparent overflow-visible">
								<IconContainer {mouseX} {containerX} {item} />
							</span>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content side="top" sideOffset={8}>
						{item.title}
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}
			{#if showSeparatorAfterItem.has(i)}
				<DockSeparator />
			{/if}
		{/each}
		{#if !childrenFirst && children}
			<DockCustomSlot {mouseX} {containerX} title="Theme" children={children}>
			</DockCustomSlot>
		{/if}
		</Tooltip.Provider>
</div>
