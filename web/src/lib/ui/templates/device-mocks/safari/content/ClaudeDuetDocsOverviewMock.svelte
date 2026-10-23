<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Thread', 'Brief', 'Skills', 'Settings'];
	const sidebarSections = [
		{
			title: 'Today',
			links: ['Morning brief', 'Calendar conflicts', 'Launch post drafts']
		},
		{
			title: 'Connected apps',
			links: ['Gmail', 'Slack', 'OpenQuok skill']
		}
	];

	const actionCards = [
		{
			iconName: icons.ClaudeDuet.name,
			title: 'Proactive partner',
			description: 'Duet messages you when something needs attention — you reply in one thread.'
		},
		{
			iconName: icons.Phone.name,
			title: 'Mobile + web',
			description: 'Type or use voice on iOS, Android, or claude.ai.'
		},
		{
			iconName: icons.OpenQuok.name,
			title: 'openquok-core',
			description: 'Install the skill on Duet’s VM, list channels, and queue drafts for approval.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#1a1512] text-lg text-white"
>
	<header class="flex items-center gap-4 border-b border-white/10 px-6 py-4">
		<AbstractIcon name={icons.ClaudeDuet.name} width="28" height="28" aria-hidden="true" />
		<span class="text-xl font-semibold tracking-tight">Claude Duet</span>
		<nav class="ml-8 flex gap-6 text-sm text-white/70">
			{#each navItems as item, i (item)}
				<span class={i === 0 ? 'text-white' : ''}>{item}</span>
			{/each}
		</nav>
	</header>
	<div class="flex flex-1 overflow-hidden">
		<aside class="w-52 shrink-0 border-r border-white/10 p-4 text-sm">
			<p class="mb-3 text-xs uppercase tracking-wide text-white/50">Sidebar</p>
			{#each sidebarSections as section (section.title)}
				<p class="mb-1 font-medium text-white/90">{section.title}</p>
				<ul class="mb-4 space-y-1 text-white/60">
					{#each section.links as link (link)}
						<li>{link}</li>
					{/each}
				</ul>
			{/each}
		</aside>
		<main class="flex flex-1 flex-col gap-4 p-6">
			<p class="text-sm text-white/60">Research preview · US Pro and Max</p>
			<div class="grid gap-3 sm:grid-cols-3">
				{#each actionCards as card (card.title)}
					<div class="rounded-xl border border-white/10 bg-white/5 p-4">
						<AbstractIcon
							name={card.iconName}
							width="24"
							height="24"
							class="mb-2 text-[#D77655]"
							aria-hidden="true"
						/>
						<p class="font-medium text-white">{card.title}</p>
						<p class="mt-1 text-sm text-white/65">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>
