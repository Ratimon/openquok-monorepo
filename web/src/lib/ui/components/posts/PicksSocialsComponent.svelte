<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ComposerGuestLockBadge from '$lib/ui/components/posts/ComposerGuestLockBadge.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';
	import SignInToComposerActionModal from '$lib/ui/components/posts/SignInToComposerActionModal.svelte';

	type Props = {
		channels: CreateSocialPostChannelViewModel[];
		selectedIds: string[];
		onToggleChannel: (id: string) => void;
		guestMode?: boolean;
		isLoggedIn?: boolean;
		onConnectAccounts?: () => void;
	};

	let {
		channels,
		selectedIds,
		onToggleChannel,
		guestMode = false,
		isLoggedIn: isLoggedInProp,
		onConnectAccounts
	}: Props = $props();

	const heading = $derived(guestMode ? 'Sample channels' : 'Connected channels');
	const isLoggedIn = $derived(
		isLoggedInProp ?? Boolean((page.data as { isLoggedIn?: boolean } | undefined)?.isLoggedIn)
	);
	let connectLockOpen = $state(false);

	function handleConnectAccounts() {
		if (onConnectAccounts) {
			onConnectAccounts();
			return;
		}
		connectLockOpen = true;
	}
</script>

<div class="min-w-0 w-full">
	<p class="text-xs font-medium text-base-content/60 {guestMode ? 'mb-1' : 'mb-2'}">
		{heading}
	</p>
	{#if guestMode}
		<p class="mb-2 text-xs text-base-content/50">
			These chips set format and character limits. They are not your accounts.
		</p>
	{/if}
	<div class="flex flex-wrap items-center gap-2">
		{#each channels as ch (ch.id)}
			{@const schedulable = ch.schedulable}
			{@const selected = selectedIds.includes(ch.id)}
			<button
				type="button"
				class="ring-primary/60 relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:outline-none {schedulable || selected
					? ''
					: 'cursor-not-allowed opacity-60'} {selectedIds.includes(
					ch.id
				)
					? 'ring-2'
					: 'ring-0'}"
				onclick={() => onToggleChannel(ch.id)}
				aria-pressed={selectedIds.includes(ch.id)}
				aria-disabled={!schedulable && !selected}
				aria-label="Toggle channel {ch.name}"
				title={schedulable ? ch.name : `${ch.name}: ${ch.unschedulableReason ?? 'Reconnect required'}`}
			>
				<span
					class="relative block h-12 w-12 overflow-hidden rounded-full bg-base-200 transition {selectedIds.includes(
						ch.id
					)
						? 'grayscale-0'
						: 'grayscale opacity-70'}"
				>
					{#if ch.picture?.trim()}
						<IntegrationChannelPicture
							profilePictureUrl={ch.picture}
							fallbackIcon={socialProviderIcon(ch.identifier)}
							alt=""
							class="h-full w-full object-cover"
						/>
					{:else}
						<span class="flex h-full w-full items-center justify-center text-xs text-base-content/50">
							{ch.name.slice(0, 2)}
						</span>
					{/if}
					<span
						class="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-base-100/90 ring-1 ring-base-300"
					>
						<AbstractIcon name={socialProviderIcon(ch.identifier)} class="size-3.5" width="14" height="14" />
					</span>
				</span>
			</button>
		{/each}
		{#if guestMode}
			<button
				type="button"
				class="ring-primary/60 pointer-events-auto relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:outline-none"
				onclick={handleConnectAccounts}
				aria-label="Connect your accounts"
			>
				<span
					class="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-dashed border-base-300 bg-base-200 text-base-content/70"
				>
					<AbstractIcon name={icons.Plus.name} class="size-5" width="20" height="20" />
				</span>
				<ComposerGuestLockBadge />
			</button>
		{/if}
	</div>
	{#if guestMode && !onConnectAccounts}
		<div class="pointer-events-auto">
			<SignInToComposerActionModal
				bind:open={connectLockOpen}
				action="connect-channels"
				{isLoggedIn}
			/>
		</div>
	{/if}
</div>
