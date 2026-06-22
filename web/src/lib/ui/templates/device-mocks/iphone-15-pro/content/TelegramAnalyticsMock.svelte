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
			<span>2:18</span>
			<span class="flex items-center gap-1 opacity-95" aria-hidden="true">
				<span class="text-[8px] tracking-wider">●●●●</span>
				<span class="text-[10px]">100%</span>
			</span>
		</div>

		<TelegramMockAgentHeader {agentIcon} {agentLabel} />
	</div>

	<div
		class="flex flex-1 flex-col gap-2 overflow-hidden bg-[#8FAEC9] p-3.5"
		style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 20px 20px;"
	>
		<div class="my-1 text-center">
			<span class="rounded-lg bg-black/20 px-2.5 py-1 text-[11px] text-white">TODAY</span>
		</div>

		<div
			class="max-w-[78%] self-end rounded-xl rounded-tr-sm bg-[#EFFFD3] px-3 py-2 leading-snug shadow-sm"
		>
			what performed best on my channels last 30 days?
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:10 PM</span>
		</div>

		<div
			class="max-w-[82%] self-start rounded-xl rounded-tl-sm bg-white px-3 py-2 leading-snug shadow-sm"
		>
			Pulled platform analytics (30d). Top post: <strong>12.4k impressions</strong>,
			<strong>842 reactions</strong> — a carousel on product tips. Your Facebook Page leads with
			<strong>+18% engagement</strong> vs the prior month.
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:11 PM</span>
		</div>

		<div
			class="max-w-[78%] self-end rounded-xl rounded-tr-sm bg-[#EFFFD3] px-3 py-2 leading-snug shadow-sm"
		>
			break down that post — likes, comments, shares
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:13 PM</span>
		</div>

		<div
			class="max-w-[82%] self-start rounded-xl rounded-tl-sm bg-white px-3 py-2 leading-snug shadow-sm"
		>
			Post insights (7d): 842 reactions, 156 comments, 89 shares.
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:14 PM</span>
		</div>

		<div
			class="max-w-[78%] self-end rounded-xl rounded-tr-sm bg-[#EFFFD3] px-3 py-2 leading-snug shadow-sm"
		>
			how did that same video do on TikTok vs IG?
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:15 PM</span>
		</div>

		<div
			class="max-w-[82%] self-start rounded-xl rounded-tl-sm bg-white px-3 py-2 leading-snug shadow-sm"
		>
			TikTok: <strong>48k views</strong>, 2.1k likes. IG Reel: <strong>31k plays</strong>, 1.4k
			likes, 312 saves. TikTok wins on reach; IG leads on saves and comment depth.
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:16 PM</span>
		</div>

		<div
			class="max-w-[78%] self-end rounded-xl rounded-tr-sm bg-[#EFFFD3] px-3 py-2 leading-snug shadow-sm"
		>
			does the carousel format still work or should we stick to video?
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:17 PM</span>
		</div>

		<div
			class="max-w-[82%] self-start rounded-xl rounded-tl-sm bg-white px-3 py-2 leading-snug shadow-sm"
		>
			Carousels still hold on Facebook (+18% engagement). Mix both — carousels for FB, short video
			for TikTok and IG Reels.
			<span class="float-right mt-1 ml-2 text-[10px] text-[#888]">2:18 PM</span>
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
