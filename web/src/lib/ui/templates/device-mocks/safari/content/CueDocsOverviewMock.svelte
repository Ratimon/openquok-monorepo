<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Features', 'Cue CLI', 'Skills', 'Safety'];
	const sidebarSections = [
		{
			title: 'Agent computer',
			links: ['Cloud computer', 'Your computer', 'Cue CLI setup']
		},
		{
			title: 'Skills',
			links: ['Skill catalog', 'cue skill install', 'cue skill doctor']
		}
	];

	const actionCards = [
		{
			iconName: icons.Phone.name,
			title: 'Identity & social',
			description: 'Your Cue’s contacts and posts on Cue OS — separate from brand channels.'
		},
		{
			iconName: icons.Sparkles.name,
			title: 'openquok-core',
			description: 'Install from a local folder so your Cue schedules via official APIs.'
		},
		{
			iconName: icons.Terminal.name,
			title: 'Cue CLI',
			description: 'Keep Cue CLI running while the agent needs your paired computer.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#f4f6f8] text-lg text-neutral-900"
>
	<header class="flex items-center gap-4 border-b border-neutral-300/80 px-6 py-4">
		<div class="size-8 rounded-lg bg-neutral-900"></div>
		<span class="font-semibold">Cue OS Docs</span>
		<nav class="ml-auto flex gap-4 text-sm text-neutral-600">
			{#each navItems as item}
				<span>{item}</span>
			{/each}
		</nav>
	</header>

	<div class="flex flex-1">
		<aside class="w-52 shrink-0 border-r border-neutral-300/80 bg-white/80 p-4 text-sm">
			{#each sidebarSections as section}
				<p class="mb-2 font-semibold text-neutral-800">{section.title}</p>
				<ul class="mb-4 space-y-1 text-neutral-600">
					{#each section.links as link}
						<li>{link}</li>
					{/each}
				</ul>
			{/each}
		</aside>

		<main class="flex flex-1 flex-col gap-4 p-6">
			<h1 class="text-2xl font-bold">Skills</h1>
			<p class="max-w-md text-sm text-neutral-600">
				Find, read, and install skills that show Cue how to run tasks on the agent computer.
			</p>
			<div class="grid gap-3 sm:grid-cols-3">
				{#each actionCards as card}
					<div class="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
						<AbstractIcon
							name={card.iconName}
							width="24"
							height="24"
							class="mb-2 text-violet-700"
							aria-hidden="true"
						/>
						<p class="font-semibold">{card.title}</p>
						<p class="mt-1 text-xs text-neutral-600">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>