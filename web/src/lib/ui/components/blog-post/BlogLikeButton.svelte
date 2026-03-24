<script lang="ts">
	import type { BlogUpsertProgrammerModel } from '$lib/blog/index';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/ui/tooltip/index';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		postId: string;
		initialLikeCount: number;
		trackBlogLike: (postId: string) => Promise<BlogUpsertProgrammerModel>;
		/** From page presenter `submittingLike` — parent derives from presenter. */
		submittingLike?: boolean;
		class?: string;
	};

	let {
		postId,
		initialLikeCount,
		trackBlogLike,
		submittingLike = false,
		class: className = ''
	}: Props = $props();

	let isLiked = $state(false);
	let optimisticDelta = $state(0);

	let likeCount = $derived((initialLikeCount ?? 0) + optimisticDelta);

	async function onLike() {
		if (!postId || isLiked || submittingLike) return;
		isLiked = true;
		optimisticDelta += 1;
		const result = await trackBlogLike(postId);
		if (!result.success) {
			isLiked = false;
			optimisticDelta -= 1;
		}
	}
</script>

{#if postId}
	<div class={cn('w-fit', className)}>
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							size="sm"
							disabled={isLiked || submittingLike}
							class={cn(
								'flex items-center gap-2 p-2',
								isLiked && 'border-primary text-primary'
							)}
							onclick={onLike}
							aria-labelledby="blog-like-label"
						>
							<AbstractIcon name={icons.ThumbsUp.name} width="24" height="24" />
							<span class="text-sm">
								{likeCount}
							</span>
							<span id="blog-like-label" class="sr-only">
								{isLiked ? 'You liked this post' : 'Like this post'}
							</span>
						</Button>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent>
					<p class="text-base-content">
						{isLiked ? 'You liked this post' : 'Like this post'}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>
{/if}
