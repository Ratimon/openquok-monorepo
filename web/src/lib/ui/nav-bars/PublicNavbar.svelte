<script lang="ts">
	import type { Link } from '$lib/ui/nav-bars/Link';
	import PageLink from '$lib/ui/nav-bars/PageLink.svelte';

	type Props = {
		class?: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
		pages: Link[];
	};

	let {
		class: className = '',
		tabClass = '',
		whenSelected = '',
		whenUnselected = '',
		pages = []
	}: Props = $props();
</script>

<div class="tabs {className}">
	{#each pages as link}
		{#if link.navType === 'menu' && link.dropdownItems && link.dropdownItems.length > 0}
			<div class="dropdown dropdown-hover">
				<button type="button" class="{tabClass} cursor-pointer bg-transparent border-none">
					{link.title}
				</button>
				<ul class="dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow">
					{#each link.dropdownItems as item}
						<li>
							<a href={item.href}>{item.title}</a>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<PageLink
				class={tabClass}
				href={link.pathname}
				{whenSelected}
				{whenUnselected}
				preload={link.preload}
			>
				{link.title}
			</PageLink>
		{/if}
	{/each}
</div>
