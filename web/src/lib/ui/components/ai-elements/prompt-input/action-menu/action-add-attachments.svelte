<script lang="ts">
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import { getAttachmentsContext } from '../context/attachments.svelte.js';
	import ActionMenuItem from './action-menu-item.svelte';

	interface Props {
		onSelect?: () => void;
		label?: string;
		class?: string;
	}

	let { onSelect, label = 'Add photos or files', class: className, ...props }: Props = $props();

	let attachments = getAttachmentsContext();

	let handleSelect = (e: Event) => {
		e.preventDefault();
		onSelect?.();
		attachments.openFileDialog();
	};
</script>

<ActionMenuItem class={cn('gap-2', className)} onSelect={handleSelect} {...props}>
	<AbstractIcon name={icons.Image.name} class="size-4" width="16" height="16" aria-hidden="true" />
	{label}
</ActionMenuItem>
