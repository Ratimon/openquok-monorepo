<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Overview', 'Get started', 'Skills', 'Routines'];
	const sidebarSections = [
		{
			title: 'Getting started',
			links: ['Install desktop app', 'Create a Bot', 'Cloud computer']
		},
		{
			title: 'Capabilities',
			links: ['Plugins & skills', 'Routines', 'Connectors (optional)']
		}
	];

	const actionCards = [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			title: 'Desktop app',
			description: 'macOS and Windows — message your Bot from a native client.'
		},
		{
			iconName: icons.Phone.name,
			title: 'iOS app',
			description: 'Chat with your Bot on iPhone or iPad when you are away from desk.'
		},
		{
			iconName: icons.Sparkles.name,
			title: 'Settings → Plugins',
			description: 'Save openquok-core as a skill and invoke it with / in chat.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#0a0a0a] text-lg text-white"
>
	<header class="flex items-center gap-4 border-b border-white/10 px-6 py-4">
		<AbstractIcon
			name={icons.GrokBot.name}
			class="size-8 shrink-0"
			width="32"
			height="32"
		/>
		<div
			class="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xl text-white/50"
		>
			<AbstractIcon name={icons.Search.name} class="size-5 shrink-0" width="20" height="20" />
			<span>Search docs…</span>
		</div>
	</header>

	<nav class="flex gap-6 overflow-hidden border-b border-white/10 px-6 py-3 text-lg text-white/50">
		{#each navItems as item, index (item)}
			<span class={index === 0 ? 'font-semibold text-white' : ''}>{item}</span>
		{/each}
	</nav>

	<div
		class="mx-6 mt-5 rounded-xl border-2 border-white/25 bg-white/10 px-5 py-4 text-center"
	>
		<p class="text-4xl font-bold tracking-tight text-white">x.ai/bot</p>
		<p class="mt-1 text-xl text-white/70">Install, create a Bot, plugins, and cloud computer docs</p>
	</div>

	<div class="grid min-h-0 flex-1 grid-cols-[12rem_1fr] gap-5 p-6 pt-5">
		<aside class="space-y-4 text-lg">
			{#each sidebarSections as section (section.title)}
				<div>
					<p class="mb-2 text-base font-semibold text-white/40">{section.title}</p>
					<ul class="space-y-1.5">
						{#each section.links as link, index (link)}
							<li
								class={section.title === 'Getting started' && index === 0
									? 'rounded-lg bg-white/10 px-3 py-2 text-xl font-semibold text-white'
									: 'px-3 text-lg text-white/60'}
							>
								{link}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</aside>

		<main class="min-w-0 space-y-5">
			<div class="space-y-2">
				<p class="text-lg font-semibold uppercase tracking-wide text-white/50">Overview</p>
				<h1 class="text-5xl font-bold tracking-tight">Grok Bot</h1>
				<p class="text-2xl leading-snug text-white/65">
					AI teammates on a shared persistent cloud computer — browser, filesystem, and terminal.
				</p>
			</div>

			<div class="grid grid-cols-2 gap-3">
				{#each actionCards as card (card.title)}
					<div
						class="rounded-xl border border-white/10 bg-white/[0.03] p-4 {card.title ===
						'Settings → Plugins'
							? 'col-span-2'
							: ''}"
					>
						<AbstractIcon
							name={card.iconName}
							class="mb-2 size-7 text-white/80"
							width="28"
							height="28"
						/>
						<p class="text-2xl font-bold">{card.title}</p>
						<p class="mt-1 text-xl leading-snug text-white/55">{card.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</div>
