<script lang="ts">
	import type { CommandRootProps, DialogRootProps } from "bits-ui";
	import type { Snippet } from "svelte";
	import type { ComponentProps } from "svelte";
	import Command from "$lib/ui/command/command.svelte";
	import DialogPortal from "$lib/ui/dialog/dialog-portal.svelte";
	import * as Dialog from "$lib/ui/dialog/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/ui/helpers/common";

	let {
		open = $bindable(false),
		ref = $bindable(null),
		value = $bindable(""),
		title = "Command Palette",
		description = "Search for a command to run...",
		showCloseButton = false,
		portalProps,
		children,
		class: className,
		/* Command.Root-only — must not be forwarded to Dialog.Root */
		label,
		shouldFilter,
		filter,
		onStateChange,
		onValueChange,
		loop,
		vimBindings,
		disablePointerSelection,
		disableInitialScroll,
		columns,
		...dialogRest
	}: WithoutChildrenOrChild<DialogRootProps> &
		WithoutChildrenOrChild<CommandRootProps> & {
			portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
			children: Snippet;
			title?: string;
			description?: string;
			showCloseButton?: boolean;
			class?: string;
		} = $props();
</script>

<Dialog.Root bind:open {...dialogRest}>
	<Dialog.Header class="sr-only">
		<Dialog.Title>{title}</Dialog.Title>
		<Dialog.Description>{description}</Dialog.Description>
	</Dialog.Header>
	<Dialog.Content
		class={cn(
			"top-[22%] max-h-[min(70vh,520px)] w-full translate-x-[-50%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg",
			className
		)}
		{showCloseButton}
		{portalProps}
	>
		<Command
			{...dialogRest}
			bind:value
			bind:ref
			{label}
			{shouldFilter}
			{filter}
			{onStateChange}
			{onValueChange}
			{loop}
			{vimBindings}
			{disablePointerSelection}
			{disableInitialScroll}
			{columns}
			{children}
		/>
	</Dialog.Content>
</Dialog.Root>
