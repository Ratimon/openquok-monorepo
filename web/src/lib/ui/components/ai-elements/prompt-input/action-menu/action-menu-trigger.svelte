<script lang="ts">
	import { icons } from '$data/icons';
	import * as DropdownMenu from '$lib/ui/dropdown-menu';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import Button from '../controls/button.svelte';

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<DropdownMenu.Trigger>
	{#snippet child({ props })}
		<Button class={className} {...props} {...restProps}>
			{#if children}
				{@render children()}
			{:else}
				<AbstractIcon
					name={icons.Plus.name}
					class="size-4"
					width="16"
					height="16"
					aria-hidden="true"
				/>
			{/if}
		</Button>
	{/snippet}
</DropdownMenu.Trigger>
