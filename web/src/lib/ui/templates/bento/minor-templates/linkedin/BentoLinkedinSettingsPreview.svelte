<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ComposerGuestLockFooter from '$lib/ui/components/posts/ComposerGuestLockFooter.svelte';
	import ComposerGuestLockToolbar from '$lib/ui/components/posts/ComposerGuestLockToolbar.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import SettingsAccordion from '$lib/ui/components/posts/SettingsAccordion.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';
	import ThreadRepliesEditor from '$lib/ui/components/posts/thread/ThreadRepliesEditor.svelte';
	import { buildCrossAccountPlugPreviewItems } from '$lib/ui/components/preview/crossAccountPlugPreview';
	import {
		LINKEDIN_LANDING_MOCK_BODY,
		LINKEDIN_LANDING_MOCK_CAROUSEL_BODY,
		LINKEDIN_LANDING_MOCK_CHANNEL,
		LINKEDIN_LANDING_MOCK_CHANNELS,
		LINKEDIN_LANDING_MOCK_CROSS_ACCOUNT_PLUG_DEFS,
		LINKEDIN_LANDING_MOCK_PROVIDER_SETTINGS,
		LINKEDIN_LANDING_MOCK_SCHEDULED_LOCAL,
		LINKEDIN_LANDING_MOCK_THREAD_REPLIES
	} from '$lib/ui/templates/bento/minor-templates/linkedin/linkedinLandingMock';

	type Variant = 'compose' | 'settings';

	type Props = {
		isLoggedIn?: boolean;
		variant?: Variant;
		crossAccountPlugsPreview?: boolean;
	};

	let { isLoggedIn, variant = 'compose', crossAccountPlugsPreview = false }: Props = $props();

	const mockChannels = LINKEDIN_LANDING_MOCK_CHANNELS;
	const selectedIds = [LINKEDIN_LANDING_MOCK_CHANNEL.id];
	let settingsOpen = $state(true);
	let scheduledLocal = $state(LINKEDIN_LANDING_MOCK_SCHEDULED_LOCAL);
	let threadReplies = $state([...LINKEDIN_LANDING_MOCK_THREAD_REPLIES]);
	const providerSettings = LINKEDIN_LANDING_MOCK_PROVIDER_SETTINGS;

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

	const previewThreadReplies = $derived(crossAccountPlugsPreview ? [] : threadReplies);
	const crossAccountPreviewItems = $derived(
		crossAccountPlugsPreview
			? buildCrossAccountPlugPreviewItems(
					mockChannels,
					providerSettings.linkedin.crossAccountPlugs,
					LINKEDIN_LANDING_MOCK_CROSS_ACCOUNT_PLUG_DEFS
				)
			: []
	);

	function noop() {}
</script>

<div class="pointer-events-none select-none bg-base-100 text-base-content">
	<div
		class="flex items-start justify-between border-b border-base-300 px-4 {crossAccountPlugsPreview
			? 'py-2'
			: 'py-3'}"
	>
		<div class="{crossAccountPlugsPreview ? 'text-base' : 'text-lg'} font-semibold">Create Post</div>
		<div class="rounded-md p-2 text-base-content/70">
			<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
		</div>
	</div>

	<div class="grid grid-cols-1 divide-y divide-base-300 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
		<div class="flex flex-col {crossAccountPlugsPreview ? 'gap-2 p-3' : 'gap-4 p-4'}">
			<PicksSocialsComponent
				channels={mockChannels}
				{selectedIds}
				onToggleChannel={noop}
				guestMode={true}
				hideGuestHelper={crossAccountPlugsPreview}
				{isLoggedIn}
			/>

			{#if !crossAccountPlugsPreview}
				<div class="text-base-content/70 flex flex-wrap items-center justify-between gap-2 text-xs">
					<span class="inline-flex items-center gap-2 font-medium">
						<span class="bg-primary/70 inline-block h-2 w-2 rounded-full"></span>
						Editing a Specific Network
					</span>
				</div>
			{/if}

			{#if variant === 'compose'}
				<ComposerGuestLockToolbar {isLoggedIn} showLinkedInCompany={true} />

				<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
					<label class="mb-2 block text-xs font-medium text-base-content/60" for="landing-mock-linkedin-body">
						Post body
					</label>
					<textarea
						id="landing-mock-linkedin-body"
						readonly
						rows="4"
						class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
						value={LINKEDIN_LANDING_MOCK_CAROUSEL_BODY}
					></textarea>
					<p class="mt-2 text-xs text-base-content/50">
						{LINKEDIN_LANDING_MOCK_CAROUSEL_BODY.length} / 3,000
					</p>
				</div>

				<ThreadRepliesEditor
					providerIdentifier={LINKEDIN_LANDING_MOCK_CHANNEL.identifier}
					postComment="COMMENT"
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
				<SettingsAccordion
					bind:open={settingsOpen}
					channel={LINKEDIN_LANDING_MOCK_CHANNEL}
					allChannels={mockChannels}
					value={providerSettings}
					onChange={noop}
					disabled={true}
					compactEditors={true}
					panelScope={crossAccountPlugsPreview ? 'crossAccountPlugsOnly' : 'full'}
					crossAccountPlugDefinitionsOverride={LINKEDIN_LANDING_MOCK_CROSS_ACCOUNT_PLUG_DEFS}
					embedded
				/>
			{/if}
		</div>

		<div class="bg-base-200/20">
			<div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
				<div class="text-base font-medium text-base-content/90">Post Preview</div>
			</div>
			<div class="{crossAccountPlugsPreview ? 'p-3' : 'p-4'}">
				<ShowAllProviders
					channel={LINKEDIN_LANDING_MOCK_CHANNEL}
					previewText={LINKEDIN_LANDING_MOCK_BODY}
					maximumCharacters={3000}
					threadReplies={previewThreadReplies}
					{previewMetaLabel}
					providerSettings={providerSettings}
					crossAccountPlugs={crossAccountPreviewItems}
				/>
			</div>
		</div>
	</div>

	{#if variant === 'compose'}
		<ComposerGuestLockFooter bind:scheduledLocal {isLoggedIn} />
	{/if}
</div>
