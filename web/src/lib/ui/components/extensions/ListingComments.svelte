<script lang="ts">
	import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { icons } from '$data/icons';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Avatar from '$lib/ui/components/avatar';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';
	import { Textarea } from '$lib/ui/textarea';
	import { cn, formatPassedTime } from '$lib/ui/helpers/common';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';

	const rootPathSignIn = getRootPathSignin();
	const signInPath = route(rootPathSignIn);
	const signInHrefDefault = url(signInPath);

	type MutationResult = { ok: true } | { ok: false; error: string };

	type Props = {
		comments: ListingCommentViewModel[];
		listingId: string;
		isLoggedIn?: boolean;
		signInHref?: string;
		composerAvatarUrl?: string | null;
		submitListingComment: (params: {
			listingId: string;
			content: string;
			parentId: string | null;
		}) => Promise<MutationResult>;
		submittingComment?: boolean;
		communityCommentsEnabled?: boolean;
		onUpgradeRequired?: () => void;
		class?: string;
	};

	let {
		comments,
		listingId,
		isLoggedIn = false,
		signInHref = signInHrefDefault,
		composerAvatarUrl = null,
		submitListingComment,
		submittingComment = false,
		communityCommentsEnabled = true,
		onUpgradeRequired,
		class: className = ''
	}: Props = $props();

	let replyingTo = $state<ListingCommentViewModel | null>(null);
	let disabledSubmit = $state(false);
	let commentContent = $state('');
	let showSignInDialog = $state(false);
	const maxLength = 1000;

	const canPostComments = $derived(isLoggedIn && communityCommentsEnabled);

	function repliesFor(parentId: string): ListingCommentViewModel[] {
		return comments.filter((c) => c.parentId === parentId);
	}

	async function handleComment() {
		const trimmed = commentContent.trim();
		if (!trimmed.length) return;

		if (!isLoggedIn) {
			showSignInDialog = true;
			return;
		}

		if (!canPostComments) {
			onUpgradeRequired?.();
			return;
		}

		const result = await submitListingComment({
			listingId,
			content: trimmed,
			parentId: replyingTo?.id ?? null
		});
		if (result.ok) {
			disabledSubmit = true;
			commentContent = '';
			replyingTo = null;
		}
	}
</script>

{#snippet commentBlock(c: ListingCommentViewModel, isReply: boolean)}
	<div class={cn(isReply && 'w-full py-2 pl-14')}>
		<div class="flex items-start gap-4">
			<Avatar.Root class="size-10 shrink-0 border border-base-300">
				{#if c.author?.avatarUrl}
					<SupabaseUserAvatar
						url={c.author.avatarUrl}
						size={40}
						alt={c.author.fullName ?? 'Author'}
						imageOnly
					/>
					<Avatar.Fallback class="bg-base-200">
						<span class="text-sm font-medium text-base-content/70">
							{c.author?.fullName?.[0] ?? 'A'}
						</span>
					</Avatar.Fallback>
				{:else}
					<Avatar.Fallback class="bg-base-200">
						<span class="text-sm font-medium text-base-content/70">
							{c.author?.fullName?.[0] ?? 'A'}
						</span>
					</Avatar.Fallback>
				{/if}
			</Avatar.Root>
			<div class="min-w-0 flex-1 space-y-2">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<span class="font-medium text-base-content">{c.author?.fullName ?? 'Anonymous'}</span>
					<time class="text-sm text-base-content/60">{formatPassedTime(c.createdAt)}</time>
				</div>
				<p class="whitespace-pre-wrap text-base-content/80">{c.content}</p>
				{#if !isReply}
					<Button variant="primary" size="sm" onclick={() => (replyingTo = c)}>
						Reply
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<div class={cn('mx-auto w-full space-y-6', className)} aria-labelledby="listing-comments-heading">
	<div class="space-y-4">
		<h2 id="listing-comments-heading" class="text-2xl font-bold">Comments</h2>
		{#if comments.length === 0}
			<p class="text-base-content/70">No comments yet.</p>
		{/if}
		{#each comments as comment (comment.id)}
			{#if !comment.parentId}
				<div class="space-y-4">
					{@render commentBlock(comment, false)}
					{#each repliesFor(comment.id) as reply (reply.id)}
						{@render commentBlock(reply, true)}
					{/each}
				</div>
			{/if}
		{/each}
	</div>

	<div class="space-y-2">
		<h3 class="text-xl font-bold">Add a comment</h3>
		{#if isLoggedIn && !communityCommentsEnabled}
			<p class="text-sm text-base-content/65">
				Posting comments on extensions requires community features on your plan.
			</p>
		{/if}
		{#if replyingTo}
			<div class="pl-14 text-sm text-base-content/70">
				Replying to {replyingTo.author?.fullName ?? 'Anonymous'}
			</div>
		{/if}

		<div class="flex items-start gap-4">
			<Avatar.Root class="size-10 shrink-0 border border-base-300">
				{#if isLoggedIn && composerAvatarUrl}
					<SupabaseUserAvatar url={composerAvatarUrl} size={40} alt="Your avatar" imageOnly />
				{:else}
					<Avatar.Image src="/placeholder.png" alt="" class="object-cover" />
				{/if}
				<Avatar.Fallback>
					<AbstractIcon
						name={icons.User1.name}
						width="16"
						height="16"
						class="text-base-content/50"
						focusable="false"
					/>
				</Avatar.Fallback>
			</Avatar.Root>

			<div class="min-w-0 flex-1">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						void handleComment();
					}}
				>
					<Textarea
						placeholder="Write a comment…"
						class="min-h-[100px] resize-none"
						bind:value={commentContent}
						maxlength={maxLength}
						disabled={submittingComment}
					/>
					<div class="mt-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
						{#if !isLoggedIn}
							<p class="mr-auto text-xs italic text-base-content/60">
								<a href={signInHref} class="link link-primary">Sign in</a> to comment.
							</p>
						{/if}
						<span class="text-xs italic text-base-content/50">
							{commentContent.length}/{maxLength}
						</span>
						{#if replyingTo}
							<Button type="button" variant="ghost" onclick={() => (replyingTo = null)}>
								Cancel
							</Button>
						{/if}
						<Button
							type="submit"
							variant="primary"
							class="ml-2"
							disabled={disabledSubmit || submittingComment || !commentContent.trim()}
						>
							Submit
						</Button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={showSignInDialog}>
	<Dialog.Content class="max-w-md" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>Sign in to comment</Dialog.Title>
			<Dialog.Description>Sign in to add comments on this listing.</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close>
				<Button type="button" variant="ghost">Not now</Button>
			</Dialog.Close>
			<Button href={signInHref} variant="primary" checkCurrent={false}>Sign in</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
