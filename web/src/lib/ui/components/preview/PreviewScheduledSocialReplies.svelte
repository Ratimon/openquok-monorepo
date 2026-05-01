<script lang="ts">
	import type { PublicPreviewThreadReplyViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

	import ThreadsReplyEngagementMock from '$lib/ui/components/posts/providers/threads/ThreadsReplyEngagementMock.svelte';

	type Props = {
		replies: PublicPreviewThreadReplyViewModel[];
		threadFinisher: { enabled: boolean; message: string } | null;
		variant: 'threads' | 'instagram' | 'general';
		/**
		 * Threads-only: same account as the root post (avatar + name per reply).
		 * When omitted with variant `threads`, falls back to the simple list (no avatars).
		 */
		replyActor?: { displayName: string; picture: string | null } | null;
		/**
		 * Threads-only: draw a short vertical segment above the first reply to continue the thread line from the root post avatar.
		 */
		threadContinuesFromRoot?: boolean;
	};

	let { replies, threadFinisher, variant, replyActor = null, threadContinuesFromRoot = false }: Props =
		$props();

	function plain(text: string): string {
		return stripHtmlToPlainText(text ?? '');
	}

	function formatScheduledReplyDelayLabel(delaySeconds: number): string {
		const s = Math.max(0, Math.floor(delaySeconds));
		if (s === 0) return 'No delay before this reply';
		if (s < 60) return `After ${s}s`;
		const m = Math.floor(s / 60);
		if (m < 60) return `After ${m} min`;
		const h = Math.floor(m / 60);
		return `After ${h} h`;
	}

	const rootGapClass = $derived(
		replyActor && variant === 'threads'
			? 'pt-2'
			: variant === 'threads'
				? 'mt-4 pt-1'
				: 'mt-4 border-t border-base-300 pt-4'
	);
</script>

{#if replies.length > 0 || (threadFinisher?.enabled && (threadFinisher.message ?? '').trim())}
	<div class={rootGapClass}>
		{#if variant !== 'threads'}
			<div class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
				Scheduled replies
			</div>
		{:else}
			<span class="sr-only">
				Scheduled thread replies
			</span>
		{/if}

		{#if variant === 'threads' && replyActor}
			{@const actor = replyActor}
			<div class="relative">
				{#if threadContinuesFromRoot && (replies.length > 0 || (threadFinisher?.enabled && plain(threadFinisher.message).trim()))}
					<div
						class="pointer-events-none absolute left-5 top-0 z-0 h-3 w-px -translate-x-1/2 bg-base-300"
						aria-hidden="true"
					></div>
				{/if}
				<ul class="flex flex-col">
				{#each replies as r, i (r.id)}
					<li class="flex gap-3">
						<div class="relative flex w-10 shrink-0 flex-col items-center">
							{#if i < replies.length - 1 || (threadFinisher?.enabled && plain(threadFinisher.message).trim())}
								<div
									class="absolute left-1/2 top-10 bottom-0 z-0 w-px -translate-x-1/2 bg-base-300"
									aria-hidden="true"
								></div>
							{/if}
							<div class="relative z-[1] h-10 w-10 shrink-0">
								{#if actor.picture?.trim()}
									<IntegrationChannelPicture
										profilePictureUrl={actor.picture}
										fallbackIcon={icons.User1.name}
										alt={actor.displayName}
										class="h-10 w-10 rounded-full bg-base-200 object-cover ring-2 ring-base-100"
									/>
								{:else}
									<span
										class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 ring-2 ring-base-100"
									>
										<AbstractIcon
											name={icons.User1.name}
											class="size-5 text-base-content/60"
											width="20"
											height="20"
										/>
									</span>
								{/if}
								<span
									class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-base-100 ring-1 ring-base-300"
								>
									<AbstractIcon
										name={icons.Threads.name}
										class="size-3.5 text-base-content"
										width="14"
										height="14"
									/>
								</span>
							</div>
						</div>
						<div class="min-w-0 flex-1 pb-5">
							<div class="flex items-start justify-between gap-2">
								<span class="truncate text-[15px] font-bold leading-5 text-base-content">
									{actor.displayName}
								</span>
								<span class="inline-flex shrink-0 text-base-content/45" aria-hidden="true">
									<AbstractIcon name={icons.MoreHorizontal.name} class="size-5" width="20" height="20" />
								</span>
							</div>
							<div class="mt-0.5 text-[13px] leading-4 text-base-content/45">
								{formatScheduledReplyDelayLabel(r.delaySeconds)}
							</div>
							<p class="mt-1 whitespace-pre-wrap text-[15px] leading-6 text-base-content">
								{plain(r.message)}
							</p>
							<ThreadsReplyEngagementMock commentCount={0} />
						</div>
					</li>
				{/each}
				{#if threadFinisher?.enabled && plain(threadFinisher.message).trim()}
					<li class="flex gap-3">
						<div class="relative flex w-10 shrink-0 flex-col items-center">
							<div class="relative z-[1] h-10 w-10 shrink-0">
								{#if actor.picture?.trim()}
									<IntegrationChannelPicture
										profilePictureUrl={actor.picture}
										fallbackIcon={icons.User1.name}
										alt={actor.displayName}
										class="h-10 w-10 rounded-full bg-base-200 object-cover ring-2 ring-base-100"
									/>
								{:else}
									<span
										class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 ring-2 ring-base-100"
									>
										<AbstractIcon
											name={icons.User1.name}
											class="size-5 text-base-content/60"
											width="20"
											height="20"
										/>
									</span>
								{/if}
								<span
									class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-base-100 ring-1 ring-base-300"
								>
									<AbstractIcon
										name={icons.Threads.name}
										class="size-3.5 text-base-content"
										width="14"
										height="14"
									/>
								</span>
							</div>
						</div>
						<div class="min-w-0 flex-1 pb-0">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<div class="truncate text-[15px] font-bold leading-5 text-base-content">
										{actor.displayName}
									</div>
									<div class="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-base-content/50">
										Thread finisher
									</div>
								</div>
								<span class="inline-flex shrink-0 text-base-content/45" aria-hidden="true">
									<AbstractIcon name={icons.MoreHorizontal.name} class="size-5" width="20" height="20" />
								</span>
							</div>
							<p class="mt-1 whitespace-pre-wrap text-[15px] leading-6 text-base-content">
								{plain(threadFinisher.message)}
							</p>
							<ThreadsReplyEngagementMock commentCount={0} />
						</div>
					</li>
				{/if}
				</ul>
			</div>
		{:else if variant === 'threads'}
			<ul class="flex flex-col gap-0 border-l-2 border-base-300 pl-4">
				{#each replies as r (r.id)}
					<li class="relative pb-4 last:pb-0">
						<span
							class="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-base-content/30 ring-2 ring-base-100"
							aria-hidden="true"
						></span>
						<div class="text-[11px] text-base-content/50">
							{formatScheduledReplyDelayLabel(r.delaySeconds)}
						</div>
						<p class="mt-1 whitespace-pre-wrap text-[15px] leading-6 text-base-content">
							{plain(r.message)}
						</p>
					</li>
				{/each}
				{#if threadFinisher?.enabled && plain(threadFinisher.message).trim()}
					<li class="relative pb-0">
						<span
							class="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-base-content/30 ring-2 ring-base-100"
							aria-hidden="true"
						></span>
						<div class="text-[11px] font-medium text-base-content/60">
							Thread finisher
						</div>
						<p class="mt-1 whitespace-pre-wrap text-[15px] leading-6 text-base-content">
							{plain(threadFinisher.message)}
						</p>
					</li>
				{/if}
			</ul>
		{:else if variant === 'instagram'}
			<ul class="flex flex-col gap-3">
				{#each replies as r (r.id)}
					<li class="rounded-lg bg-base-200/40 px-3 py-2">
						<div class="text-[11px] text-base-content/50">
							{formatScheduledReplyDelayLabel(r.delaySeconds)}
						</div>
						<p class="mt-1 whitespace-pre-wrap text-sm leading-5 text-base-content">
							{plain(r.message)}
						</p>
					</li>
				{/each}
				{#if threadFinisher?.enabled && plain(threadFinisher.message).trim()}
					<li class="rounded-lg border border-dashed border-base-300 px-3 py-2">
						<div class="text-[11px] font-medium text-base-content/60">
							Finisher
						</div>
						<p class="mt-1 whitespace-pre-wrap text-sm leading-5 text-base-content">
							{plain(threadFinisher.message)}
						</p>
					</li>
				{/if}
			</ul>
		{:else}
			<ul class="flex flex-col gap-2">
				{#each replies as r (r.id)}
					<li class="rounded-md border border-base-300/80 bg-base-200/20 px-3 py-2">
						<div class="text-[11px] text-base-content/50">
							{formatScheduledReplyDelayLabel(r.delaySeconds)}
						</div>
						<p class="mt-1 whitespace-pre-wrap text-sm text-base-content/90">
							{plain(r.message)}
						</p>
					</li>
				{/each}
				{#if threadFinisher?.enabled && plain(threadFinisher.message).trim()}
					<li class="rounded-md border border-dashed border-base-300 px-3 py-2">
						<div class="text-[11px] font-medium text-base-content/60">
							Finisher
						</div>
						<p class="mt-1 whitespace-pre-wrap text-sm text-base-content/90">
							{plain(threadFinisher.message)}
						</p>
					</li>
				{/if}
			</ul>
		{/if}
	</div>
{/if}
