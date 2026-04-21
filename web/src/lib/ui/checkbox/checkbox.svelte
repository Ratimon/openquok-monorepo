<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = CheckboxPrimitive.RootProps & { class?: string };

	let { checked = $bindable(false), class: className, ...restProps }: Props = $props();
</script>

{#snippet child({ props, checked, indeterminate }: { props: Record<string, unknown>; checked: boolean; indeterminate: boolean })}
	<button
		{...props}
		class={cn(
			'peer size-4 shrink-0 rounded-sm border border-base-300 bg-base-100 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-content',
			className,
			(props as { class?: string }).class
		)}
	>
		{#if checked || indeterminate}
			<AbstractIcon name={icons.Check.name} class="m-auto size-3" width="12" height="12" />
		{/if}
	</button>
{/snippet}

<CheckboxPrimitive.Root bind:checked {child} {...restProps} />

