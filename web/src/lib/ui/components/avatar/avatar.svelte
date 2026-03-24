<!-- https://github.com/huntabyte/shadcn-svelte/tree/3beb894ba6bbc13c4c777c3cd8a8c6e5b4657b7d/docs/src/lib/registry/ui/avatar -->
<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		loadingStatus = $bindable("loading"),
		class: className,
		children,
		...restProps
	}: AvatarPrimitive.RootProps = $props();
</script>

<AvatarPrimitive.Root
	bind:ref
	bind:loadingStatus
	data-slot="avatar"
	class={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
	{...restProps}
>
	{@render children?.()}
</AvatarPrimitive.Root>
