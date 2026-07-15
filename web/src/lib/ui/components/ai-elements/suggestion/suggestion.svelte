<script lang="ts">
	import type { ButtonProps } from '$lib/ui/buttons/Button.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import type { Snippet } from "svelte";
	// indexing
	interface Props extends Omit<ButtonProps, "onclick"> {
		suggestion?: string;
		onclick?: (suggestion: string) => void;
		children?: Snippet;
		class?: string;
		variant?: ButtonProps["variant"];
		size?: ButtonProps["size"];
	}

	let {
		suggestion,
		onclick,
		class: className,
		variant = "outline",
		size = "sm",
		children,
		...restProps
	}: Props = $props();

	let handleClick = () => {
		onclick?.(suggestion || "");
	};
</script>

<Button
	class={cn("cursor-pointer rounded-full px-4", className)}
	onclick={handleClick}
	{size}
	type="button"
	{variant}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{suggestion}
	{/if}
</Button>
