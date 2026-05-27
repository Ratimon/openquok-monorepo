<script lang="ts">
	import type { PostCommentViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { cn, formatPassedTime } from '$lib/ui/helpers/common';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';

	type Props = {
		postId: string;
		organizationId: string;
		isLoggedIn: boolean;
		currentUserLabel?: string | null;
		signInHref: string;
		comments: PostCommentViewModel[];
		submitComment: (params: {
			postId: string;
			organizationId: string;
			comment: string;
		}) => Promise<PostCommentViewModel | null>;
		submittingComment?: boolean;
		/** When false, share preview login CTA is hidden (workspace plan). */
		sharePostPreviewEnabled?: boolean;
		/** When false, the signed-in viewer cannot post comments (workspace + account plan). */
		collaborationCommentsEnabled?: boolean;
		/** Billing / plans link when comments are plan-gated (e.g. SOLO). */
		upgradeHref?: string;
		class?: string;
	};

	let {
		postId,
		organizationId,
		isLoggedIn,
		currentUserLabel = null,
		signInHref,
		comments,
		submitComment,
		submittingComment = false,
		sharePostPreviewEnabled = false,
		collaborationCommentsEnabled = false,
		upgradeHref,
		class: className = ''
	}: Props = $props();

	let commentContent = $state('');

	const canPostComments = $derived(isLoggedIn && collaborationCommentsEnabled);

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

	async function handleSubmitComment(): Promise<void> {
		if (!canPostComments) return;

		const trimmedComment = commentContent.trim();
		if (!trimmedComment.length) return;

		const comment = await submitComment({ postId, organizationId, comment: trimmedComment });
		if (!comment) return;

		commentContent = '';
	}
</script>

<div
	data-testid="preview-comments"
	class={cn('rounded-lg border border-base-300 bg-base-100 p-4 text-base-content', className)}
>
	<div class="space-y-4">
		<div class="space-y-1">
			<h2 class="text-lg font-semibold">
				{commentsHeading}
			</h2>
			<p class="text-sm text-base-content/65">
				{#if canPostComments}
					Join conversation or add notes on this share link. Scheduled social thread replies are shown in
					the main preview.
				{:else if isLoggedIn}
					Collaboration comments are not available on your current plan. You can still view the scheduled
					post preview.
				{:else if sharePostPreviewEnabled}
					Sign in to add collaboration notes on this share link. Scheduled social thread replies are shown
					in the main preview.
				{:else}
					Collaboration comments are not available on this workspace&apos;s plan. You can still view the
					scheduled post preview.
				{/if}
			</p>
		</div>

		{#if isLoggedIn}
			<div class="space-y-3 rounded-lg border border-base-300 bg-base-200/50 p-3">
				<div class="text-sm text-base-content/70">
					Commenting as {currentUserLabel ?? 'current user'}
				</div>
				<Textarea
					bind:value={commentContent}
					placeholder={canPostComments
						? 'Add a comment...'
						: 'Collaboration comments require Creator or higher.'}
					class="min-h-[104px] resize-none bg-base-100 disabled:cursor-not-allowed disabled:opacity-60"
					maxlength={1000}
					disabled={!canPostComments}
					readonly={!canPostComments}
				/>
				<div class="flex flex-wrap items-center justify-between gap-3">
					<span class="text-xs text-base-content/50">{commentContent.length}/1000</span>
					<div class="flex flex-wrap items-center gap-2">
						{#if !canPostComments && upgradeHref}
							<Button href={upgradeHref} variant="secondary" size="sm" checkCurrent={false}>
								View plans
							</Button>
						{/if}
						<Button
							type="button"
							disabled={!canPostComments ||
								submittingComment ||
								!commentContent.trim().length}
							onclick={() => void handleSubmitComment()}
						>
							{submittingComment ? 'Posting...' : 'Post'}
						</Button>
					</div>
				</div>
			</div>
		{:else if sharePostPreviewEnabled}
			<div class="rounded-lg border border-dashed border-base-300 bg-base-200/40 p-4">
				<Button href={signInHref} class="w-full" checkCurrent={false}>
					Login to add comments
				</Button>
			</div>
		{/if}

		<div class="space-y-3">
			{#if comments.length === 0}
				<p class="text-sm text-base-content/60">
					No comments yet.</p>
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
