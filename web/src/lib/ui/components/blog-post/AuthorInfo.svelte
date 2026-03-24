<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	import * as Avatar from '$lib/ui/components/avatar';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';

	export type BlogPostAuthorVm = {
		id?: string;
		fullName: string | null;
		username: string | null;
		avatarUrl: string | null;
		website: string | null;
		tagLine: string | null;
	};

	type Props = {
		author: BlogPostAuthorVm | null | undefined;
		class?: string;
	};

	let { author, class: className = '' }: Props = $props();

	let displayName = $derived(author?.fullName || author?.username || 'Anonymous');
</script>

{#if author}
	<div
		aria-labelledby="author-info-heading"
		data-testid="blog-post-author"
		class={cn('relative pb-8', className)}
	>
		<span id="author-info-heading" class="sr-only">Author</span>
		<div class="grid space-y-4">
			<Avatar.Root class="size-12 shrink-0 rounded-full">
				<SupabaseUserAvatar
					url={author.avatarUrl}
					size={48}
					alt={displayName}
					imageOnly
				/>
				<Avatar.Fallback>O.O</Avatar.Fallback>
			</Avatar.Root>

			<p class="font-semibold">
				{#if author.website?.trim()}
					<ExternalLink href={author.website.trim()} class="relative inline-block underline">
						<span class="absolute inset-0" aria-hidden="true"></span>
						{displayName}
					</ExternalLink>
				{:else}
					<span>{displayName}</span>
				{/if}
			</p>
			<p class="text-sm text-base-content/70">
				{author.tagLine ?? ''}
			</p>
		</div>
	</div>
{/if}
