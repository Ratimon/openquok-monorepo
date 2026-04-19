<script lang="ts">
	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";
	import { setTabsContext, type TabsOrientation } from "$lib/ui/tabs/tabs-context";

	type Props = WithoutChildrenOrChild<{
		value?: string;
		defaultValue?: string;
		orientation?: TabsOrientation;
		class?: string;
		"data-slot"?: string;
		/** When true, do not call setContext — use when a parent (e.g. DocsTabs) owns tab context for panels outside this root. */
		skipContext?: boolean;
	}>;

	let {
		value = $bindable<string | undefined>(),
		defaultValue,
		orientation = "horizontal",
		class: className,
		"data-slot": dataSlot = "tabs",
		skipContext = false,
		children
	}: Props = $props();

	/** Uncontrolled selection; ensures triggers/panels re-render when `value` is not bound from a parent. */
	let localSelected = $state<string | undefined>(undefined);

	/**
	 * Keyboard navigation order for triggers. Kept as a plain array (not `$state`): mutating it from
	 * trigger mount/unmount `effect`s must not invalidate this component, or those effects re-run and
	 * cause `effect_update_depth_exceeded` (register → parent state → child cleanup → unregister → …).
	 */
	const triggerOrder: string[] = [];
	const triggerEls = new Map<string, Set<HTMLElement>>();

	$effect(() => {
		if (value !== undefined) {
			localSelected = value;
		}
	});

	function getValue() {
		return value !== undefined ? value : (localSelected ?? defaultValue);
	}

	const tabState = $state<{ current: string | undefined }>({ current: undefined });

	$effect(() => {
		tabState.current = getValue();
	});

	function setValue(next: string) {
		localSelected = next;
		value = next;
	}

	function registerTrigger(triggerValue: string, el: HTMLElement) {
		if (!triggerOrder.includes(triggerValue)) triggerOrder.push(triggerValue);
		const set = triggerEls.get(triggerValue) ?? new Set<HTMLElement>();
		set.add(el);
		triggerEls.set(triggerValue, set);
	}

	function unregisterTrigger(triggerValue: string, el: HTMLElement) {
		const set = triggerEls.get(triggerValue);
		set?.delete(el);
		if (set && set.size === 0) triggerEls.delete(triggerValue);

		// Remove from order only if no elements remain registered.
		if (!triggerEls.has(triggerValue)) {
			const idx = triggerOrder.indexOf(triggerValue);
			if (idx !== -1) triggerOrder.splice(idx, 1);
		}
	}

	function focusTriggerByValue(v: string) {
		const set = triggerEls.get(v);
		const el = set ? Array.from(set)[0] : undefined;
		el?.focus();
	}

	function focusNextFrom(currentValue: string, dir: 1 | -1) {
		const idx = triggerOrder.indexOf(currentValue);
		if (idx === -1 || triggerOrder.length === 0) return;
		const nextIdx = (idx + dir + triggerOrder.length) % triggerOrder.length;
		focusTriggerByValue(triggerOrder[nextIdx]!);
	}

	function focusEdge(edge: "start" | "end") {
		if (triggerOrder.length === 0) return;
		focusTriggerByValue(edge === "start" ? triggerOrder[0]! : triggerOrder[triggerOrder.length - 1]!);
	}

	// skipContext is fixed per instance (e.g. DocsTabs always passes true); conditional setContext is intentional.
	// svelte-ignore state_referenced_locally
	if (!skipContext) {
		setTabsContext({
			tabState,
			getValue,
			setValue,
			get orientation() {
				return orientation;
			},
			registerTrigger,
			unregisterTrigger,
			focusTriggerByValue,
			focusNextFrom,
			focusEdge
		});
	}
</script>

<div data-slot={dataSlot} class={cn("w-full", className)}>
	{@render children?.()}
</div>

