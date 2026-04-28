<script lang="ts">
	import { toast } from '$lib/ui/sonner';
	import { page } from '$app/state';
	import CopyClient from '$lib/ui/components/preview/CopyClient.svelte';
	import RenderPreviewDate from '$lib/ui/components/preview/RenderPreviewDate.svelte';
	import VideoOrImage from '$lib/ui/components/VideoOrImage.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	$effect(() => {
		if (data?.ok === false) {
			toast.error(data.error || 'Could not load preview.');
		}
	});

	const showShare = $derived(page.url.searchParams.get('share') === 'true');
</script>

<div class="min-h-screen bg-base-200 text-base-content">
	{#if data.ok === false}
		<div class="fixed inset-0 flex items-center justify-center p-6 text-[20px] text-base-content">
			{data.error || 'Could not load preview.'}
		</div>
	{:else}
		<div class="border-b border-base-300 bg-base-100/80 backdrop-blur">
			<div class="mx-auto flex w-full max-w-[1346px] items-center justify-between gap-3 px-4 py-3">
				<a href="/" class="flex items-center gap-3 text-base-content">
					<div class="text-2xl font-semibold tracking-tight">
						Openquok
					</div>
					
				</a>
				<div class="flex items-center gap-4 text-sm text-base-content/70">
					{#if showShare}
						<CopyClient />
					{/if}
					<div class="whitespace-nowrap">
						Publication Date: <RenderPreviewDate date={data.post.publishDateIso} />
					</div>
				</div>
			</div>
		</div>

		<div class="mx-auto w-full max-w-[1346px] px-4 py-6">
			<div class="rounded-lg border border-base-300 bg-base-100 p-4 text-base-content">
				<div class="whitespace-pre-wrap text-sm">{@html data.post.content}</div>

				{#if Array.isArray(data.post.media) && data.post.media.length > 0}
					<div class="mt-4 flex w-full gap-3">
						{#each data.post.media as m (m.id)}
							<div class="flex-1 overflow-hidden rounded-lg border border-base-300 bg-base-200">
								<VideoOrImage src={m.path} autoplay={true} isContain={true} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

