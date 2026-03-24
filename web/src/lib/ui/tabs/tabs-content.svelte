<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";
	import { getTabsContext } from "$lib/ui/tabs/tabs-context";

	type Props = WithoutChildrenOrChild<
		HTMLAttributes<HTMLDivElement> & {
			value: string;
			forceMount?: boolean;
			class?: string;
			"data-slot"?: string;
		}
	>;

	let {
		value,
		forceMount = false,
		class: className,
		"data-slot": dataSlot = "tabs-content",
		children,
		...restProps
	}: Props = $props();

	const tabs = getTabsContext();
	const selected = $derived((tabs.getValue() ?? "") === value);
</script>

{#if selected || forceMount}
	<div
		data-slot={dataSlot}
		role="tabpanel"
		aria-labelledby={`${value}-tab`}
		id={`${value}-panel`}
		class={cn("tab-content pt-4", !selected && "hidden", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}

