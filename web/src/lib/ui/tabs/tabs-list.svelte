<script lang="ts">
	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";

	type Props = WithoutChildrenOrChild<{
		class?: string;
		"data-slot"?: string;
	}>;

	let { class: className, "data-slot": dataSlot = "tabs-list", children }: Props = $props();
</script>

<div data-slot={dataSlot} role="tablist" class={cn("tabs tabs-bordered", className)}>
	{@render children?.()}
</div>

