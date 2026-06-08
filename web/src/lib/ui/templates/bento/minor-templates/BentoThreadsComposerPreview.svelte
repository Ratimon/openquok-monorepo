<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DatePicker from '$lib/ui/components/posts/DatePicker.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import SettingsAccordion from '$lib/ui/components/posts/SettingsAccordion.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';
	import ThreadRepliesEditor from '$lib/ui/components/posts/thread/ThreadRepliesEditor.svelte';
	import {
		THREADS_LANDING_MOCK_BODY,
		THREADS_LANDING_MOCK_CHANNEL,
		THREADS_LANDING_MOCK_MEDIA_URLS,
		THREADS_LANDING_MOCK_PROVIDER_SETTINGS,
		THREADS_LANDING_MOCK_SCHEDULED_LOCAL,
		THREADS_LANDING_MOCK_THREAD_REPLIES
	} from './threadsLandingMock';

	const mockChannels = [THREADS_LANDING_MOCK_CHANNEL];
	const selectedIds = [THREADS_LANDING_MOCK_CHANNEL.id];
	let settingsOpen = $state(true);
	let scheduledLocal = $state(THREADS_LANDING_MOCK_SCHEDULED_LOCAL);
	let threadReplies = $state([...THREADS_LANDING_MOCK_THREAD_REPLIES]);
	const providerSettings = THREADS_LANDING_MOCK_PROVIDER_SETTINGS;

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

	const threadFinisher = $derived({
		enabled: providerSettings.threads.enabled,
		message: providerSettings.threads.message
	});

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
			/>

			<div class="text-base-content/70 flex flex-wrap items-center justify-between gap-2 text-xs">
				<span class="inline-flex items-center gap-2 font-medium">
					<span class="bg-primary/70 inline-block h-2 w-2 rounded-full"></span>
					Editing a Specific Network
				</span>
				<span class="inline-flex items-center gap-2 text-base-content/70">
					<AbstractIcon name={icons.ArrowBack.name} class="size-4" width="16" height="16" />
					Back to global
				</span>
			</div>

			<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
				<label class="mb-2 block text-xs font-medium text-base-content/60" for="landing-threads-mock-body">
					Post body
				</label>
				<textarea
					id="landing-threads-mock-body"
					readonly
					rows="3"
					class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
					value={THREADS_LANDING_MOCK_BODY}
				></textarea>
				<p class="mt-2 text-xs text-base-content/50">
					{THREADS_LANDING_MOCK_BODY.length} / 500
				</p>
			</div>

			<ThreadRepliesEditor
				providerIdentifier="threads"
				postComment="POST"
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

			<SettingsAccordion
				bind:open={settingsOpen}
				channel={THREADS_LANDING_MOCK_CHANNEL}
				value={providerSettings}
				onChange={noop}
				disabled={true}
				compactEditors={true}
				embedded
			/>
		</div>

		<div class="bg-base-200/20">
			<div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
				<div class="text-base font-medium text-base-content/90">Post Preview</div>
			</div>
			<div class="p-4">
				<ShowAllProviders
					channel={THREADS_LANDING_MOCK_CHANNEL}
					previewText={THREADS_LANDING_MOCK_BODY}
					maximumCharacters={500}
					mediaUrls={THREADS_LANDING_MOCK_MEDIA_URLS}
					threadReplies={threadReplies}
					{threadFinisher}
					{previewMetaLabel}
				/>
			</div>
		</div>
	</div>

	<div
		class="flex flex-col gap-3 border-t border-base-300 bg-base-100/95 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
	>
		<DatePicker bind:value={scheduledLocal} disabled />
		<Button type="button" variant="secondary" disabled>Save as draft</Button>
		<Button type="button" variant="primary" disabled>Schedule Post</Button>
	</div>
</div>
