<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DatePicker from '$lib/ui/components/posts/DatePicker.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import SelectTargets from '$lib/ui/components/posts/SelectTargets.svelte';
	import SettingsAccordion from '$lib/ui/components/posts/SettingsAccordion.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';
	import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers/index';
	import ThreadRepliesEditor from '$lib/ui/components/posts/thread/ThreadRepliesEditor.svelte';
	import {
		LANDING_COMPOSER_MOCK_CHANNELS,
		LANDING_COMPOSER_MOCK_CUSTOM_BODIES,
		LANDING_COMPOSER_MOCK_GLOBAL_BODY,
		LANDING_COMPOSER_MOCK_MEDIA_BY_CHANNEL,
		LANDING_COMPOSER_MOCK_PROVIDER_SETTINGS_BY_CHANNEL,
		LANDING_COMPOSER_MOCK_SCHEDULED_LOCAL,
		LANDING_COMPOSER_MOCK_SELECTED_IDS,
		LANDING_COMPOSER_MOCK_THREAD_REPLIES_BY_CHANNEL
	} from '$lib/ui/templates/bento/minor-templates/landing/landingComposerMultiAccountMock';

	type Mode = 'global' | 'custom';

	const mockChannels = LANDING_COMPOSER_MOCK_CHANNELS;
	const selectedIds = LANDING_COMPOSER_MOCK_SELECTED_IDS;

	let mode = $state<Mode>('global');
	let focusedIntegrationId = $state<string | null>(null);
	let settingsOpen = $state(true);
	let scheduledLocal = $state(LANDING_COMPOSER_MOCK_SCHEDULED_LOCAL);

	let providerSettingsByChannel = $state<Record<string, Record<string, unknown>>>(
		structuredClone(LANDING_COMPOSER_MOCK_PROVIDER_SETTINGS_BY_CHANNEL)
	);

	let threadRepliesByChannel = $state<
		Record<string, { id: string; message: string; delaySeconds: number }[]>
	>(structuredClone(LANDING_COMPOSER_MOCK_THREAD_REPLIES_BY_CHANNEL));

	const previewText = $derived(
		mode === 'global'
			? LANDING_COMPOSER_MOCK_GLOBAL_BODY
			: focusedIntegrationId
				? (LANDING_COMPOSER_MOCK_CUSTOM_BODIES[focusedIntegrationId] ??
					LANDING_COMPOSER_MOCK_GLOBAL_BODY)
				: LANDING_COMPOSER_MOCK_GLOBAL_BODY
	);

	const focusedChannel = $derived.by(() => {
		if (mode !== 'custom' || !focusedIntegrationId) return null;
		return mockChannels.find((ch) => ch.id === focusedIntegrationId) ?? null;
	});

	const previewChannel = $derived.by((): CreateSocialPostChannelViewModel | null => {
		if (mode === 'custom') return focusedChannel;
		return null;
	});

	const previewProviderSettings = $derived(
		focusedIntegrationId
			? (providerSettingsByChannel[focusedIntegrationId] ?? {})
			: {}
	);

	const previewMediaUrls = $derived(
		focusedIntegrationId ? (LANDING_COMPOSER_MOCK_MEDIA_BY_CHANNEL[focusedIntegrationId] ?? []) : []
	);

	const previewThreadReplies = $derived(
		focusedIntegrationId ? (threadRepliesByChannel[focusedIntegrationId] ?? []) : []
	);

	const previewMaxCharacters = $derived(
		getLaunchProviderConfig(focusedChannel?.identifier ?? null).maximumCharacters
	);

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

	const threadFinisher = $derived.by(() => {
		const threads = previewProviderSettings?.threads;
		if (!threads || typeof threads !== 'object') return null;
		const t = threads as Record<string, unknown>;
		const enabled = typeof t.enabled === 'boolean' ? t.enabled : false;
		if (!enabled) return null;
		const message = typeof t.message === 'string' ? t.message.trim() : '';
		return { enabled: true as const, message: message || "That's a wrap!" };
	});

	const showThreadRepliesEditor = $derived.by(() => {
		if (mode !== 'custom' || !focusedChannel) return false;
		const id = (focusedChannel.identifier ?? '').toLowerCase();
		return id === 'threads' || id.startsWith('instagram');
	});

	const threadPostComment = $derived.by(() => {
		if (!focusedChannel) return 'POST' as const;
		return getLaunchProviderConfig(focusedChannel.identifier).postComment;
	});

	function noop() {}

	function backToGlobal() {
		mode = 'global';
		focusedIntegrationId = null;
	}

	function handleToggleGlobal() {
		backToGlobal();
	}

	function handleRequestCustomize(id: string) {
		mode = 'custom';
		focusedIntegrationId = id;
	}

	function handleFocusIntegration(id: string) {
		mode = 'custom';
		focusedIntegrationId = id;
	}

	function handleProviderSettingsChange(next: Record<string, unknown>) {
		if (!focusedIntegrationId) return;
		providerSettingsByChannel = {
			...providerSettingsByChannel,
			[focusedIntegrationId]: next
		};
	}

	function handleThreadRepliesChange(
		next: { id: string; message: string; delaySeconds: number }[]
	) {
		if (!focusedIntegrationId) return;
		threadRepliesByChannel = {
			...threadRepliesByChannel,
			[focusedIntegrationId]: next
		};
	}
</script>

<div class="select-none bg-base-100 text-base-content">
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
			/>

			<SelectTargets
				{mode}
				{focusedIntegrationId}
				{selectedIds}
				channels={mockChannels}
				onToggleGlobal={handleToggleGlobal}
				onRemoveSelected={noop}
				onFocusIntegration={handleFocusIntegration}
				onRequestCustomize={handleRequestCustomize}
			/>

			{#if mode === 'custom'}
				<div class="text-base-content/70 flex flex-wrap items-center justify-between gap-2 text-xs">
					<span class="inline-flex items-center gap-2 font-medium">
						<span class="bg-primary/70 inline-block h-2 w-2 rounded-full"></span>
						Editing a Specific Network
					</span>
					<button
						type="button"
						class="inline-flex items-center gap-2 text-base-content/70 transition-colors hover:text-base-content"
						onclick={backToGlobal}
					>
						<AbstractIcon name={icons.ArrowBack.name} class="size-4" width="16" height="16" />
						Back to global
					</button>
				</div>
			{/if}

			<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
				<label class="mb-2 block text-xs font-medium text-base-content/60" for="landing-composer-mock-body">
					Post body
				</label>
				<textarea
					id="landing-composer-mock-body"
					readonly
					rows={mode === 'global' ? 4 : 3}
					class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
					value={previewText}
				></textarea>
				<p class="mt-2 text-xs text-base-content/50">
					{previewText.length} / {previewMaxCharacters.toLocaleString()}
				</p>
			</div>

			{#if showThreadRepliesEditor && focusedChannel}
				<ThreadRepliesEditor
					providerIdentifier={focusedChannel.identifier}
					postComment={threadPostComment}
					scheduledPostDatetimeLocal={scheduledLocal}
					disabled={true}
					hideProviderHelp={true}
					compactEditor={true}
					replies={previewThreadReplies}
					onAddReply={noop}
					onChangeReplies={handleThreadRepliesChange}
				/>
			{/if}

			{#if mode === 'custom' && focusedChannel}
				<SettingsAccordion
					bind:open={settingsOpen}
					channel={focusedChannel}
					value={previewProviderSettings}
					onChange={handleProviderSettingsChange}
					compactEditors={true}
					embedded
				/>
			{/if}
		</div>

		<div class="bg-base-200/20">
			<div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
				<div class="text-base font-medium text-base-content/90">Post Preview</div>
			</div>
			<div class="p-4">
				<ShowAllProviders
					channel={previewChannel}
					{previewText}
					maximumCharacters={previewMaxCharacters}
					mediaUrls={previewMediaUrls}
					threadReplies={previewThreadReplies}
					{threadFinisher}
					{previewMetaLabel}
				/>
			</div>
		</div>
	</div>

	<div
		class="pointer-events-none flex flex-col gap-3 border-t border-base-300 bg-base-100/95 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
	>
		<DatePicker bind:value={scheduledLocal} disabled />
		<Button type="button" variant="secondary" disabled>Save as draft</Button>
		<Button type="button" variant="primary" disabled>Schedule Post</Button>
	</div>
</div>
