<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Download', 'Docs', 'Community', 'Partners'];
	const sidebarSections = [
		{
			title: 'Get started',
			links: ['Install the desktop app', 'Connect one engine', 'Create your first bot']
		},
		{
			title: 'Bots',
			links: ['Agent engines', 'Automations', 'Connected apps', 'Skill recorder']
		}
	];

	const actionCards = [
		{
			iconName: icons.MausBot.name,
			title: 'BYO engines',
			description: 'Use Claude Code, Codex, or Grok CLIs you already installed.'
		},
		{
			iconName: icons.Bot.name,
			title: 'Many bots',
			description: 'Run Sales, SEO, and scheduling bots in parallel on your machine.'
		},
		{
			iconName: icons.Sparkles.name,
			title: 'openquok-core',
			description: 'Add SKILL.md to a working folder and message your scheduling bot.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#fdfdfd] text-lg text-neutral-900"
>
	<header class="flex items-center gap-4 border-b border-neutral-200 px-6 py-4">
		<AbstractIcon name={icons.MausBot.name} class="size-8 shrink-0" width="32" height="32" />
		<div
			class="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xl text-neutral-400"
		>
			<AbstractIcon name={icons.Search.name} class="size-5 shrink-0" width="20" height="20" />
			<span>Search docs…</span>
		</div>
	</header>

	<nav class="flex gap-6 overflow-hidden border-b border-neutral-200 px-6 py-3 text-lg text-neutral-500">
		{#each navItems as item, index (item)}
			<span class={index === 0 ? 'font-semibold text-neutral-900' : ''}>{item}</span>
		{/each}
	</nav>

	<div class="flex min-h-0 flex-1">
		<aside class="w-56 shrink-0 border-r border-neutral-200 bg-neutral-50 p-4 text-base">
			{#each sidebarSections as section (section.title)}
				<div class="mb-6">
					<p class="mb-2 font-semibold text-neutral-900">{section.title}</p>
					<ul class="space-y-1.5 text-neutral-600">
						{#each section.links as link (link)}
							<li>{link}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</aside>

		<main class="min-w-0 flex-1 space-y-6 p-6">
			<div>
				<h1 class="text-3xl font-semibold text-neutral-900">Your team of bots on autopilot</h1>
				<p class="mt-2 max-w-xl text-neutral-600">
					Free open-source desktop app. Local-first storage. Bring your own AI account or API key.
				</p>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				{#each actionCards as card (card.title)}
					<div class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
						<AbstractIcon
							name={card.iconName}
							class="mb-3 size-8"
							width="32"
							height="32"
							aria-hidden="true"
						/>
						<p class="font-semibold text-neutral-900">{card.title}</p>
						<p class="mt-1 text-sm text-neutral-600">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>