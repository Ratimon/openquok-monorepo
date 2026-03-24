<script lang="ts">
	import { cn, type WithElementRef } from '$lib/ui/helpers/common';
	import type { HTMLAttributes } from 'svelte/elements';

	// Compatible with TanStack Form field API (FieldApi) used elsewhere in this repo.
	type FieldLike = {
		state: { meta: { errors?: unknown[] } };
	};

	let {
		ref = $bindable(null),
		class: className,
		field,
		for: htmlFor,
		children,
		...restProps
	}: (WithElementRef<HTMLAttributes<HTMLLabelElement>> & {
		field?: FieldLike;
		for?: string;
	}) = $props();

	const hasErrors = $derived(Boolean(field?.state.meta.errors?.length));
	const errorStyles = 'text-error';
</script>

<label
	bind:this={ref}
	data-slot="field-label"
	for={htmlFor}
	class={cn('text-sm font-medium text-base-content/70', hasErrors && errorStyles, className)}
	{...restProps}
>
	{@render children?.()}
</label>

