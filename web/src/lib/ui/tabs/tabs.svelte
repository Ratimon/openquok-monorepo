<script lang="ts">
	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";
	import { setTabsContext, type TabsOrientation } from "$lib/ui/tabs/tabs-context";

	type Props = WithoutChildrenOrChild<{
		value?: string;
		defaultValue?: string;
		orientation?: TabsOrientation;
		class?: string;
		"data-slot"?: string;
	}>;

	let {
		value = $bindable<string | undefined>(),
		defaultValue,
		orientation = "horizontal",
		class: className,
		"data-slot": dataSlot = "tabs",
		children
	}: Props = $props();

	const triggerOrder = $state<string[]>([]);
	const triggerEls = new Map<string, Set<HTMLElement>>();

	function getValue() {
		return value ?? defaultValue;
	}

	function setValue(next: string) {
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

	setTabsContext({
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
</script>

<div data-slot={dataSlot} class={cn("w-full", className)}>
	{@render children?.()}
</div>

