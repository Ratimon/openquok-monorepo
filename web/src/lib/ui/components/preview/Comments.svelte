<script lang="ts">
	import type { PostCommentProgrammerModel } from '$lib/posts';
	import { onMount } from 'svelte';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn, formatPassedTime } from '$lib/ui/helpers/common';
	import { toast } from '$lib/ui/sonner';
	import { Textarea } from '$lib/ui/textarea';

	type Props = {
		postId: string;
		organizationId: string;
		isLoggedIn: boolean;
		currentUserLabel?: string | null;
		signInHref: string;
		loadComments: (
			postId: string
		) => Promise<{ ok: true; comments: PostCommentProgrammerModel[] } | { ok: false; error: string }>;
		submitComment: (params: {
			postId: string;
			organizationId: string;
			comment: string;
		}) => Promise<{ ok: true; comment: PostCommentProgrammerModel } | { ok: false; error: string }>;
		class?: string;
	};

	let {
		postId,
		organizationId,
		isLoggedIn,
		currentUserLabel = null,
		signInHref,
		loadComments,
		submitComment,
		class: className = ''
	}: Props = $props();

	let comments = $state<PostCommentProgrammerModel[]>([]);
	let commentContent = $state('');
	let loadingComments = $state(true);
	let submittingComment = $state(false);

	let commentsHeading = $derived(comments.length === 1 ? '1 Comment' : `${comments.length} Comments`);
	let userLabels = $derived.by(() => {
		const labels: Record<string, string> = {};
		let counter = 1;
		for (const comment of comments) {
			if (!labels[comment.userId]) {
				labels[comment.userId] = `User ${counter}`;
				counter += 1;
			}
		}
		return labels;
	});

	async function refreshComments(): Promise<void> {
		loadingComments = true;
		const result = await loadComments(postId);
		if (result.ok) {
			comments = result.comments;
		} else {
			toast.error(result.error);
		}
		loadingComments = false;
	}

	async function handleSubmitComment(): Promise<void> {
		const trimmedComment = commentContent.trim();
		if (!trimmedComment.length) {
			toast.error('Comment is required.');
			return;
		}

		submittingComment = true;
		const result = await submitComment({ postId, organizationId, comment: trimmedComment });
		submittingComment = false;

		if (!result.ok) {
			toast.error(result.error);
			return;
		}

		commentContent = '';
		comments = [...comments, result.comment];
		toast.success('Comment posted.');
	}

	onMount(() => {
		void refreshComments();
	});
</script>

<div
	data-testid="preview-comments"
	class={cn('rounded-lg border border-base-300 bg-base-100 p-4 text-base-content', className)}
>
	<div class="space-y-4">
		<div class="space-y-1">
			<h2 class="text-lg font-semibold">{commentsHeading}</h2>
			<p class="text-sm text-base-content/65">
				Join the conversation on this post preview.
			</p>
		</div>

		{#if isLoggedIn}
			<div class="space-y-3 rounded-lg border border-base-300 bg-base-200/50 p-3">
				<div class="text-sm text-base-content/70">
					Commenting as {currentUserLabel ?? 'current user'}
				</div>
				<Textarea
					bind:value={commentContent}
					placeholder="Add a comment..."
					class="min-h-[104px] resize-none bg-base-100"
					maxlength={1000}
				/>
				<div class="flex items-center justify-between gap-3">
					<span class="text-xs text-base-content/50">{commentContent.length}/1000</span>
					<Button
						type="button"
						disabled={submittingComment || !commentContent.trim().length}
						onclick={() => void handleSubmitComment()}
					>
						{submittingComment ? 'Posting...' : 'Post'}
					</Button>
				</div>
			</div>
		{:else}
			<div class="rounded-lg border border-dashed border-base-300 bg-base-200/40 p-4">
				<Button href={signInHref} class="w-full" checkCurrent={false}>
					Login / Register to add comments
				</Button>
			</div>
		{/if}

		<div class="space-y-3">
			{#if loadingComments}
				<p class="text-sm text-base-content/60">Loading comments...</p>
			{:else if comments.length === 0}
				<p class="text-sm text-base-content/60">No comments yet.</p>
			{:else}
				{#each comments as comment (comment.id)}
					<div class="border-t border-base-300 pt-3 first:border-t-0 first:pt-0">
						<div class="flex items-center justify-between gap-3">
							<h3 class="text-sm font-medium">
								{userLabels[comment.userId] ?? 'User'}
							</h3>
							<time class="text-xs text-base-content/50">{formatPassedTime(comment.createdAt)}</time>
						</div>
						<p class="mt-2 whitespace-pre-wrap text-sm text-base-content/80">
							{comment.content}
						</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
