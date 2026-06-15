<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
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

		<div class="flex items-center gap-3 px-3.5 pb-3 pt-1.5">
			<span class="shrink-0 text-lg leading-none opacity-90" aria-hidden="true">‹</span>
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2EA6DE]"
			>
				<AbstractIcon
					name={icons.OpenClaw.name}
					class="size-5"
					width="20"
					height="20"
					aria-hidden="true"
				/>
			</div>
			<div class="min-w-0">
				<h2 class="truncate text-base font-semibold leading-tight">OpenClaw</h2>
				<p class="mt-0.5 text-xs opacity-80">bot</p>
			</div>
		</div>
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
