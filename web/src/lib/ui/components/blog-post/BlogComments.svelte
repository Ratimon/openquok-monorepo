<script lang="ts">
	import type { BlogPostCommentProgrammerModel, BlogUpsertProgrammerModel } from '$lib/blogs/index';

	import { icons } from '$data/icon';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Avatar from '$lib/ui/components/avatar';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';
	import { Textarea } from '$lib/ui/textarea';
	import { cn, formatPassedTime } from '$lib/ui/helpers/common';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { url } from '$lib/utils/path';

	type Props = {
		comments: BlogPostCommentProgrammerModel[];
		postId: string;
		isLoggedIn?: boolean;
		signInHref?: string;
		/** Optional signed-in user avatar storage path or absolute URL (when available). */
		composerAvatarUrl?: string | null;
		submitBlogComment: (params: {
			postId: string;
			content: string;
			parentId: string | null;
		}) => Promise<BlogUpsertProgrammerModel>;
		/** From page presenter `submittingComment` — parent derives from presenter. */
		submittingComment?: boolean;
		class?: string;
	};

	let {
		comments,
		postId,
		isLoggedIn = false,
		signInHref = url(`/${getRootPathSignin()}`),
		composerAvatarUrl = null,
		submitBlogComment,
		submittingComment = false,
		class: className = ''
	}: Props = $props();

	let replyingTo = $state<BlogPostCommentProgrammerModel | null>(null);
	let disabledSubmit = $state(false);
	let commentContent = $state('');
	const maxLength = 1000;

	function repliesFor(parentId: string): BlogPostCommentProgrammerModel[] {
		return comments.filter((c) => c.parentId === parentId);
	}

	async function handleComment() {
		const result = await submitBlogComment({
			postId,
			content: commentContent.trim(),
			parentId: replyingTo?.id ?? null
		});
		if (result.success) {
			disabledSubmit = true;
			commentContent = '';
			replyingTo = null;
		}
	}

	function handleCancelReply() {
		replyingTo = null;
	}
</script>

{#snippet commentBlock(c: BlogPostCommentProgrammerModel, isReply: boolean)}
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
				<p class="text-base-content/80 whitespace-pre-wrap">
					{c.content}</p>
				{#if !isReply}
					<div class="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							class="text-base-content/60"
							onclick={() => (replyingTo = c)}
						>
							Reply
							<span class="sr-only">to this comment</span>
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<div
	data-testid="blog-comments-section"
	class={cn('mx-auto w-full space-y-6', className)}
	aria-labelledby="blog-comments-heading"
>
	<div class="space-y-4">
		<h2 id="blog-comments-heading" class="text-2xl font-bold">
			Comments</h2>
		<div class="space-y-4">
			{#if comments.length === 0}
				<p class="text-base-content/70">
					No comments yet.</p>
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
	</div>

	<div class="space-y-2">
		<h3 class="text-xl font-bold">
			Add a comment</h3>
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
				<Textarea
					placeholder="Write a comment…"
					class="min-h-[100px] resize-none"
					bind:value={commentContent}
					maxlength={maxLength}
				/>
				<div class="mt-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
					{#if !isLoggedIn}
						<p class="mr-auto text-xs italic text-base-content/60">
							<a href={signInHref} class="link link-primary">Sign in</a> to comment.
						</p>
					{/if}
					<span class="text-xs italic text-base-content/50">{commentContent.length}/{maxLength}</span>
					{#if replyingTo}
						<Button variant="secondary" onclick={handleCancelReply}>Cancel</Button>
					{/if}
					<Button
						variant="outline"
						class="ml-2"
						disabled={
							!isLoggedIn ||
							disabledSubmit ||
							submittingComment ||
							!commentContent.trim()
						}
						onclick={handleComment}
					>
						Submit
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
