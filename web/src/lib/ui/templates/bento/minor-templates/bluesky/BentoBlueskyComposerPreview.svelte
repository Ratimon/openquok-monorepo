<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ComposerGuestLockFooter from '$lib/ui/components/posts/ComposerGuestLockFooter.svelte';
	import ComposerGuestLockToolbar from '$lib/ui/components/posts/ComposerGuestLockToolbar.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';
	import ThreadRepliesEditor from '$lib/ui/components/posts/thread/ThreadRepliesEditor.svelte';
	import {
		BLUESKY_LANDING_MOCK_BODY,
		BLUESKY_LANDING_MOCK_CHANNEL,
		BLUESKY_LANDING_MOCK_CHANNELS,
		BLUESKY_LANDING_MOCK_MEDIA_URLS,
		BLUESKY_LANDING_MOCK_SCHEDULED_LOCAL,
		BLUESKY_LANDING_MOCK_THREAD_REPLIES
	} from '$lib/ui/templates/bento/minor-templates/bluesky/blueskyLandingMock';

	type Variant = 'media' | 'threads';

	type Props = {
		isLoggedIn?: boolean;
		variant?: Variant;
	};

	let { isLoggedIn, variant = 'media' }: Props = $props();

	const mockChannels = BLUESKY_LANDING_MOCK_CHANNELS;
	const selectedIds = [BLUESKY_LANDING_MOCK_CHANNEL.id];
	let scheduledLocal = $state(BLUESKY_LANDING_MOCK_SCHEDULED_LOCAL);
	let threadReplies = $state([...BLUESKY_LANDING_MOCK_THREAD_REPLIES]);

	const previewMetaLabel = $derived.by(() => {
		const ms = Date.parse(scheduledLocal);
		if (!Number.isFinite(ms)) return null;
		return new Date(ms).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	});

	const previewMediaUrls = $derived(variant === 'media' ? BLUESKY_LANDING_MOCK_MEDIA_URLS : []);
	const previewThreadReplies = $derived(variant === 'threads' ? threadReplies : []);

	function noop() {}
</script>

<div class="pointer-events-none select-none bg-base-100 text-base-content">
	<div class="flex items-start justify-between border-b border-base-300 px-4 py-3">
		<div class="text-lg font-semibold">Create Post</div>
		<div class="rounded-md p-2 text-base-content/70">
			<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
		</div>
	</div>

	<div class="grid grid-cols-1 divide-y divide-base-300 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
		<div class="flex flex-col gap-4 p-4">
			<PicksSocialsComponent
				channels={mockChannels}
				{selectedIds}
				onToggleChannel={noop}
				guestMode={true}
				{isLoggedIn}
			/>

			<div class="text-base-content/70 flex flex-wrap items-center justify-between gap-2 text-xs">
				<span class="inline-flex items-center gap-2 font-medium">
					<span class="bg-primary/70 inline-block h-2 w-2 rounded-full"></span>
					Editing a Specific Network
				</span>
			</div>

			{#if variant === 'threads'}
				<ComposerGuestLockToolbar {isLoggedIn} />

				<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
					<label
						class="mb-2 block text-xs font-medium text-base-content/60"
						for="landing-bluesky-mock-body"
					>
						Post body
					</label>
					<textarea
						id="landing-bluesky-mock-body"
						readonly
						rows="3"
						class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
						value={BLUESKY_LANDING_MOCK_BODY}
					></textarea>
					<p class="mt-2 text-xs text-base-content/50">{BLUESKY_LANDING_MOCK_BODY.length} / 300</p>
				</div>

				<ThreadRepliesEditor
					providerIdentifier="bluesky"
					postComment="POST"
					replySoftCharLimit={300}
					scheduledPostDatetimeLocal={scheduledLocal}
					disabled={true}
					hideProviderHelp={true}
					compactEditor={true}
					replies={threadReplies}
					onAddReply={noop}
					onChangeReplies={(next) => {
						threadReplies = next;
					}}
				/>
			{:else}
				<ComposerGuestLockToolbar {isLoggedIn} />

				<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
					<label
						class="mb-2 block text-xs font-medium text-base-content/60"
						for="landing-bluesky-media-body"
					>
						Post body
					</label>
					<textarea
						id="landing-bluesky-media-body"
						readonly
						rows="3"
						class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
						value={BLUESKY_LANDING_MOCK_BODY}
					></textarea>
					<p class="mt-2 text-xs text-base-content/50">
						Image attached · {BLUESKY_LANDING_MOCK_BODY.length} / 300
					</p>
				</div>
			{/if}
		</div>

		<div class="bg-base-200/20">
			<div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
				<div class="text-base font-medium text-base-content/90">Post Preview</div>
			</div>
			<div class="p-4">
				<ShowAllProviders
					channel={BLUESKY_LANDING_MOCK_CHANNEL}
					previewText={BLUESKY_LANDING_MOCK_BODY}
					maximumCharacters={300}
					mediaUrls={previewMediaUrls}
					threadReplies={previewThreadReplies}
					previewMetaLabel={previewMetaLabel}
				/>
			</div>
		</div>
	</div>

	{#if variant === 'threads'}
		<ComposerGuestLockFooter bind:scheduledLocal {isLoggedIn} />
	{/if}
</div>
