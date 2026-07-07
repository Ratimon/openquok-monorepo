<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, tick } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const PANEL_GAP_PX = 12;
	const VIEWPORT_MARGIN_PX = 8;

	function portalToBody(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	type Tab = { id: string; label: string; disabled?: boolean };

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
		/** When set, renders a dismiss control with the close icon in the panel header. */
		onClose?: () => void;
	};

	let {
		tabs,
		selectedTabId = $bindable(''),
		open = $bindable(false),
		trigger,
		children,
		panelClass = '',
		panelAlign = 'end',
		rootClass = '',
		onClose
	}: Props = $props();

	let rootEl = $state.raw<HTMLDivElement | undefined>(undefined);
	let panelEl = $state.raw<HTMLDivElement | undefined>(undefined);
	let nubLeft = $state(0);
	let panelTop = $state(0);
	let panelLeft = $state(0);
	let panelReady = $state(false);

	let prevTabIndex = $state(0);
	let slideDir = $state(0);

	function firstSelectableTabId(): string | undefined {
		return tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id;
	}

	function syncSelectedFromTabs() {
		if (!tabs.length) return;
		const current = tabs.find((t) => t.id === selectedTabId);
		if (!current || current.disabled) {
			const nextId = firstSelectableTabId();
			if (nextId) selectedTabId = nextId;
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
		const tab = tabs.find((t) => t.id === id);
		if (!tab || tab.disabled) return;
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
		const center = tabRect.left + tabRect.width / 2 - panelLeft;
		nubLeft = Math.max(12, Math.min(center, panelEl.offsetWidth - 12));
	}

	async function updatePanelPosition() {
		if (!open || !rootEl || !panelEl || typeof window === 'undefined') return;
		await tick();
		const triggerRect = rootEl.getBoundingClientRect();
		const panelWidth = panelEl.offsetWidth;
		const panelHeight = panelEl.offsetHeight;

		let top = triggerRect.bottom + PANEL_GAP_PX;
		let left =
			panelAlign === 'start' ? triggerRect.left : triggerRect.right - panelWidth;

		const maxBottom = window.innerHeight - VIEWPORT_MARGIN_PX;
		if (top + panelHeight > maxBottom) {
			const aboveTop = triggerRect.top - panelHeight - PANEL_GAP_PX;
			if (aboveTop >= VIEWPORT_MARGIN_PX) {
				top = aboveTop;
			} else {
				top = Math.max(VIEWPORT_MARGIN_PX, maxBottom - panelHeight);
			}
		}

		const maxLeft = window.innerWidth - panelWidth - VIEWPORT_MARGIN_PX;
		left = Math.max(VIEWPORT_MARGIN_PX, Math.min(left, maxLeft));

		panelTop = top;
		panelLeft = left;
		panelReady = true;
		updateNubPosition();
	}

	$effect(() => {
		if (!open) {
			panelReady = false;
		}
	});

	$effect(() => {
		open;
		selectedTabId;
		tabs;
		panelClass;
		if (!open) return;
		let cancelled = false;
		void tick().then(() => {
			if (cancelled) return;
			requestAnimationFrame(() => {
				if (cancelled) return;
				void updatePanelPosition();
			});
		});
		return () => {
			cancelled = true;
		};
	});

	onMount(() => {
		const onDoc = (e: MouseEvent) => {
			if (!open) return;
			const t = e.target;
			if (!(t instanceof Node)) return;
			if (rootEl?.contains(t)) return;
			if (panelEl?.contains(t)) return;
			open = false;
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') open = false;
		};
		const onLayout = () => {
			if (!open) return;
			void updatePanelPosition();
		};
		document.addEventListener('click', onDoc);
		document.addEventListener('keydown', onKey);
		window.addEventListener('resize', onLayout);
		window.addEventListener('scroll', onLayout, true);
		return () => {
			document.removeEventListener('click', onDoc);
			document.removeEventListener('keydown', onKey);
			window.removeEventListener('resize', onLayout);
			window.removeEventListener('scroll', onLayout, true);
		};
	});
</script>

<div class="relative max-w-full {rootClass || 'w-fit'}" bind:this={rootEl}>
	{@render trigger({ toggle, expanded: open })}

	{#if open}
		<div
			bind:this={panelEl}
			use:portalToBody
			id="shift-dropdown-panel"
			class="border-base-300 bg-gradient-to-b from-base-200 via-base-200 to-base-300/90 fixed z-[200] min-w-[min(100vw-1rem,22rem)] max-w-[min(100vw-1rem,28rem)] rounded-xl border p-3 shadow-lg transition-opacity {panelReady
				? 'opacity-100'
				: 'pointer-events-none opacity-0'} {panelClass}"
			style:top="{panelTop}px"
			style:left="{panelLeft}px"
			role="dialog"
			aria-modal="true"
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

			<div class="relative mb-1 flex items-start gap-2">
				<div
					class="flex min-w-0 flex-1 flex-nowrap gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden {onClose
						? 'pr-8'
						: ''}"
				>
					{#each tabs as tab (tab.id)}
						<button
							id="shift-tab-{tab.id}"
							type="button"
							disabled={tab.disabled}
							class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:px-3.5 sm:text-sm {selectedTabId === tab.id
								? 'bg-secondary text-secondary-content shadow-sm ring-1 ring-secondary/30'
								: 'text-base-content/65 hover:bg-secondary/12 hover:text-base-content'}"
							onclick={() => setTab(tab.id)}
						>
							{tab.label}
						</button>
					{/each}
				</div>
				{#if onClose}
					<button
						type="button"
						class="text-base-content/60 hover:text-base-content hover:bg-base-300/60 absolute top-0 right-0 shrink-0 rounded-md p-1 transition-colors"
						aria-label="Close"
						onclick={onClose}
					>
						<AbstractIcon name={icons.X2.name} class="size-4" width="16" height="16" />
					</button>
				{/if}
			</div>

			<div class="relative mt-3 min-h-[4rem] overflow-x-clip">
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
