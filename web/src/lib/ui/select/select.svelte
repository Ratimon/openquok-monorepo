<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';

	// RootProps is a discriminated union (type "single" => value: string; "multiple" => value: string[]).
	// Destructuring widens value to string | string[] | undefined, which TS rejects for Root's bind:value.
	// Cast to any so both single and multiple select work at runtime.
	let {
		open = $bindable(false),
		value = $bindable(),
		...restProps
	}: SelectPrimitive.RootProps = $props();
</script>

<SelectPrimitive.Root bind:open bind:value={value as any} {...restProps} />
