<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, tick } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	type Tab = { id: string; label: string };

	type TriggerProps = { toggle: () => void; expanded: boolean };

	type Props = {
		tabs: readonly Tab[];
		/** Which tab is active (platform / category). */
		selectedTabId?: string;
		/** Panel open state. */
		open?: boolean;
		/** Button or control that toggles the panel. */
		trigger: Snippet<[TriggerProps]>;
		/** Body below the tab row (format cards, etc.). */
		children: Snippet;
		panelClass?: string;
		/** Align panel under trigger: start = left (e.g. top-left “Resize”), end = right. */
		panelAlign?: 'start' | 'end';
		/** Extra classes on the outer wrapper (e.g. `w-full max-w-md` for a wide trigger). */
		rootClass?: string;
	};

	let {
		tabs,
		selectedTabId = $bindable(''),
		open = $bindable(false),
		trigger,
		children,
		panelClass = '',
		panelAlign = 'end',
		rootClass = ''
	}: Props = $props();

	let rootEl = $state.raw<HTMLDivElement | undefined>(undefined);
	let panelEl = $state.raw<HTMLDivElement | undefined>(undefined);
	let nubLeft = $state(0);

	let prevTabIndex = $state(0);
	let slideDir = $state(0);

	function syncSelectedFromTabs() {
		if (!tabs.length) return;
		if (!tabs.some((t) => t.id === selectedTabId)) {
			selectedTabId = tabs[0].id;
		}
	}

	$effect(() => {
		tabs;
		syncSelectedFromTabs();
	});

	$effect(() => {
		const i = tabs.findIndex((t) => t.id === selectedTabId);
		if (i >= 0) prevTabIndex = i;
	});

	function setTab(id: string) {
		const next = tabs.findIndex((t) => t.id === id);
		if (next < 0) return;
		slideDir = next > prevTabIndex ? 1 : next < prevTabIndex ? -1 : 0;
		prevTabIndex = next;
		selectedTabId = id;
	}

	function toggle() {
		open = !open;
	}

	function updateNubPosition() {
		if (!open || !panelEl || typeof document === 'undefined') return;
		const tabEl = document.getElementById(`shift-tab-${selectedTabId}`);
		if (!tabEl) return;
		const tabRect = tabEl.getBoundingClientRect();
		const panelRect = panelEl.getBoundingClientRect();
		const center = tabRect.left + tabRect.width / 2 - panelRect.left;
		nubLeft = Math.max(12, Math.min(center, panelRect.width - 12));
	}

	$effect(() => {
		open;
		selectedTabId;
		tabs;
		if (!open) return;
		let cancelled = false;
		void tick().then(() => {
			if (cancelled) return;
			requestAnimationFrame(() => updateNubPosition());
		});
		return () => {
			cancelled = true;
		};
	});

	onMount(() => {
		const onDoc = (e: MouseEvent) => {
			if (!open) return;
			const t = e.target;
			if (t instanceof Node && rootEl && !rootEl.contains(t)) {
				open = false;
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') open = false;
		};
		document.addEventListener('click', onDoc);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('click', onDoc);
			document.removeEventListener('keydown', onKey);
		};
	});
</script>

<div class="relative max-w-full {rootClass || 'w-fit'}" bind:this={rootEl}>
	{@render trigger({ toggle, expanded: open })}

	{#if open}
		<div
			bind:this={panelEl}
			id="shift-dropdown-panel"
			class="border-base-300 bg-gradient-to-b from-base-200 via-base-200 to-base-300/90 absolute top-[calc(100%+12px)] z-50 min-w-[min(100vw-1rem,22rem)] max-w-[min(100vw-1rem,28rem)] rounded-xl border p-3 shadow-lg {panelAlign === 'start'
				? 'left-0'
				: 'right-0'} {panelClass}"
			role="dialog"
			aria-modal="true"
			transition:fade={{ duration: 160, easing: cubicOut }}
		>
			<div
				class="pointer-events-none absolute -top-3 right-0 left-0 h-10"
				aria-hidden="true"
			></div>
			<!-- caret -->
			<span
				class="border-base-300 bg-base-200 absolute top-0 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rotate-45 rounded-tl border-b-0 border-l-0"
				style:left="{nubLeft}px"
			></span>

			<div class="relative flex flex-nowrap gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{#each tabs as tab (tab.id)}
					<button
						id="shift-tab-{tab.id}"
						type="button"
						class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-3.5 sm:text-sm {selectedTabId === tab.id
							? 'bg-secondary text-secondary-content shadow-sm ring-1 ring-secondary/30'
							: 'text-base-content/65 hover:bg-secondary/12 hover:text-base-content'}"
						onclick={() => setTab(tab.id)}
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<div class="relative mt-3 min-h-[4rem] overflow-hidden">
				{#key selectedTabId}
					<div
						class="will-change-transform"
						in:fly={{ duration: 220, x: slideDir === 0 ? 0 : 28 * slideDir, easing: cubicOut }}
					>
						{@render children()}
					</div>
				{/key}
			</div>
		</div>
	{/if}
</div>
