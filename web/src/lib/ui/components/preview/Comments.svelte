<script lang="ts">
	import type { PostCommentViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { cn, formatPassedTime } from '$lib/ui/helpers/common';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';

	import SignInToCommentModal from '$lib/ui/components/blog-post/SignInToCommentModal.svelte';

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
		/** Opens upgrade modal when a logged-in user posts without collaboration access. */
		onUpgradeRequired?: () => void;
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
		onUpgradeRequired,
		class: className = ''
	}: Props = $props();

	let commentContent = $state('');
	let showSignInDialog = $state(false);

	const canPostComments = $derived(isLoggedIn && collaborationCommentsEnabled);
	const showComposer = $derived(isLoggedIn || sharePostPreviewEnabled);

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
		const trimmedComment = commentContent.trim();
		if (!trimmedComment.length) return;

		if (!isLoggedIn) {
			showSignInDialog = true;
			return;
		}

		if (!canPostComments) {
			onUpgradeRequired?.();
			return;
		}

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
					Add notes on this share link. Posting requires Team or higher on your plan.
				{:else if sharePostPreviewEnabled}
					Sign in to add collaboration notes on this share link. Scheduled social thread replies are shown
					in the main preview.
				{:else}
					Collaboration comments are not available on this workspace&apos;s plan. You can still view the
					scheduled post preview.
				{/if}
			</p>
		</div>

		{#if showComposer}
			<form
				class="space-y-3 rounded-lg border border-base-300 bg-base-200/50 p-3"
				onsubmit={(e) => {
					e.preventDefault();
					void handleSubmitComment();
				}}
			>
				<div class="text-sm text-base-content/70">
					{#if isLoggedIn}
						Commenting as {currentUserLabel ?? 'current user'}
					{:else}
						Sign in to add a comment
					{/if}
				</div>
				<Textarea
					bind:value={commentContent}
					placeholder="Add a comment..."
					class="min-h-[104px] resize-none bg-base-100"
					maxlength={1000}
					disabled={submittingComment}
				/>
				<div class="flex flex-wrap items-center justify-between gap-3">
					<span class="text-xs text-base-content/50">{commentContent.length}/1000</span>
					<div class="flex flex-wrap items-center gap-2">
						<Button
							type="submit"
							disabled={submittingComment || !commentContent.trim().length}
						>
							{submittingComment ? 'Posting...' : 'Post'}
						</Button>
					</div>
				</div>
			</form>
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

<SignInToCommentModal bind:open={showSignInDialog} signInHref={signInHref} />
