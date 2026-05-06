<script lang="ts">
	import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';

	import AddPostButton from '$lib/ui/components/posts/AddPostButton.svelte';
	import EditorPost from '$lib/ui/components/posts/EditorPost.svelte';
	import Delay from '$lib/ui/components/posts/thread/Delay.svelte';

	export type ThreadReplyViewModel = { id: string; message: string; delaySeconds: number };

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
				Follow-up comments</div>
			<AddPostButton onclick={onAddReply} {postComment} disabled={disabled} />
		</div>

		{#if id === 'threads'}
			<p class="mt-2 rounded-md border border-base-300/80 bg-base-200/25 px-3 py-2 text-sm leading-snug text-base-content/75">
				<span class="font-medium text-base-content/90">
					Threads timing:
				</span>
				Each reply runs after your chosen delay; Meta may take a few seconds before the reply appears on the network.
				The “≈” line uses your scheduled main post time plus your delays only (no extra fixed wait on our servers).
			</p>
		{:else if id.startsWith('instagram')}
			<p class="text-base-content/75 mt-2 rounded-md border border-base-300/80 bg-base-200/25 px-3 py-2 text-sm leading-snug">
				<span class="text-base-content/90 font-medium">
					Instagram:
				</span>
				Each item is published as a comment on your post (chained as replies when the network supports it).
			</p>
		{/if}

		{#if id !== 'threads' && !id.startsWith('instagram')}
			<p class="text-base-content/60 mt-2 text-sm">
				Follow-up comments are supported on Threads and Instagram only.
			</p>
		{:else if replies.length === 0}
			<p class="text-base-content/60 mt-2 text-sm">
				Add follow-up comments to publish after the main post.
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
							/>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

