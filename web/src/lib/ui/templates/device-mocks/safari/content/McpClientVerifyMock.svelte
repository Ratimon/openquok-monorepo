<script lang="ts">
	import type { McpVerifySafariMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';
	import {
		getMcpVerifyMockTheme,
		MCP_VERIFY_CHANNELS,
		MCP_VERIFY_USER_PROMPT
	} from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		content: McpVerifySafariMockContentId;
	};

	let { content }: Props = $props();

	const theme = $derived(getMcpVerifyMockTheme(content));
	const isLight = $derived(theme.layout === 'cowork');
	const textPrimary = $derived(isLight ? 'text-[#2b211c]' : 'text-white');
	const textMuted = $derived(isLight ? 'text-[#6f5f55]' : 'text-white/65');
	const userBubble = $derived(
		isLight ? 'bg-[#efe6de] text-[#2b211c]' : 'bg-white/10 text-white/90'
	);
	const assistantBubble = $derived(
		isLight ? 'bg-white text-[#2b211c] shadow-sm' : 'bg-[#222] text-white/85'
	);
</script>

<div
	class={`pointer-events-none flex h-full min-h-full select-none flex-col ${theme.surfaceClass} ${textPrimary}`}
>
	{#if theme.layout === 'ide'}
		<header
			class={`flex items-center gap-3 border-b px-4 py-3 ${theme.borderClass} ${isLight ? 'bg-white/80' : 'bg-black/20'}`}
		>
			<AbstractIcon name={theme.icon} class="size-6 shrink-0" width="24" height="24" />
			<span class="text-sm font-semibold">{theme.productLabel}</span>
			<span class={`rounded-full px-2.5 py-0.5 text-xs font-medium ${theme.accentSoftClass}`}
				>{theme.panelLabel}</span
			>
			<span class={`ml-auto text-xs ${textMuted}`}>openquok MCP connected</span>
		</header>

		<div class="grid min-h-0 flex-1 grid-cols-[9rem_1fr]">
			<aside class={`border-r p-3 text-xs ${theme.borderClass} ${textMuted}`}>
				<p class="mb-2 font-semibold uppercase tracking-wide opacity-70">Explorer</p>
				<ul class="space-y-1.5">
					<li class="truncate">src/</li>
					<li class="truncate pl-2">app/</li>
					{#if theme.configFileHint}
						<li class={`truncate rounded px-2 py-1 ${theme.accentSoftClass}`}>{theme.configFileHint}</li>
					{/if}
				</ul>
			</aside>

			<div class="flex min-h-0 flex-col">
				<div
					class={`border-b px-4 py-2 text-xs font-medium ${theme.borderClass} ${theme.accentClass}`}
				>
					{theme.panelLabel}
				</div>
				<div class="flex flex-1 flex-col gap-3 overflow-hidden p-4">
					<div class={`max-w-[85%] self-end rounded-2xl px-3 py-2 text-sm ${userBubble}`}>
						{MCP_VERIFY_USER_PROMPT}
					</div>
					<div class={`max-w-[90%] self-start rounded-xl px-3 py-2 text-xs ${assistantBubble}`}>
						<p class={`font-mono text-[11px] ${theme.accentClass}`}>integrationList</p>
						<p class={`mt-2 text-sm ${textMuted}`}>Connected channels in your workspace:</p>
						<ul class="mt-2 space-y-1 text-sm">
							{#each MCP_VERIFY_CHANNELS as channel (channel)}
								<li>• {channel}</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</div>
	{:else if theme.layout === 'terminal'}
		<header
			class={`flex items-center gap-3 border-b px-4 py-3 ${theme.borderClass} ${isLight ? 'bg-white/80' : 'bg-black/25'}`}
		>
			<AbstractIcon name={theme.icon} class="size-6 shrink-0" width="24" height="24" />
			<span class="text-sm font-semibold">{theme.productLabel}</span>
			<span class={`text-xs ${textMuted}`}>{theme.panelLabel}</span>
		</header>

		<div class="flex flex-1 flex-col gap-3 p-4 font-mono text-sm leading-relaxed">
			<p class={textMuted}>
				<span class={theme.accentClass}>›</span> {MCP_VERIFY_USER_PROMPT}
			</p>
			<div class={`rounded-lg border px-3 py-2 text-xs ${theme.borderClass} ${assistantBubble}`}>
				<p class={theme.accentClass}>▸ integrationList</p>
				<p class={`mt-2 ${textMuted}`}>Connected channels in your workspace:</p>
				{#each MCP_VERIFY_CHANNELS as channel (channel)}
					<p class="mt-1">- {channel}</p>
				{/each}
			</div>
			<p class={textMuted}>
				<span class={theme.accentClass}>✓</span> openquok MCP verified
			</p>
		</div>
	{:else}
		<header
			class={`flex items-center gap-3 border-b px-5 py-4 ${theme.borderClass} bg-white/70`}
		>
			<AbstractIcon name={theme.icon} class="size-7 shrink-0" width="28" height="28" />
			<div>
				<p class="text-lg font-semibold text-[#2b211c]">{theme.productLabel}</p>
				<p class="text-sm text-[#6f5f55]">Organization connectors</p>
			</div>
		</header>

		<div class="flex flex-1 flex-col gap-4 p-5">
			<div class="rounded-2xl border border-[#e7ddd4] bg-white p-4 shadow-sm">
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="font-semibold text-[#2b211c]">openquok</p>
						<p class="text-sm text-[#6f5f55]">HTTP MCP · social scheduling tools</p>
					</div>
					<span class={`rounded-full px-3 py-1 text-xs font-semibold ${theme.accentSoftClass}`}
						>Connected</span
					>
				</div>
			</div>

			<div class="rounded-2xl border border-[#e7ddd4] bg-[#fffdfa] p-4">
				<p class="text-sm font-medium text-[#6f5f55]">You asked</p>
				<p class="mt-1 text-base text-[#2b211c]">{MCP_VERIFY_USER_PROMPT}</p>
			</div>

			<div class="rounded-2xl border border-[#e7ddd4] bg-white p-4">
				<p class={`text-xs font-semibold uppercase tracking-wide ${theme.accentClass}`}
					>integrationList</p
				>
				<ul class="mt-3 space-y-2 text-sm text-[#2b211c]">
					{#each MCP_VERIFY_CHANNELS as channel (channel)}
						<li class="flex items-start gap-2">
							<AbstractIcon
								name={icons.Check.name}
								class="mt-0.5 size-4 shrink-0 text-emerald-600"
								width="16"
								height="16"
							/>
							<span>{channel}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>
