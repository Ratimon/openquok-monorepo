<script lang="ts">
	import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';

	import AddPostButton from '$lib/ui/components/posts/AddPostButton.svelte';
	import EditorPost from '$lib/ui/components/posts/EditorPost.svelte';
	import Delay from '$lib/ui/components/posts/thread/Delay.svelte';

	export type ThreadReplyViewModel = { id: string; message: string; delaySeconds: number };

	/** Matches `sleepMs(30_000)` in threadsProvider.comment after container create. */
	const THREADS_PUBLISH_PREPARE_SECONDS = 30;

	type Props = {
		/** Provider identifier (e.g. `threads`). */
		providerIdentifier: string | null;
		/** Button mode from provider config. */
		postComment: PostCommentMode;
		/** Main post schedule (`datetime-local`), same as ManageModal picker. */
		scheduledPostDatetimeLocal?: string | null;
		/** When true, disable editing. */
		disabled?: boolean;
		/** Bound list of thread replies. */
		replies: ThreadReplyViewModel[];
		/** Called when user wants to add a reply. */
		onAddReply: () => void;
		/** Called when replies are updated. */
		onChangeReplies: (next: ThreadReplyViewModel[]) => void;
	};

	let {
		providerIdentifier,
		postComment,
		scheduledPostDatetimeLocal = null,
		disabled = false,
		replies,
		onAddReply,
		onChangeReplies
	}: Props = $props();

	const id = $derived((providerIdentifier ?? '').toLowerCase());

	function removeReply(replyId: string) {
		onChangeReplies(replies.filter((r) => r.id !== replyId));
	}

	function updateReply(replyId: string, patch: Partial<ThreadReplyViewModel>) {
		onChangeReplies(replies.map((r) => (r.id === replyId ? { ...r, ...patch } : r)));
	}
</script>

{#if postComment === 'POST' || postComment === 'COMMENT' || postComment === 'ALL'}
	<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
		<div class="flex items-center justify-between gap-3">
			<div class="text-sm font-medium text-base-content/80">
				Thread replies</div>
			<AddPostButton onclick={onAddReply} {postComment} disabled={disabled} />
		</div>

		{#if id === 'threads'}
			<p class="mt-2 rounded-md border border-base-300/80 bg-base-200/25 px-3 py-2 text-sm leading-snug text-base-content/75">
				<span class="font-medium text-base-content/90">
					Threads timing:
				</span>
				After each reply’s scheduled delay, publishing waits
				<span class="font-semibold tabular-nums text-base-content">{THREADS_PUBLISH_PREPARE_SECONDS} seconds</span>
				while Meta finishes preparing the reply. The Delay row includes this in “≈” time.
			</p>
		{/if}

		{#if id !== 'threads'}
			<p class="mt-2 text-sm text-base-content/60">
				Thread replies are currently supported on Threads only.
			</p>
		{:else if replies.length === 0}
			<p class="mt-2 text-sm text-base-content/60">
				Add follow-up posts to publish as replies after the main post.
			</p>
		{:else}
			<div class="mt-3 space-y-4">
				{#each replies as reply, replyIndex (reply.id)}
					<div class="rounded-lg border border-base-300 bg-base-200/20 p-3">
						<div class="mb-3 flex items-center justify-between gap-3">
							<div class="text-xs font-semibold text-base-content/70">
								Reply</div>
							<button
								type="button"
								class="text-xs font-semibold text-error hover:underline disabled:opacity-60"
								disabled={disabled}
								onclick={() => removeReply(reply.id)}
							>
								Remove
							</button>
						</div>

						<EditorPost
							charCount={(reply.message ?? '').length}
							softCharLimit={500}
							comments={true}
							commentsMode={true}
							busy={disabled}
							bind:body={reply.message}
						/>

						<div class="mt-3">
							<Delay
								disabled={disabled}
								value={reply.delaySeconds}
								onChange={(v) => updateReply(reply.id, { delaySeconds: v })}
								scheduledPostDatetimeLocal={scheduledPostDatetimeLocal}
								delayChainSeconds={replies
									.slice(0, replyIndex + 1)
									.map((r) => r.delaySeconds)}
								threadsPublishPrepareSecondsPerReply={id === 'threads'
									? THREADS_PUBLISH_PREPARE_SECONDS
									: 0}
							/>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

