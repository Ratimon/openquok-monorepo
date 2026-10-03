<script lang="ts">
	import { icons } from '$data/icons';

	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import SignInToBookmarkModal from '$lib/ui/components/listings/SignInToBookmarkModal.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';

	const rootPathSignIn = getRootPathSignin();
	const signInHrefDefault = url(route(rootPathSignIn));

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type ListingKind = 'extension' | 'stack';

	type Props = {
		listingId: string;
		listingKind?: ListingKind;
		isBookmarked?: boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		signInHref?: string;
		disabled?: boolean;
		size?: 'sm' | 'md';
		class?: string;
		onToggle: (listingId: string, nextBookmarked: boolean) => Promise<ToggleResult>;
	};

	let {
		listingId,
		listingKind = 'extension',
		isBookmarked = false,
		isLoggedIn = false,
		bookmarksPaidEnabled = null,
		upgradeHref,
		signInHref = signInHrefDefault,
		disabled = false,
		size = 'sm',
		class: className = '',
		onToggle
	}: Props = $props();

	let bookmarked = $state(false);
	let busy = $state(false);
	let showSignInDialog = $state(false);
	let showUpgradeDialog = $state(false);

	$effect(() => {
		bookmarked = isBookmarked;
	});

	const label = $derived(
		bookmarked
			? 'Remove bookmark'
			: listingKind === 'stack'
				? 'Bookmark playbook'
				: 'Bookmark building block'
	);
	const buttonSize = $derived(size === 'sm' ? 'sm' : 'default');

	async function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		if (!isLoggedIn) {
			showSignInDialog = true;
			return;
		}

		if (bookmarksPaidEnabled === false) {
			showUpgradeDialog = true;
			return;
		}

		if (bookmarksPaidEnabled !== true || busy || disabled) return;

		const nextBookmarked = !bookmarked;
		const previousBookmarked = bookmarked;
		bookmarked = nextBookmarked;
		busy = true;
		try {
			const result = await onToggle(listingId, nextBookmarked);
			if (result.ok) {
				bookmarked = result.bookmarked;
			} else {
				bookmarked = previousBookmarked;
			}
		} catch {
			bookmarked = previousBookmarked;
		} finally {
			busy = false;
		}
	}
</script>

<Button
	type="button"
	variant={bookmarked ? 'primary' : 'outline'}
	size={buttonSize}
	class={cn(
		bookmarked
			? 'border-primary shadow-sm shadow-primary/20'
			: 'border-base-300/80 bg-base-100/80 text-base-content/70 hover:border-primary/40 hover:text-primary',
		className
	)}
	aria-pressed={bookmarked}
	aria-label={label}
	title={label}
	disabled={disabled || busy}
	onclick={handleClick}
>
	{#if bookmarked}
		<AbstractIcon
			name={icons.Star.name}
			class="size-4 fill-primary-content text-primary-content"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	{:else}
		<AbstractIcon
			name={icons.Bookmark.name}
			class="size-4"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	{/if}
	<span class="sr-only">{label}</span>
</Button>

<SignInToBookmarkModal
	bind:open={showSignInDialog}
	{signInHref}
/>

<CommunityFeaturesLimitUpgradeModal
	bind:open={showUpgradeDialog}
	{upgradeHref}
	feature="bookmarks"
/>
