<script lang="ts">
	import type { McpWorkflowAnalyticsMockContentId } from '$lib/ui/templates/device-mocks/safari/mcpWorkflowAnalyticsMockConfig';
	import {
		getMcpWorkflowAnalyticsMockTheme,
		MCP_ANALYTICS_FOLLOW_UP_RESPONSE,
		MCP_ANALYTICS_FOLLOW_UP_USER,
		MCP_ANALYTICS_RESPONSE_LINES,
		MCP_ANALYTICS_USER_PROMPT
	} from '$lib/ui/templates/device-mocks/safari/mcpWorkflowAnalyticsMockConfig';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		content: McpWorkflowAnalyticsMockContentId;
	};

	let { content }: Props = $props();

	const theme = $derived(getMcpWorkflowAnalyticsMockTheme(content));
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
			<span class={`ml-auto text-xs ${textMuted}`}>openquok MCP</span>
		</header>

		<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
			<div class={`max-w-[85%] self-end rounded-2xl px-3 py-2 text-sm ${userBubble}`}>
				{MCP_ANALYTICS_USER_PROMPT}
			</div>
			<div class={`max-w-[90%] self-start rounded-xl px-3 py-2 text-xs ${assistantBubble}`}>
				<p class={`font-medium ${theme.accentClass}`}>Pulled platform analytics (7d)</p>
				<ul class={`mt-2 space-y-1 ${textMuted}`}>
					{#each MCP_ANALYTICS_RESPONSE_LINES as line (line)}
						<li>{line}</li>
					{/each}
				</ul>
			</div>
			<div class={`max-w-[85%] self-end rounded-2xl px-3 py-2 text-sm ${userBubble}`}>
				{MCP_ANALYTICS_FOLLOW_UP_USER}
			</div>
			<div class={`max-w-[90%] self-start rounded-xl px-3 py-2 text-xs ${assistantBubble}`}>
				{MCP_ANALYTICS_FOLLOW_UP_RESPONSE}
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

		<div class="flex flex-1 flex-col gap-3 overflow-hidden p-4 font-mono text-sm leading-relaxed">
			<p class={textMuted}>
				<span class={theme.accentClass}>›</span>
				{MCP_ANALYTICS_USER_PROMPT}
			</p>
			<div class={`rounded-lg border px-3 py-2 text-xs ${theme.borderClass} ${assistantBubble}`}>
				<p class={theme.accentClass}>Pulled platform analytics (7d)</p>
				{#each MCP_ANALYTICS_RESPONSE_LINES as line (line)}
					<p class={`mt-1.5 ${textMuted}`}>{line}</p>
				{/each}
			</div>
			<p class={textMuted}>
				<span class={theme.accentClass}>›</span>
				{MCP_ANALYTICS_FOLLOW_UP_USER}
			</p>
			<p class={`text-xs ${textMuted}`}>{MCP_ANALYTICS_FOLLOW_UP_RESPONSE}</p>
		</div>
	{:else}
		<header
			class={`flex items-center gap-3 border-b px-5 py-4 ${theme.borderClass} bg-white/70`}
		>
			<AbstractIcon name={theme.icon} class="size-7 shrink-0" width="28" height="28" />
			<div>
				<p class="text-lg font-semibold text-[#2b211c]">{theme.productLabel}</p>
				<p class="text-sm text-[#6f5f55]">Analytics session</p>
			</div>
		</header>

		<div class="flex flex-1 flex-col gap-3 overflow-hidden p-5">
			<div class="rounded-2xl border border-[#e7ddd4] bg-[#fffdfa] p-4">
				<p class="text-sm font-medium text-[#6f5f55]">You asked</p>
				<p class="mt-1 text-base text-[#2b211c]">{MCP_ANALYTICS_USER_PROMPT}</p>
			</div>
			<div class="rounded-2xl border border-[#e7ddd4] bg-white p-4 text-sm text-[#2b211c]">
				<p class={`text-xs font-semibold uppercase tracking-wide ${theme.accentClass}`}
					>openquok MCP</p
				>
				<ul class="mt-3 space-y-1.5 text-[#6f5f55]">
					{#each MCP_ANALYTICS_RESPONSE_LINES as line (line)}
						<li>{line}</li>
					{/each}
				</ul>
				<p class="mt-4 text-[#2b211c]">{MCP_ANALYTICS_FOLLOW_UP_RESPONSE}</p>
			</div>
		</div>
	{/if}
</div>
