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

    const baseStyles = 'w-full';
</script>

<div
    class={cn(baseStyles, className)} {...rest}
>
    {@render children?.()}
</div>