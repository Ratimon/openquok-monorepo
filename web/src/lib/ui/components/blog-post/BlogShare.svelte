<script lang="ts">
	import type { PublicBlogMutationResultViewModel } from '$lib/area-public/PublicBlogBySlugPage.presenter.svelte';

	import { browser } from '$app/environment';

	import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { absoluteUrl, url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/ui/dropdown-menu/index';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		postId: string;
		title: string;
		slug: string;
		trackBlogShare: (postId: string) => Promise<PublicBlogMutationResultViewModel>;
		/** From page presenter `submittingShare` — parent derives from presenter. */
		submittingShare?: boolean;
		class?: string;
	};

	let {
		postId,
		title,
		slug,
		trackBlogShare,
		submittingShare = false,
		class: className = ''
	}: Props = $props();

	function postUrl(): string {
		if (!browser) return '';
		const path = url(`/${getRootPathPublicBlogPost(slug)}`);
		return absoluteUrl(path);
	}

	async function handleShare(platform: string) {
		const sharePageUrl = postUrl();
		const encodedTitle = encodeURIComponent(title);
		const encodedUrl = encodeURIComponent(sharePageUrl);

		let shareUrl = '';
		if (platform === 'twitter') {
			shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
		} else if (platform === 'facebook') {
			shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
		} else if (platform === 'linkedin') {
			shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
		} else if (platform === 'copy') {
			try {
				await navigator.clipboard.writeText(sharePageUrl);
			} catch {
				/* ignore */
			}
			await trackBlogShare(postId);
			return;
		}

		if (shareUrl) {
			window.open(shareUrl, '_blank', 'noopener,noreferrer');
		}

		await trackBlogShare(postId);
	}
</script>

<div data-testid="blog-share-button" class={cn('relative', className)} aria-labelledby="blog-share-heading">
	<div class="mt-2">
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						size="sm"
						disabled={submittingShare}
						type="button"
						class="flex items-center gap-2"
					>
						<AbstractIcon name={icons.Share2.name} width="16" height="16" />
						<h2 id="blog-share-heading" class="text-sm font-semibold text-base">
							Share
						</h2>
					</Button>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" side="bottom">
				<DropdownMenuItem onSelect={() => void handleShare('twitter')}>Share on X</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => void handleShare('facebook')}>Share on Facebook</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => void handleShare('linkedin')}>Share on LinkedIn</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => void handleShare('copy')}>Copy link</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
</div>
