<script lang="ts">
	import type { AgentDesktopChatMockProps } from '$lib/ui/templates/device-mocks/desktop/agentDesktopParallelMock.types';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = AgentDesktopChatMockProps;

	let { agentIcon, agentLabel }: Props = $props();
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#1e1e1e] font-sans text-white"
>
	<header class="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
		<AbstractIcon name={agentIcon} class="size-5 shrink-0" width="20" height="20" aria-hidden="true" />
		<span class="truncate text-sm font-semibold">{agentLabel}</span>
		<span
			class="ml-auto shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300"
			>Session 1</span
		>
	</header>

	<div class="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-3">
		<div class="max-w-[88%] self-end rounded-xl bg-[#007acc] px-3 py-2 text-[11px] leading-snug">
			Draft and schedule my product launch thread for Tuesday at 9am across Facebook, Instagram, and
			Threads.
		</div>

		<div
			class="max-w-[92%] self-start rounded-xl border border-white/5 bg-[#2a2a2a] px-3 py-2 text-[11px] leading-snug"
		>
			<p class="font-medium text-emerald-300">On it — openquok-core</p>
			<p class="mt-1.5 text-white/70">Created drafts with cover image attached.</p>
			<ul class="mt-2 space-y-0.5 text-white/85">
				<li>• Facebook — Tue 9:00 AM</li>
				<li>• Instagram — Tue 9:00 AM</li>
				<li>• Threads — Tue 9:00 AM</li>
			</ul>
			<p class="mt-2 text-emerald-200">✓ Queued for Tue 9:00 AM · ref oq-7f3a</p>
		</div>
	</div>
</div>
