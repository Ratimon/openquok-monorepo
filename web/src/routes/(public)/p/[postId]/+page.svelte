<script lang="ts">
	import type { PageData } from './$types';

	import { toast } from '$lib/ui/sonner';
	import { page } from '$app/state';
	import { url } from '$lib/utils/path';
	import { publicPreviewPostByIdPagePresenter } from '$lib/area-public';

	import Comments from '$lib/ui/components/preview/Comments.svelte';
	import CopyClient from '$lib/ui/components/preview/CopyClient.svelte';
	import RenderPreviewDate from '$lib/ui/components/preview/RenderPreviewDate.svelte';
	import VideoOrImage from '$lib/ui/components/VideoOrImage.svelte';

	let { data }: { data: PageData } = $props();

	$effect(() => {
		if (data?.loadError) {
			toast.error(data.loadError || 'Could not load preview.');
		}
	});

	const showShare = $derived(page.url.searchParams.get('share') === 'true');

	// Prefer SSR data; fall back to presenter state (client-side refreshes).
	const previewPostVm = $derived(data.postVm ?? publicPreviewPostByIdPagePresenter.currentPreviewPostVm);
</script>

<div class="min-h-screen bg-base-200 text-base-content">
	{#if data.loadError}
		<div class="fixed inset-0 flex items-center justify-center p-6 text-[20px] text-base-content">
			{data.loadError || 'Could not load preview.'}
		</div>
	{:else if previewPostVm}
		<div class="border-b border-base-300 bg-base-100/80 backdrop-blur">
			<div class="mx-auto flex w-full max-w-[1346px] items-center justify-between gap-3 px-4 py-3">
				<a href="/" class="flex items-center gap-3 text-base-content">
					<img
						src={url('/icon.svg')}
						alt="Logo"
						width="55"
						height="55"
						class="h-10 w-10 shrink-0"
					/>
					<div class="text-2xl font-semibold tracking-tight">
						Openquok
					</div>
				</a>
				<div class="flex items-center gap-4 text-sm text-base-content/70">
					{#if showShare}
						<CopyClient />
					{/if}
					<div class="whitespace-nowrap">
						Publication Date: <RenderPreviewDate date={previewPostVm.publishDateIso} />
					</div>
				</div>
			</div>
		</div>

		<div class="mx-auto flex w-full max-w-[1346px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start">
			<div class="min-w-0 flex-1">
				<div class="rounded-lg border border-base-300 bg-base-100 p-4 text-base-content">
					<div class="whitespace-pre-wrap text-sm">{@html previewPostVm.content}</div>

					{#if Array.isArray(previewPostVm.media) && previewPostVm.media.length > 0}
						<div class="mt-4 flex w-full gap-3">
							{#each previewPostVm.media as m (m.id)}
								<div class="flex-1 overflow-hidden rounded-lg border border-base-300 bg-base-200">
									<VideoOrImage src={m.path} autoplay={true} isContain={true} />
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			<div class="w-full lg:w-96 lg:shrink-0">
				<Comments
					postId={previewPostVm.id}
					organizationId={previewPostVm.organizationId}
					/>
			</div>
		</div>
	{:else}
		<div class="fixed inset-0 flex items-center justify-center p-6 text-[20px] text-base-content">
			Could not load preview.
		</div>
	{/if}
</div>

