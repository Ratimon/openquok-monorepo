<script lang="ts">
	import type { Snippet } from 'svelte';

	import type { ButtonProps } from '$lib/ui/buttons/Button.svelte';

	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import { getMessageBranchContext } from '../context/message-context.svelte.js';

	type MessageButtonProps = Omit<ButtonProps, 'children' | 'type' | 'href'>;

	type Props = MessageButtonProps & {
		class?: string;
		children?: Snippet;
	};

	let { class: className, children, ...restProps }: Props = $props();

	const branchContext = getMessageBranchContext();

	const isDisabled = $derived(branchContext.totalBranches <= 1);
</script>

<Button
	aria-label="Previous branch"
	disabled={isDisabled}
	onclick={() => branchContext.goToPrevious()}
	size="icon"
	type="button"
	variant="ghost"
	class={cn('size-7', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<AbstractIcon
			name={icons.ChevronLeft.name}
			class="size-3.5"
			width="14"
			height="14"
			aria-hidden="true"
		/>
	{/if}
</Button>
