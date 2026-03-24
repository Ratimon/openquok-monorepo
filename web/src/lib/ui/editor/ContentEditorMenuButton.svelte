<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Editor as TiptapEditor } from '@tiptap/core';

	import { cn } from '$lib/ui/helpers/common';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		children: Snippet;
		editor: TiptapEditor;
		onClick: () => void;
		name: string;
		disabled?: boolean;
		attributes?: object;
	};

	let { children, editor, onClick, name, disabled, attributes }: Props = $props();

	function preventDefault(fn: any) {
		return function (event: any) {
			event.preventDefault();
			// @ts-ignore - menu action handlers are invoked by tiptap
			fn.call(this, event);
		};
	}
</script>

<Button
	class={cn(
		'group border-r border-base-300 p-2 first-of-type:rounded-l-md last-of-type:rounded-r-md last-of-type:border-r-0 disabled:cursor-not-allowed disabled:hover:bg-base-200',
		editor.isActive(name, attributes)
			? 'bg-base-content text-base-100 hover:bg-base-100 hover:text-base-content'
			: 'bg-base-100 text-base-content hover:bg-base-content hover:text-base-100'
	)}
	disabled={disabled}
	title={name}
	onclick={preventDefault(() => onClick())}
>
	{@render children?.()}
</Button>

