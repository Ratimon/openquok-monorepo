<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		errors,
		...restProps
	}: (WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
		errors?: { message?: string }[];
	}) = $props();

	const hasChildrenContent = $derived(Boolean(children));
	const hasErrors = $derived(Boolean(errors && errors.length > 0));
	const firstMessage = $derived.by(() => errors?.[0]?.message);
	const hasSingleMessage = $derived.by(() => hasErrors && Boolean(errors && errors.length === 1 && errors[0]?.message));
	const isMultipleErrors = $derived.by(() => hasErrors && Boolean(errors && errors.length > 1));

	const hasContent = $derived.by(() => {
		if (hasChildrenContent) return true;
		if (!errors || errors.length === 0) return false;
		// If there is exactly one error and it has no message, treat as no content.
		if (errors.length === 1 && !errors[0]?.message) return false;
		return true;
	});
</script>

{#if hasContent}
	<div
		bind:this={ref}
		data-slot="field-error"
		class={cn('text-sm text-error', className)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else if hasSingleMessage}
			{firstMessage}
		{:else if isMultipleErrors}
			<div class="space-y-1">
				{#each errors ?? [] as error, index (index)}
					{#if error?.message}
						<div>
							{error.message}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
{/if}

