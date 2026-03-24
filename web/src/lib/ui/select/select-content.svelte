<script lang="ts">
	import type { WithoutChild } from 'bits-ui';
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';
	import SelectPortal from './select-portal.svelte';
	import SelectScrollUpButton from './select-scroll-up-button.svelte';
	import SelectScrollDownButton from './select-scroll-down-button.svelte';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		portalProps,
		children,
		...restProps
	}: WithoutChild<SelectPrimitive.ContentProps> & {
		portalProps?: SelectPrimitive.PortalProps;
	} = $props();
</script>

<SelectPortal {...portalProps}>
	<SelectPrimitive.Content
		bind:ref
		{sideOffset}
		data-slot="select-content"
		class={cn(
			'bg-base-100 border border-base-300 text-base-content z-50 max-h-(--bits-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-select-content-transform-origin) relative data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
			className
		)}
		{...restProps}
	>
		<SelectScrollUpButton />
		<SelectPrimitive.Viewport
			class={cn('h-(--bits-select-anchor-height) min-w-(--bits-select-anchor-width) w-full scroll-my-1 p-1')}
		>
			{@render children?.()}
		</SelectPrimitive.Viewport>
		<SelectScrollDownButton />
	</SelectPrimitive.Content>
</SelectPortal>
