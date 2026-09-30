<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Projects', 'Skills', 'Automations', 'Studio'];
	const sidebarSections = [
		{
			title: 'Manus 2.0',
			links: ['Cascade agent', 'Cloud Computer', 'Manus Studio']
		},
		{
			title: 'Skills',
			links: ['Import from GitHub', 'Upload a skill', 'Team Skill Library']
		}
	];

	const actionCards = [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			title: 'Manus Studio',
			description: 'Edit timelines, documents, and code in one shared workspace.'
		},
		{
			iconName: icons.Sparkles.name,
			title: 'Skills tab',
			description: 'Add openquok-core from GitHub or an uploaded SKILL.md package.'
		},
		{
			iconName: icons.Terminal.name,
			title: 'Cloud Computer',
			description: 'Install @openquok/auto-cli and run openquok in a persistent shell.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#f5f0e8] text-lg text-neutral-900"
>
	<header class="flex items-center gap-4 border-b border-neutral-300/80 px-6 py-4">
		<AbstractIcon name={icons.Manus.name} class="size-9 shrink-0 rounded-lg" aria-hidden="true" />
		<span class="text-xl font-semibold tracking-tight">Manus</span>
		<nav class="ml-auto flex gap-6 text-sm font-medium text-neutral-600">
			{#each navItems as item, i (item)}
				<span class={i === 1 ? 'text-neutral-900' : ''}>{item}</span>
			{/each}
		</nav>
	</header>

	<div class="flex min-h-0 flex-1">
		<aside class="w-56 shrink-0 border-r border-neutral-300/80 bg-white/60 px-4 py-6">
			{#each sidebarSections as section (section.title)}
				<div class="mb-6">
					<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
						{section.title}
					</p>
					<ul class="space-y-2 text-sm text-neutral-700">
						{#each section.links as link (link)}
							<li>{link}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</aside>

		<main class="flex flex-1 flex-col gap-6 overflow-hidden p-8">
			<h1 class="text-3xl font-semibold tracking-tight">Share and use Skills</h1>
			<p class="max-w-2xl text-base text-neutral-600">
				Skills are portable workflows built from SKILL.md and optional scripts. Import openquok-core from
				GitHub or upload a package, then type / in chat to run scheduling commands.
			</p>
			<div class="grid gap-4 sm:grid-cols-3">
				{#each actionCards as card (card.title)}
					<div class="rounded-xl border border-neutral-300/80 bg-white p-5 shadow-sm">
						<AbstractIcon name={card.iconName} class="size-8 text-neutral-800" aria-hidden="true" />
						<p class="mt-3 font-semibold">{card.title}</p>
						<p class="mt-1 text-sm text-neutral-600">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>
