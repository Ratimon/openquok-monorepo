<script lang="ts">
	import type { SidebarLinkItem } from './types';
	import { fly } from 'svelte/transition';
	import { vopen } from '$lib/ui/sidebar-expandable/svelteContent';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		link: SidebarLinkItem;
		active?: boolean;
	};

	let { link, active = false }: Props = $props();
</script>

<a
	href={link.href}
	class="flex items-center justify-start gap-2 group/sidebar py-2 rounded-lg transition-colors {active
		? 'bg-primary/15 text-primary'
		: 'text-base-content hover:bg-base-content/10'}"
>
	<AbstractIcon
		name={link.iconName}
		width="20"
		height="20"
		class="flex-shrink-0 text-current"
		focusable="false"
	/>
	{#if $vopen}
		<div in:fly={{ x: -8, duration: 150 }} out:fly={{ x: -8, duration: 100 }}>
			<span
				class="text-sm font-medium whitespace-pre inline-block !p-0 !m-0"
			>
				{link.label}
			</span>
		</div>
	{/if}
</a>
