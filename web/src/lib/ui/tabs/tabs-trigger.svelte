<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";

	import { cn, type WithElementRef } from "$lib/ui/helpers/common";
	import { getTabsContext } from "$lib/ui/tabs/tabs-context";

	type Props = WithElementRef<
		HTMLButtonAttributes & {
			value: string;
			disabled?: boolean;
			class?: string;
			"data-slot"?: string;
		},
		HTMLButtonElement
	>;

	let {
		ref = $bindable<HTMLButtonElement | null>(null),
		value,
		disabled,
		class: className,
		"data-slot": dataSlot = "tabs-trigger",
		children,
		...restProps
	}: Props = $props();

	const tabs = getTabsContext();

	const selected = $derived((tabs.tabState.current ?? "") === value);

	$effect(() => {
		const el = ref;
		if (!el) return;
		tabs.registerTrigger(value, el);
		return () => tabs.unregisterTrigger(value, el);
	});

	function onClick() {
		if (disabled) return;
		tabs.setValue(value);
	}

	function onKeyDown(e: KeyboardEvent) {
		const key = e.key;
		const isHorizontal = tabs.orientation === "horizontal";

		if (key === "Home") {
			e.preventDefault();
			tabs.focusEdge("start");
			return;
		}
		if (key === "End") {
			e.preventDefault();
			tabs.focusEdge("end");
			return;
		}

		if (isHorizontal && (key === "ArrowLeft" || key === "ArrowRight")) {
			e.preventDefault();
			tabs.focusNextFrom(value, key === "ArrowRight" ? 1 : -1);
			return;
		}
		if (!isHorizontal && (key === "ArrowUp" || key === "ArrowDown")) {
			e.preventDefault();
			tabs.focusNextFrom(value, key === "ArrowDown" ? 1 : -1);
			return;
		}

		if (key === "Enter" || key === " ") {
			e.preventDefault();
			onClick();
		}
	}
</script>

<button
	bind:this={ref}
	data-slot={dataSlot}
	type="button"
	role="tab"
	aria-selected={selected}
	aria-controls={`${value}-panel`}
	id={`${value}-tab`}
	tabindex={selected ? 0 : -1}
	class={cn("tab", selected && "tab-active", className)}
	{disabled}
	onclick={onClick}
	onkeydown={onKeyDown}
	{...restProps}
>
	{@render children?.()}
</button>

