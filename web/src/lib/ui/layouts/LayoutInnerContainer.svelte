<script lang="ts">
    import type { Snippet } from 'svelte';
    import { cn } from '$lib/ui/helpers/common';

    type Props = {
        class?: string;
        children: Snippet;
    };

	let {
        class: className = '',
        children,
        ...rest 
    }: Props = $props();

    const baseStyles = 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8';
</script>

<div
    class={cn(baseStyles, className)} {...rest}
>
    {@render children?.()}
</div>