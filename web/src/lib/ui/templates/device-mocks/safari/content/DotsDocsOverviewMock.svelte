<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Overview', 'Your dot', 'Plugins', 'Activity'];
	const sidebarSections = [
		{
			title: 'Getting started',
			links: ['Create your dot', 'Cloud computer', 'Custom Rules']
		},
		{
			title: 'Work where you are',
			links: ['ChatGPT apps', 'Slack', 'Microsoft Teams']
		}
	];

	const actionCards = [
		{
			iconName: icons.ChatGPT.name,
			title: 'ChatGPT',
			description: 'Name your dot, connect apps, and chat from desktop or mobile.'
		},
		{
			iconName: icons.Slack.name,
			title: 'Slack & Teams',
			description: 'Message your dot in workplace chat with full project context.'
		},
		{
			iconName: icons.Sparkles.name,
			title: 'Plugins',
			description: 'Register openquok-core and run the CLI on the dot cloud computer.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#0a0a0a] text-lg text-white"
>
	<header class="flex items-center gap-4 border-b border-white/10 px-6 py-4">
		<AbstractIcon name={icons.Dots.name} width="102" height="28" aria-hidden="true" />
		<span class="text-xl font-semibold tracking-tight">Dots</span>
		<nav class="ml-8 flex gap-6 text-sm text-white/70">
			{#each navItems as item, i (item)}
				<span class={i === 0 ? 'text-white' : ''}>{item}</span>
			{/each}
		</nav>
	</header>
	<div class="flex flex-1 overflow-hidden">
		<aside class="w-52 shrink-0 border-r border-white/10 p-4 text-sm">
			{#each sidebarSections as section (section.title)}
				<p class="mb-2 font-medium text-white/90">{section.title}</p>
				<ul class="mb-6 space-y-2 text-white/60">
					{#each section.links as link (link)}
						<li>{link}</li>
					{/each}
				</ul>
			{/each}
		</aside>
		<main class="flex-1 p-8">
			<h1 class="text-3xl font-semibold">Always-on agents that finish work</h1>
			<p class="mt-3 max-w-xl text-white/70">
				Your dot keeps a cloud computer, learns your standards, and meets you in ChatGPT, Slack, or
				Teams.
			</p>
			<div class="mt-8 grid gap-4 sm:grid-cols-3">
				{#each actionCards as card (card.title)}
					<div class="rounded-xl border border-white/10 bg-white/5 p-4">
						<AbstractIcon
							name={card.iconName}
							width="24"
							height="24"
							class="mb-3"
							aria-hidden="true"
						/>
						<p class="font-medium">{card.title}</p>
						<p class="mt-1 text-sm text-white/60">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>
