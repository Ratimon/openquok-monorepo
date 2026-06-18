<script lang="ts">
	type Props = {
		href: string;
		class?: string;
		alt?: string;
		draggable?: boolean;
		loading?: 'lazy' | 'eager' | undefined;
	};

	let { href, class: className = '', alt = '', draggable = false, loading = 'lazy' }: Props = $props();
</script>

{#if href}
	<img src={href} class={className} {alt} {draggable} {loading} />
{/if}
