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
			class="ml-auto shrink-0 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-300"
			>Session 2</span
		>
	</header>

	<div class="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-3">
		<div class="max-w-[88%] self-end rounded-xl bg-[#007acc] px-3 py-2 text-[11px] leading-snug">
			What performed best on my channels over the last 7 days? Break down impressions and engagement.
		</div>

		<div
			class="max-w-[92%] self-start rounded-xl border border-white/5 bg-[#2a2a2a] px-3 py-2 text-[11px] leading-snug"
		>
			<p class="font-medium text-violet-300">Pulled platform analytics (7d)</p>
			<p class="mt-1.5 text-white/85">
				Top post: <strong class="text-white">12.4k impressions</strong>, 842 reactions — carousel on
				product tips.
			</p>
			<p class="mt-1.5 text-white/70">
				Facebook Page leads with <strong class="text-emerald-300">+24% impressions</strong> vs last week.
			</p>
		</div>

		<div class="max-w-[88%] self-end rounded-xl bg-[#007acc] px-3 py-2 text-[11px] leading-snug">
			Compare that post on TikTok vs Instagram Reels.
		</div>

		<div
			class="max-w-[92%] self-start rounded-xl border border-white/5 bg-[#2a2a2a] px-3 py-2 text-[11px] leading-snug"
		>
			TikTok: <strong class="text-white">48k views</strong>, 2.1k likes. IG Reel:
			<strong class="text-white">31k plays</strong>, 312 saves. TikTok wins reach; IG leads on saves.
		</div>
	</div>
</div>
