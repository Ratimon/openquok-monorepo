<script lang="ts">
	import { browser } from '$app/environment';

	import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		siteTitle: string;
		siteSlug: string;
		shareText?: string | null;
		displayLikes: number;
		onLike: () => void | Promise<void>;
		likeDisabled?: boolean;
		class?: string;
	};

	let {
		siteTitle,
		siteSlug,
		shareText = null,
		displayLikes,
		onLike,
		likeDisabled = false,
		class: className = ''
	}: Props = $props();

	async function handleShare() {
		const canonicalPath = route(getRootPathPublicBuildBacklinksSite(siteSlug.trim()));
		const shareUrl = browser ? window.location.href : url(canonicalPath);
		if (browser && navigator.share) {
			try {
				await navigator.share({
					title: siteTitle,
					text: shareText?.trim() || siteTitle,
					url: shareUrl
				});
				return;
			} catch {
				// fall through to clipboard
			}
		}
		const ok = await copyToClipboard(shareUrl);
		if (ok) toast.success('Link copied to clipboard.');
		else toast.error('Could not copy link.');
	}
</script>

<div class={['flex flex-wrap gap-2', className]}>
	<Button variant="outline" size="sm" onclick={() => void onLike()} disabled={likeDisabled}>
		<AbstractIcon name={icons.Star.name} width="16" height="16" aria-hidden="true" />
		Like ({displayLikes})
	</Button>
	<Button variant="outline" size="sm" onclick={() => void handleShare()}>
		<AbstractIcon name={icons.Share2.name} width="16" height="16" aria-hidden="true" />
		Share
	</Button>
</div>
