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

	let { channel, previewText, maximumCharacters = 500, mediaUrls = [] }: Props = $props();

	const cropped = $derived(previewText.slice(0, maximumCharacters));
	const overflow = $derived(previewText.slice(maximumCharacters));

	// We don't currently have a separate `display`/handle field on `CreateSocialPostChannelViewModel`.
	// Use a reasonable UI fallback to match the original structure.
	const handle = $derived((channel.name || '').trim() || 'username');
</script>

<div class="rounded-xl border border-base-300 bg-base-100 text-base-content overflow-hidden">
	<div class="flex gap-3 p-4">
		<div class="relative h-10 w-10 shrink-0">
			{#if channel.pictureUrl}
				<img
					src={channel.pictureUrl}
					alt={channel.name}
					class="h-10 w-10 rounded-full bg-base-200 object-cover"
				/>
			{:else}
				<span class="h-10 w-10 rounded-full bg-base-200 flex items-center justify-center">
					<AbstractIcon name={icons.User1.name} class="size-5 text-base-content/60" width="20" height="20" />
				</span>
			{/if}

			<span class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-base-100 ring-1 ring-base-300">
				<AbstractIcon name={icons.Threads.name} class="size-3.5 text-base-content" width="14" height="14" />
			</span>
		</div>

		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<div class="truncate text-[15px] font-bold leading-5 text-base-content">{channel.name}</div>
				<AbstractIcon
					name={icons.VerifiedBadge.name}
					class="size-[18px] text-sky-500"
					width="18"
					height="18"
				/>

				<div class="truncate text-[15px] text-base-content/50">{handle}</div>
			</div>

			<div class="mt-1 text-[15px] leading-6">
				{#if previewText.length === 0}
					<p class="text-base-content/60">Start writing your post for a preview</p>
				{:else}
					<p class="whitespace-pre-wrap">
						<span>{cropped}</span>
						{#if overflow.length}
							<mark class="bg-red-500/15 text-base-content/90" title="This text will be cropped">{overflow}</mark>
						{/if}
					</p>
				{/if}
			</div>
			{#if mediaUrls.length > 0}
				<div class="mt-3 overflow-hidden rounded-lg border border-base-300">
					<SliderComponent class="aspect-[4/3] w-full" urls={mediaUrls} alt="" />
				</div>
			{/if}
		</div>
	</div>
</div>

