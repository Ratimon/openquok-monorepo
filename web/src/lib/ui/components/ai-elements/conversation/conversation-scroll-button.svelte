<script lang="ts" module>
	import type { ButtonProps } from '$lib/ui/buttons/Button.svelte';

	import { cn } from '$lib/ui/helpers/common';

	export interface ConversationScrollButtonProps extends ButtonProps {}
</script>

<script lang="ts">
	import { icons } from '$data/icons';
	import { fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	import Button from '$lib/ui/buttons/Button.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import { getStickToBottomContext } from './stick-to-bottom-context.svelte.js';

	let { class: className, onclick, ...restProps }: ConversationScrollButtonProps = $props();

	const context = getStickToBottomContext();

	const handleScrollToBottom = (event: MouseEvent) => {
		context.scrollToBottom();
		if (onclick) {
			onclick(
				event as MouseEvent & {
					currentTarget: EventTarget & HTMLButtonElement;
				}
			);
		}
	};
</script>

{#if !context.isAtBottom}
	<div
		in:fly={{
			duration: 300,
			y: 10,
			easing: backOut
		}}
		out:fly={{
			duration: 200,
			y: 10,
			easing: backOut
		}}
		class="absolute bottom-4 left-[50%] translate-x-[-50%]"
	>
		<Button
			class={cn(
				'bg-background/80 border-border/50 hover:bg-background/90 rounded-full shadow-lg backdrop-blur-sm hover:shadow-xl',
				className
			)}
			onclick={handleScrollToBottom}
			size="icon"
			type="button"
			variant="outline"
			{...restProps}
		>
			<AbstractIcon
				name={icons.ArrowDown.name}
				class="size-4"
				width="16"
				height="16"
				aria-hidden="true"
			/>
		</Button>
	</div>
{/if}
