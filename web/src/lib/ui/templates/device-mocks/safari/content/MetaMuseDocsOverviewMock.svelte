<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Muse', 'Connectors', 'Tasks', 'Settings'];
	const sidebarSections = [
		{
			title: 'Get started',
			links: ['What is Muse', 'Secure VM', 'Custom connectors']
		},
		{
			title: 'Connect',
			links: ['Directory connectors', 'API custom connectors', 'Credential store']
		}
	];

	const actionCards = [
		{
			iconName: icons.Phone.name,
			title: 'Mobile apps',
			description: 'Use Muse on iOS or Android when Meta enables your region.'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			title: 'muse.ai',
			description: 'Chat in the browser and hand off tasks to the Secure VM.'
		},
		{
			iconName: icons.Sparkles.name,
			title: 'Custom connectors',
			description: 'Ask Muse to wire a service from a public API or OpenAPI document.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#120818] text-lg text-white"
>
	<header class="flex items-center gap-4 border-b border-white/10 px-6 py-4">
		<AbstractIcon
			name={icons.MetaMuse.name}
			class="size-8 shrink-0"
			width="32"
			height="32"
		/>
		<div
			class="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xl text-white/50"
		>
			<AbstractIcon name={icons.Search.name} class="size-5 shrink-0" width="20" height="20" />
			<span class="truncate">meta.ai/muse</span>
		</div>
	</header>

	<nav class="flex gap-6 border-b border-white/10 px-6 py-3 text-sm font-medium text-white/70">
		{#each navItems as item, index (item)}
			<span class={index === 0 ? 'text-white' : ''}>{item}</span>
		{/each}
	</nav>

	<div class="flex min-h-0 flex-1">
		<aside class="hidden w-52 shrink-0 border-r border-white/10 p-5 text-sm sm:block">
			{#each sidebarSections as section (section.title)}
				<p class="mb-2 font-semibold text-white/90">{section.title}</p>
				<ul class="mb-6 space-y-2 text-white/55">
					{#each section.links as link (link)}
						<li>{link}</li>
					{/each}
				</ul>
			{/each}
		</aside>

		<main class="flex-1 space-y-6 p-6">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight">Meta Muse</h1>
				<p class="mt-2 max-w-xl text-base text-white/65">
					Personal AI agent with a Secure VM, directory connectors, and user-built custom connectors
					from public APIs.
				</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-3">
				{#each actionCards as card (card.title)}
					<div class="rounded-xl border border-white/10 bg-white/5 p-4">
						<AbstractIcon
							name={card.iconName}
							class="mb-3 size-7 text-violet-300"
							width="28"
							height="28"
						/>
						<p class="font-semibold text-white">{card.title}</p>
						<p class="mt-1 text-sm text-white/60">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>
