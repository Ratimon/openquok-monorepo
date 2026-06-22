<script lang="ts">
	import type { IconName } from '$data/icons';

	import TelegramMockAgentHeader from '$lib/ui/templates/device-mocks/iphone-15-pro/content/TelegramMockAgentHeader.svelte';
	import { DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING } from '$lib/ui/templates/device-mocks/iphone-15-pro/telegramMockBranding';

	type Props = {
		agentIcon?: IconName;
		agentLabel?: string;
	};

	let {
		agentIcon = DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING.agentIcon,
		agentLabel = DEFAULT_TELEGRAM_MOCK_AGENT_BRANDING.agentLabel
	}: Props = $props();
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#EAEAEA] font-sans text-sm"
>
	<div class="z-10 shrink-0 bg-[#2EA6DE] text-white shadow-sm">
		<div
			class="flex items-end justify-between px-5 pb-1 text-[11px] font-semibold leading-none tracking-tight"
			style="padding-top: 7%;"
		>
			<span>9:41</span>
			<span class="flex items-center gap-1 opacity-95" aria-hidden="true">
				<span class="text-[8px] tracking-wider">●●●●</span>
				<span class="text-[10px]">100%</span>
			</span>
		</div>

		<TelegramMockAgentHeader {agentIcon} {agentLabel} />
	</div>

	<div
		class="flex flex-1 flex-col gap-3.5 overflow-hidden bg-[#8FAEC9] p-3.5"
		style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 20px 20px;"
	>
		<div class="my-2 text-center">
			<span class="rounded-lg bg-black/20 px-2.5 py-1 text-[11px] text-white">TODAY</span>
		</div>

		<div
			class="max-w-[75%] self-start rounded-xl rounded-tl-sm bg-white px-3.5 py-2.5 leading-snug shadow-sm"
		>
			To connect Telegram, open @BotFather and create a new bot for {agentLabel}.
			<span class="float-right mt-1 ml-2.5 text-[10px] text-[#888]">9:41 AM</span>
		</div>

		<div
			class="max-w-[75%] self-end rounded-xl rounded-tr-sm bg-[#EFFFD3] px-3.5 py-2.5 leading-snug shadow-sm"
		>
			Done — I have the bot token.
			<span class="float-right mt-1 ml-2.5 text-[10px] text-[#888]">9:42 AM</span>
		</div>

		<div
			class="max-w-[75%] self-start rounded-xl rounded-tl-sm bg-white px-3.5 py-2.5 leading-snug shadow-sm"
		>
			Paste it in your {agentLabel} channel settings and I'll handle the rest.
			<span class="float-right mt-1 ml-2.5 text-[10px] text-[#888]">9:42 AM</span>
		</div>
	</div>

	<div class="flex items-center border-t border-[#ddd] bg-[#F7F7F7] p-2.5">
		<span class="px-2.5 text-2xl text-[#888]" aria-hidden="true">📎</span>
		<div
			class="flex-1 rounded-full border border-[#ddd] bg-white px-3.5 py-2.5 text-[15px] text-[#888]"
		>
			Message
		</div>
		<span class="px-2.5 text-2xl text-[#888]" aria-hidden="true">🎤</span>
	</div>
</div>
