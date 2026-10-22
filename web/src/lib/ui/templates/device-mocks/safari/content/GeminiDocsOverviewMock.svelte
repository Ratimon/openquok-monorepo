<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Chat', 'Task', 'Gems', 'Settings'];
	const sidebarSections = [
		{
			title: 'Task threads',
			links: ['Launch week drafts', 'Weekly analytics digest', 'Inbox cleanup']
		},
		{
			title: 'Connected Apps',
			links: ['Google Workspace', 'Custom apps (MCP)', 'YouTube']
		}
	];

	const actionCards = [
		{
			iconName: icons.Gemini.name,
			title: 'Task mode',
			description: 'Assign multi-step work with skills, schedules, and browser actions.'
		},
		{
			iconName: icons.Google.name,
			title: 'Workspace',
			description: 'Gmail, Calendar, Drive, Docs, and Sheets when you enable them.'
		},
		{
			iconName: icons.OpenQuok.name,
			title: 'OpenQuok MCP',
			description: 'Custom Connected App — list channels and queue social drafts.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#0f172a] text-lg text-white"
>
	<header class="flex items-center gap-4 border-b border-white/10 px-6 py-4">
		<AbstractIcon name={icons.Gemini.name} width="28" height="28" aria-hidden="true" />
		<span class="text-xl font-semibold tracking-tight">Gemini</span>
		<nav class="ml-8 flex gap-6 text-sm text-white/70">
			{#each navItems as item, i (item)}
				<span class={i === 1 ? 'text-white' : ''}>{item}</span>
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
			<p class="text-sm text-white/60">Task · Connected Apps · Skills</p>
			<h1 class="text-2xl font-semibold">Personal agent in the Gemini app</h1>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				{#each actionCards as card (card.title)}
					<div class="rounded-xl border border-white/10 bg-white/5 p-4">
						<AbstractIcon
							name={card.iconName}
							width="24"
							height="24"
							class="mb-2"
							aria-hidden="true"
						/>
						<p class="font-medium">{card.title}</p>
						<p class="mt-1 text-sm text-white/70">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>
