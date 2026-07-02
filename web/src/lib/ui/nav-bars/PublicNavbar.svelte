<script lang="ts">
	import type { Link } from '$lib/ui/nav-bars/Link';
	import PageLink from '$lib/ui/nav-bars/PageLink.svelte';
	import PublicAgentsNavDropdown from '$lib/ui/nav-bars/PublicAgentsNavDropdown.svelte';
	import PublicChannelsNavDropdown from '$lib/ui/nav-bars/PublicChannelsNavDropdown.svelte';
	import PublicPlaybooksNavDropdown from '$lib/ui/nav-bars/PublicPlaybooksNavDropdown.svelte';

	type Props = {
		class?: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
		pages: Link[];
		/** Inline collapsible sections for mobile menus inside native popovers. */
		inline?: boolean;
		onAfterNavigate?: () => void;
	};

	let {
		class: className = '',
		tabClass = '',
		whenSelected = '',
		whenUnselected = '',
		pages = [],
		inline = false,
		onAfterNavigate
	}: Props = $props();
</script>

<div class="tabs {className}">
	{#each pages as link (link.pathname)}
		{#if link.navType === 'agents'}
			<PublicAgentsNavDropdown
				title={link.title}
				agentsPath={link.pathname}
				{tabClass}
				{whenSelected}
				{whenUnselected}
				{inline}
				{onAfterNavigate}
			/>
		{:else if link.navType === 'channels'}
			<PublicChannelsNavDropdown
				title={link.title}
				channelsPath={link.pathname}
				{tabClass}
				{whenSelected}
				{whenUnselected}
				{inline}
				{onAfterNavigate}
			/>
		{:else if link.navType === 'playbooks'}
			<PublicPlaybooksNavDropdown
				title={link.title}
				playbooksPath={link.pathname}
				{tabClass}
				{whenSelected}
				{whenUnselected}
				{inline}
				{onAfterNavigate}
			/>
		{:else if link.navType === 'menu' && link.dropdownItems && link.dropdownItems.length > 0}
			<div class="dropdown dropdown-hover">
				<button type="button" class="{tabClass} cursor-pointer bg-transparent border-none">
					{link.title}
				</button>
				<ul class="dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow">
					{#each link.dropdownItems as item (item.href)}
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
