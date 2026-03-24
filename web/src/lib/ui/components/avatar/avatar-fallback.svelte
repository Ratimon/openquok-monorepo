<!-- https://github.com/huntabyte/shadcn-svelte/tree/3beb894ba6bbc13c4c777c3cd8a8c6e5b4657b7d/docs/src/lib/registry/ui/avatar -->
<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: AvatarPrimitive.FallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
	bind:ref
	data-slot="avatar-fallback"
	class={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
	{...restProps}
>
	{@render children?.()}
</AvatarPrimitive.Fallback>
