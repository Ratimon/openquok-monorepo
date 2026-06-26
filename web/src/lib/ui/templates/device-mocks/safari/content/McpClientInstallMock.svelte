<script lang="ts">
	import type { McpInstallSafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
	import { getMcpInstallMockTheme } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		content: McpInstallSafariMockContentId;
	};

	let { content }: Props = $props();

	const theme = $derived(getMcpInstallMockTheme(content));
	const isLight = $derived(theme.layout === 'cowork');
	const textPrimary = $derived(isLight ? 'text-[#2b211c]' : 'text-white');
	const textMuted = $derived(isLight ? 'text-[#6f5f55]' : 'text-white/65');
</script>

<div
	class={`pointer-events-none flex h-full min-h-full select-none flex-col ${theme.surfaceClass} ${textPrimary}`}
>
	<header
		class={`flex items-center gap-4 border-b px-6 py-4 ${theme.borderClass} ${isLight ? 'bg-white/80' : 'bg-black/20'}`}
	>
		<AbstractIcon name={theme.icon} class="size-8 shrink-0" width="32" height="32" />
		<div
			class={`flex min-w-0 flex-1 items-center gap-3 rounded-lg border px-4 py-2.5 text-xl ${theme.borderClass} ${isLight ? 'bg-white text-[#6f5f55]' : 'bg-white/5 text-white/50'}`}
		>
			<AbstractIcon name={icons.Search.name} class="size-5 shrink-0" width="20" height="20" />
			<span>Search docs…</span>
		</div>
	</header>

	<div
		class={`mx-6 mt-5 rounded-xl border-2 px-5 py-4 text-center ${theme.borderClass} ${theme.accentSoftClass}`}
	>
		<p class={`text-4xl font-bold tracking-tight ${theme.accentClass}`}>{theme.mockUrl}</p>
		<p class={`mt-1 text-xl ${textMuted}`}>Official install and MCP setup docs</p>
	</div>

	<div class="grid min-h-0 flex-1 grid-cols-[12rem_1fr] gap-5 p-6 pt-5">
		<aside class={`space-y-4 text-lg ${textMuted}`}>
			<div>
				<p class="mb-2 text-base font-semibold uppercase tracking-wide opacity-70">Getting started</p>
				<ul class="space-y-1.5">
					<li class={`rounded-lg px-3 py-2 text-xl font-semibold ${theme.accentSoftClass}`}>Install</li>
					<li class="px-3 text-lg">MCP setup</li>
					<li class="px-3 text-lg">Configuration</li>
				</ul>
			</div>
		</aside>

		<main class="min-w-0 space-y-5">
			<div class="space-y-2">
				<p class={`text-lg font-semibold uppercase tracking-wide ${theme.accentClass}`}>Install</p>
				<h1 class="text-5xl font-bold tracking-tight">{theme.productLabel}</h1>
				<p class={`text-2xl leading-snug ${textMuted}`}>
					Download and install {theme.productLabel}, then configure MCP for your workflow.
				</p>
			</div>

			<div
				class={`rounded-xl border p-4 ${theme.borderClass} ${isLight ? 'bg-white shadow-sm' : 'bg-white/[0.03]'}`}
			>
				<AbstractIcon
					name={icons.Terminal.name}
					class={`mb-2 size-7 ${theme.accentClass}`}
					width="28"
					height="28"
				/>
				<p class="text-2xl font-bold">Get started</p>
				<p class={`mt-1 text-xl leading-snug ${textMuted}`}>
					Follow the official install guide, then return here to wire OpenQuok MCP.
				</p>
			</div>
		</main>
	</div>
</div>
