<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SliderComponent from '$lib/ui/slider/SliderComponent.svelte';

	type Props = {
		channel: CreateSocialPostChannelViewModel;
		previewText: string;
		maximumCharacters?: number;
		mediaUrls?: string[];
	};

	let { channel, previewText, maximumCharacters = 2200, mediaUrls = [] }: Props = $props();

	const identifier = $derived((channel.identifier ?? '').toLowerCase());
	const isInstagram = $derived(identifier.startsWith('instagram'));

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));
</script>

<div class="bg-[#0f0f10] text-white rounded-xl border border-white/10 overflow-hidden">
	<div class="flex items-center gap-3 px-4 py-3">
		<img
			src={channel.picture || '/no-picture.jpg'}
			alt={channel.name}
			class="h-9 w-9 rounded-full bg-white object-cover"
		/>
		<div class="min-w-0">
			<div class="truncate text-sm font-semibold leading-4">{channel.name}</div>
			<div class="text-[11px] text-white/60">{isInstagram ? 'Instagram' : channel.identifier}</div>
		</div>
	</div>

	{#if mediaUrls.length > 0}
		<SliderComponent class="w-full aspect-[16/9] overflow-hidden" urls={mediaUrls} alt="" />
	{:else}
		<div class="aspect-[16/9] w-full bg-[#1a1a1c]"></div>
	{/if}

	<div class="px-4 pt-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<AbstractIcon name={icons.InstagramActionHeart.name} class="size-6" width="24" height="24" />
				<AbstractIcon name={icons.InstagramActionComment.name} class="size-6" width="24" height="24" />
				<AbstractIcon name={icons.InstagramActionShare.name} class="size-6" width="24" height="24" />
			</div>

			<AbstractIcon name={icons.InstagramActionBookmark.name} class="size-6" width="24" height="24" />
		</div>

		<!-- <div class="mt-2 flex items-center gap-4 text-sm font-semibold text-white/90">
			<div class="flex items-center gap-2">
				<span>121</span>
			</div>
			<div class="flex items-center gap-2">
				<span>32</span>
			</div>
		</div> -->
	</div>

	<div class="px-4 py-3 text-sm leading-5">
		{#if previewText.length === 0}
			<p class="text-white/60">Start writing your post for a preview</p>
		{:else}
			<p class="whitespace-pre-wrap">
				<strong class="font-semibold">{channel.name} </strong>
				<span>{cropped}</span>
				{#if overflow.length}
					<mark class="bg-red-500/25 text-white/90" title="This text will be cropped">{overflow}</mark>
				{/if}
			</p>
		{/if}
	</div>
</div>
