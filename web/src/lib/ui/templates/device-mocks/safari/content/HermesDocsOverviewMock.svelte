<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const navItems = ['Docs', 'Quickstart', 'Gateway', 'Skills'];
	const sidebarSections = [
		{
			title: 'Getting started',
			links: ['Installation', 'Quickstart', 'Learning path']
		},
		{
			title: 'Capabilities',
			links: ['Messaging gateway', 'Skills system', 'MCP integration']
		}
	];

	const actionCards = [
		{
			iconName: icons.Terminal.name,
			title: 'Install in 60 seconds',
			description: 'curl installer sets up Python, Node, and the hermes CLI.'
		},
		{
			iconName: icons.Sparkles.name,
			title: 'hermes setup --portal',
			description: 'One OAuth login for models plus Tool Gateway tools.'
		},
		{
			iconName: icons.MessageCircle.name,
			title: 'hermes gateway setup',
			description: 'Connect Telegram, Discord, Slack, WhatsApp, and more.'
		}
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#0c0a14] text-lg text-white"
>
	<header class="flex items-center gap-4 border-b border-white/10 px-6 py-4">
		<AbstractIcon
			name={icons.HermesAgent.name}
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
			<span class={index === 0 ? 'font-semibold text-violet-400' : ''}>{item}</span>
		{/each}
	</nav>

	<div
		class="mx-6 mt-5 rounded-xl border-2 border-violet-500/60 bg-violet-500/15 px-5 py-4 text-center"
	>
		<p class="text-4xl font-bold tracking-tight text-violet-300">hermes-agent.nousresearch.com</p>
		<p class="mt-1 text-xl text-white/70">Install, gateway setup, skills, and MCP docs</p>
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
									? 'rounded-lg bg-violet-500/15 px-3 py-2 text-xl font-semibold text-violet-200'
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
				<p class="text-lg font-semibold uppercase tracking-wide text-violet-400">Overview</p>
				<h1 class="text-5xl font-bold tracking-tight">Hermes Agent</h1>
				<p class="text-2xl leading-snug text-white/65">
					Self-improving AI agent — runs on your laptop, a VPS, or serverless hosts you never SSH into.
				</p>
			</div>

			<div class="grid grid-cols-2 gap-3">
				{#each actionCards as card (card.title)}
					<div
						class="rounded-xl border border-white/10 bg-white/[0.03] p-4 {card.title ===
						'hermes gateway setup'
							? 'col-span-2'
							: ''}"
					>
						<AbstractIcon
							name={card.iconName}
							class="mb-2 size-7 text-violet-400/80"
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
