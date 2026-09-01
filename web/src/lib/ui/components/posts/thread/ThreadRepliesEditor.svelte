<script lang="ts">
	import type { PostMediaProgrammerModel } from '$lib/posts';
	import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';
	import type { LaunchProviderCommentsMode } from '$lib/ui/components/posts/providers/provider.types';

	import { icons } from '$data/icons';
	import { channelSupportsFollowUpComments } from '$lib/posts/utils/create-post/followUp';
	import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
	import { X_MAX_IMAGES } from '$lib/ui/components/posts/providers/x/x.provider';

	import AddPostButton from '$lib/ui/components/posts/AddPostButton.svelte';
	import EditorPost from '$lib/ui/components/posts/EditorPost.svelte';
	import Delay from '$lib/ui/components/posts/thread/Delay.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	export type ThreadReplyViewModel = {
		id: string;
		message: string;
		delaySeconds: number;
		media?: PostMediaProgrammerModel[];
	};

	type Props = {
		/** Provider identifier (e.g. `threads`). */
		providerIdentifier: string | null;
		/** Button mode from provider config. */
		postComment: PostCommentMode;
		/** Per-reply character limit from provider config (defaults to 500). */
		replySoftCharLimit?: number;
		/** Main post schedule (`datetime-local`), same as ManageModal picker. */
		scheduledPostDatetimeLocal?: string | null;
		/** Auth uid for multipart upload field; storage path uses JWT on the server. */
		uploadUid?: string;
		/** Scheduled publish time (ISO) — selects the media library folder for composer uploads. */
		publishDateIso?: string | null;
		/** Current workspace for org-scoped signatures in the toolbar. */
		organizationId?: string | null;
		/** When true, disable editing. */
		disabled?: boolean;
		/** Bound list of thread replies. */
		replies: ThreadReplyViewModel[];
		/** Called when user wants to add a reply. */
		onAddReply: () => void;
		/** Optional action to open plug settings (Threads only). */
		onOpenPlugSettings?: () => void;
		/** Called when replies are updated. */
		onChangeReplies: (next: ThreadReplyViewModel[]) => void;
		/** Hide provider timing help (e.g. landing bento previews). */
		hideProviderHelp?: boolean;
		/** Shorter reply editors for landing previews. */
		compactEditor?: boolean;
		/** Public tool composer: local blob attach only. */
		guestMode?: boolean;
		/** Signed-in composer: open alt / video poster settings on a reply attachment. */
		onOpenComposerMediaSettings?: (replyId: string, mediaIndex: number) => void;
	};

	let {
		providerIdentifier,
		postComment,
		replySoftCharLimit = 500,
		scheduledPostDatetimeLocal = null,
		uploadUid = '',
		publishDateIso = null,
		organizationId = null,
		disabled = false,
		replies,
		onAddReply,
		onOpenPlugSettings = undefined,
		onChangeReplies,
		hideProviderHelp = false,
		compactEditor = false,
		guestMode = false,
		onOpenComposerMediaSettings = undefined
	}: Props = $props();

	const id = $derived((providerIdentifier ?? '').toLowerCase());

	const supportsFollowUps = $derived(channelSupportsFollowUpComments(providerIdentifier));

	const commentsMode = $derived.by((): LaunchProviderCommentsMode => {
		const cfg = getLaunchProviderConfig(providerIdentifier);
		if (cfg.comments === 'no-media') return 'no-media';
		if (cfg.comments === false) return false;
		return true;
	});

	const replyMaxMediaItems = $derived.by((): number | null => {
		if (commentsMode !== true) return null;
		if (id === 'facebook') return 1;
		if (id === 'x') return X_MAX_IMAGES;
		return null;
	});

	function removeReply(replyId: string) {
		onChangeReplies(replies.filter((r) => r.id !== replyId));
	}

	function moveReply(fromIndex: number, toIndex: number) {
		if (toIndex < 0 || toIndex >= replies.length) return;
		const next = [...replies];
		const [row] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, row);
		onChangeReplies(next);
	}

	function updateReply(replyId: string, patch: Partial<ThreadReplyViewModel>) {
		onChangeReplies(replies.map((r) => (r.id === replyId ? { ...r, ...patch } : r)));
	}

	function editorCommentsMode(): boolean | 'no-media' {
		if (commentsMode === 'no-media') return 'no-media';
		if (commentsMode !== true) return 'no-media';
		return true;
	}

	function syncReplyMedia(replyId: string, items: PostMediaProgrammerModel[]) {
		const reply = replies.find((r) => r.id === replyId);
		if (!reply) return;
		const prev = reply.media ?? [];
		if (
			prev.length === items.length &&
			prev.every((m, i) => m.id === items[i]?.id && m.path === items[i]?.path)
		) {
			return;
		}
		updateReply(replyId, { media: items.length > 0 ? items : [] });
	}

	$effect(() => {
		if (commentsMode !== true) return;
		if (replies.every((r) => Array.isArray(r.media))) return;
		onChangeReplies(replies.map((r) => ({ ...r, media: r.media ?? [] })));
	});
</script>

{#if postComment === 'POST' || postComment === 'COMMENT' || postComment === 'ALL'}
	<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
		<div class="flex items-center justify-between gap-3">
			<div class="text-sm font-medium text-base-content/80">
				Follow-up comments</div>
			<div class="flex items-center gap-2">
				<AddPostButton onclick={onAddReply} {postComment} disabled={disabled} />
				{#if onOpenPlugSettings}
					<button
						type="button"
						class="border-base-300 bg-base-100 text-base-content rounded-md border px-3 py-2 text-sm hover:bg-base-200 disabled:opacity-60"
						disabled={disabled}
						onclick={onOpenPlugSettings}
					>
						Plug settings
					</button>
				{/if}
			</div>
		</div>

		{#if id === 'threads' && !hideProviderHelp}
			<p class="mt-2 rounded-md border border-base-300/80 bg-base-200/25 px-3 py-2 text-sm leading-snug text-base-content/75">
				<span class="font-medium text-base-content/90">
					Threads timing:
				</span>
				Each reply runs after your chosen delay; Meta may take a few seconds before the reply appears on the network.
				The “≈” line uses your scheduled main post time plus your delays only.
			</p>
		{:else if id === 'x' && !hideProviderHelp}
			<p class="mt-2 rounded-md border border-base-300/80 bg-base-200/25 px-3 py-2 text-sm leading-snug text-base-content/75">
				<span class="font-medium text-base-content/90">X timing:</span>
				Each reply publishes as a quote-less reply after your chosen delay once the root post goes live.
			</p>
		{:else if id.startsWith('instagram') && !hideProviderHelp}
			<p class="text-base-content/75 mt-2 rounded-md border border-base-300/80 bg-base-200/25 px-3 py-2 text-sm leading-snug">
				<span class="text-base-content/90 font-medium">
					Instagram:
				</span>
				Each item is published as a comment on your post (chained as replies when the network supports it).
			</p>
		{/if}

		{#if !supportsFollowUps}
			<p class="text-base-content/60 mt-2 text-sm">
				Follow-up comments are supported on Threads, X, Instagram, LinkedIn, and Facebook.
			</p>
		{:else if replies.length === 0}
			<p class="text-base-content/60 mt-2 text-sm">
				Add follow-up comments to publish after the main post.
			</p>
		{:else}
			<div class="{compactEditor ? 'mt-2 space-y-2' : 'mt-3 space-y-4'}">
				{#each replies as reply, replyIndex (reply.id)}
					<div class="rounded-lg border border-base-300 bg-base-200/20 {compactEditor ? 'p-2' : 'p-3'}">
					<div class="{compactEditor ? 'mb-2' : 'mb-3'} flex items-center justify-between gap-3">
							<div class="text-xs font-semibold text-base-content/70">
								Reply</div>
							<div class="flex items-center gap-2">
								<div class="flex flex-col gap-0.5">
									<button
										type="button"
										class="bg-base-100/90 text-base-content/80 hover:text-base-content flex h-5 w-5 items-center justify-center rounded-sm text-[10px] leading-none shadow-sm disabled:opacity-40"
										disabled={disabled || replyIndex === 0}
										onclick={() => moveReply(replyIndex, replyIndex - 1)}
										aria-label="Move reply earlier"
									>
										<AbstractIcon
											name={icons.ChevronUp.name}
											class="size-3.5"
											width="14"
											height="14"
										/>
									</button>
									<button
										type="button"
										class="bg-base-100/90 text-base-content/80 hover:text-base-content flex h-5 w-5 items-center justify-center rounded-sm text-[10px] leading-none shadow-sm disabled:opacity-40"
										disabled={disabled || replyIndex === replies.length - 1}
										onclick={() => moveReply(replyIndex, replyIndex + 1)}
										aria-label="Move reply later"
									>
										<AbstractIcon
											name={icons.ChevronDown.name}
											class="size-3.5"
											width="14"
											height="14"
										/>
									</button>
								</div>
								<button
									type="button"
									class="text-xs font-semibold text-error hover:underline disabled:opacity-60"
									disabled={disabled}
									onclick={() => removeReply(reply.id)}
								>
									Remove
								</button>
							</div>
						</div>

						<EditorPost
							charCount={(reply.message ?? '').length}
							softCharLimit={replySoftCharLimit}
							comments={editorCommentsMode()}
							compact={compactEditor}
							busy={disabled}
							bind:body={reply.message}
							postMediaItems={reply.media ?? []}
							onPostMediaItemsChange={(items) => syncReplyMedia(reply.id, items)}
							{uploadUid}
							{publishDateIso}
							{organizationId}
							maxMediaItems={replyMaxMediaItems}
							{guestMode}
							onOpenComposerMediaSettings={
								guestMode || !onOpenComposerMediaSettings
									? undefined
									: (mediaIndex) => onOpenComposerMediaSettings(reply.id, mediaIndex)
							}
						/>

						<div class="{compactEditor ? 'mt-2' : 'mt-3'}">
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
