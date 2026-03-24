<!-- https://github.com/huntabyte/shadcn-svelte/tree/3beb894ba6bbc13c4c777c3cd8a8c6e5b4657b7d/docs/src/lib/registry/ui/avatar -->
<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "$lib/ui/helpers/common";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarPrimitive.ImageProps = $props();
</script>

<AvatarPrimitive.Image
	bind:ref
	data-slot="avatar-image"
	class={cn("aspect-square size-full", className)}
	{...restProps}
/>
