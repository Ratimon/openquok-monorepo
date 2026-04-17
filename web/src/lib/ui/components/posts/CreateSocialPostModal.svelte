<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { PostTagProgrammerModel, RepeatIntervalKey } from '$lib/posts';
	import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';
	import type { SocialPostMediaItem } from '$lib/posts/composerMedia.types';

	import { icons } from '$data/icon';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { mediaItemsToPreviewUrls } from '$lib/posts/composerMedia.types';

	import { postsRepository } from '$lib/posts';
	import { datetimeLocalToIso, isoToDatetimeLocalValue } from '$lib/utils/postingSchedulePreferences';
	import { stripHtmlToPlainText } from '$lib/utils/stripHtml';
	import { toast } from '$lib/ui/sonner';

	import AddEditModal from './AddEditModal.svelte';
	import DeleteDialog from './DeleteDialog.svelte';
	import ManageModal from './ManageModal.svelte';
	import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';

	type Mode = 'global' | 'custom';

	type Props = {
		open?: boolean;
		workspaceId: string | null;
		connectedChannels: CreateSocialPostChannelViewModel[];
		/** For image upload form field; server uses JWT for storage path. */
		uploadUid?: string;
	};

	let { open = $bindable(false), workspaceId, connectedChannels, uploadUid = '' }: Props = $props();

	const repeatOptions: { value: RepeatIntervalKey; label: string }[] = [
		{ value: 'day', label: 'Day' },
		{ value: 'two_days', label: 'Two Days' },
		{ value: 'three_days', label: 'Three Days' },
		{ value: 'four_days', label: 'Four Days' },
		{ value: 'five_days', label: 'Five Days' },
		{ value: 'six_days', label: 'Six Days' },
		{ value: 'week', label: 'Week' },
		{ value: 'two_weeks', label: 'Two Weeks' },
		{ value: 'month', label: 'Month' }
	];

	let mode = $state<Mode>('global');
	let focusedIntegrationId = $state<string | null>(null);
	let editorLocked = $state(false);
	let customEditingUnlocked = $state(false);
	let settingsOpen = $state(false);
	let providerSettingsByIntegrationId = $state<Record<string, Record<string, unknown>>>({});

	let globalBody = $state('');
	let bodiesByIntegrationId = $state<Record<string, string>>({});
	let editorBody = $state('');

	let selectedIds = $state<string[]>([]);
	let selectedGroupId = $state<string | null>(null);
	let scheduledLocal = $state('');
	let repeatInterval = $state<RepeatIntervalKey | null>(null);
	let selectedTagNames = $state<string[]>([]);
	let tagList = $state<PostTagProgrammerModel[]>([]);
	let postMediaItems = $state<SocialPostMediaItem[]>([]);
	let busy = $state(false);
	let confirmCloseOpen = $state(false);
	let initialSnapshot = $state('');

	const baseSocialChannels = $derived(
		connectedChannels.filter((c) => (c.type ?? '').toLowerCase() === 'social' && !c.disabled)
	);

	const focusedProviderIdentifier = $derived.by(() => {
		if (mode !== 'custom' || !focusedIntegrationId) return null;
		return baseSocialChannels.find((c) => c.id === focusedIntegrationId)?.identifier ?? null;
	});

	const providerConfig = $derived(getLaunchProviderConfig(focusedProviderIdentifier));

	const softCharLimit = $derived(providerConfig.maximumCharacters);
	const minimumCharacters = $derived(providerConfig.minimumCharacters);

	const postComment = $derived(providerConfig.postComment as PostCommentMode);

	const previewText = $derived(stripHtmlToPlainText(editorBody));

	const charCount = $derived(previewText.length);

	const previewMediaUrls = $derived(mediaItemsToPreviewUrls(postMediaItems));

	const dirty = $derived.by(() => {
		if (initialSnapshot === '') return false;
		const snap = JSON.stringify({
			mode,
			focusedIntegrationId,
			selectedGroupId,
			globalBody,
			bodiesByIntegrationId,
			editorBody,
			postMediaItems,
			selectedIds,
			scheduledLocal,
			repeatInterval,
			selectedTagNames
		});
		return snap !== initialSnapshot;
	});

	function toggleChannel(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((x) => x !== id);
			if (mode === 'custom' && focusedIntegrationId === id) {
				focusedIntegrationId = selectedIds.length ? selectedIds[0] : null;
				editorLocked = true;
				loadEditorBody();
			}
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function removeSelected(id: string) {
		const nextSelected = selectedIds.filter((x) => x !== id);
		selectedIds = nextSelected;

		// Customer dropdown is a "targeting preset". If user removes all targets
		// belonging to that customer, clear the preset so the label updates.
		if (selectedGroupId) {
			const hasAnyFromCustomer = nextSelected.some(
				(sid) => baseSocialChannels.find((c) => c.id === sid)?.group?.id === selectedGroupId
			);
			if (!hasAnyFromCustomer) {
				selectedGroupId = null;
			}
		}
	}

	function toggleTag(name: string) {
		const t = name.trim();
		if (!t) return;
		if (selectedTagNames.includes(t)) {
			selectedTagNames = selectedTagNames.filter((x) => x !== t);
		} else {
			selectedTagNames = [...selectedTagNames, t];
		}
	}

	function persistEditorBody() {
		if (mode === 'custom' && focusedIntegrationId) {
			bodiesByIntegrationId = { ...bodiesByIntegrationId, [focusedIntegrationId]: editorBody };
			return;
		}
		globalBody = editorBody;
	}

	function loadEditorBody() {
		if (mode === 'custom' && focusedIntegrationId) {
			editorBody = bodiesByIntegrationId[focusedIntegrationId] ?? globalBody;
			return;
		}
		editorBody = globalBody;
	}

	function enterCustomMode(integrationId: string) {
		persistEditorBody();
		mode = 'custom';
		focusedIntegrationId = integrationId;
		editorLocked = !customEditingUnlocked;
		settingsOpen = false;
		loadEditorBody();
	}

	function backToGlobalMode() {
		persistEditorBody();
		mode = 'global';
		focusedIntegrationId = null;
		editorLocked = false;
		customEditingUnlocked = false;
		settingsOpen = false;
		loadEditorBody();
	}

	function requestCustomize(integrationId: string) {
		enterCustomMode(integrationId);
	}


	function focusIntegration(id: string) {
		if (mode !== 'custom') return;
		if (focusedIntegrationId === id) return;
		persistEditorBody();
		focusedIntegrationId = id;
		// In the original flow, once you've unlocked custom editing once,
		// switching focused channels does not re-lock the editor.
		settingsOpen = false;
		loadEditorBody();
	}

	function updateFocusedProviderSettings(next: Record<string, unknown>) {
		if (mode !== 'custom' || !focusedIntegrationId) return;
		providerSettingsByIntegrationId = {
			...providerSettingsByIntegrationId,
			[focusedIntegrationId]: next
		};
	}

	function selectGroup(groupId: string | null) {
		selectedGroupId = groupId;
		if (!groupId) return;
		const ids = baseSocialChannels.filter((c) => c.group?.id === groupId).map((c) => c.id);
		selectedIds = ids;
		if (ids.length) {
			toast.success('Group channels selected');
		}
	}

	async function loadInitial() {
		if (!workspaceId) return;
		busy = true;
		try {
			const slot = await postsRepository.findSlot(workspaceId);
			if (slot.ok) {
				scheduledLocal = isoToDatetimeLocalValue(slot.dateIso);
			} else {
				scheduledLocal = isoToDatetimeLocalValue(new Date().toISOString());
				toast.error(slot.error);
			}
			const tags = await postsRepository.listTags(workspaceId);
			if (tags.ok) {
				tagList = tags.tags;
			} else {
				toast.error(tags.error);
			}
			// Reset editor state
			mode = 'global';
			focusedIntegrationId = null;
			editorLocked = false;
			globalBody = '';
			bodiesByIntegrationId = {};
			editorBody = '';
			postMediaItems = [];

			initialSnapshot = JSON.stringify({
				mode,
				focusedIntegrationId,
				selectedGroupId,
				globalBody,
				bodiesByIntegrationId,
				editorBody,
				postMediaItems,
				selectedIds,
				scheduledLocal,
				repeatInterval,
				selectedTagNames
			});
		} finally {
			busy = false;
		}
	}

	function resetForm() {
		mode = 'global';
		focusedIntegrationId = null;
		editorLocked = false;

		globalBody = '';
		bodiesByIntegrationId = {};
		editorBody = '';
		postMediaItems = [];

		selectedIds = [];
		selectedGroupId = null;
		repeatInterval = null;
		selectedTagNames = [];
		initialSnapshot = '';
	}

	$effect(() => {
		if (open && workspaceId) {
			resetForm();
			void loadInitial();
		}
		if (!open) {
			confirmCloseOpen = false;
		}
	});

	function requestClose() {
		if (dirty) {
			confirmCloseOpen = true;
			return;
		}
		open = false;
	}

	function confirmClose() {
		confirmCloseOpen = false;
		open = false;
	}

	async function addNewTag(name?: string, color?: string) {
		if (!name) return;
		const c = (color ?? '').trim() || '#6366f1';
		const t = name.trim();
		if (!t || !workspaceId) return;
		busy = true;
		try {
			const r = await postsRepository.createTag(workspaceId, t, c);
			if (r.ok) {
				tagList = [...tagList.filter((x) => x.id !== r.tag.id), r.tag];
				if (!selectedTagNames.includes(r.tag.name)) {
					selectedTagNames = [...selectedTagNames, r.tag.name];
				}
				toast.success('Tag added.');
			} else {
				toast.error(r.error);
			}
		} finally {
			busy = false;
		}
	}

	async function deleteWorkspaceTag(tag: PostTagProgrammerModel) {
		if (!workspaceId) return;
		busy = true;
		try {
			const r = await postsRepository.deleteTag(workspaceId, tag.id);
			if (r.ok) {
				tagList = tagList.filter((x) => x.id !== tag.id);
				selectedTagNames = selectedTagNames.filter((n) => n !== tag.name);
				toast.success('Tag deleted.');
			} else {
				toast.error(r.error);
			}
		} finally {
			busy = false;
		}
	}

	async function saveAsDraft() {
		persistEditorBody();
		if (!workspaceId) {
			toast.error('Select a workspace.');
			return;
		}
		const plain = stripHtmlToPlainText(editorBody);
		const hasText = plain.length > 0;
		const hasMedia = postMediaItems.length > 0;
		if (!hasText && !hasMedia) {
			toast.error('Write something or attach at least one image.');
			return;
		}
		if (hasText && plain.length < minimumCharacters) {
			toast.error(`Please add at least ${minimumCharacters} characters.`);
			return;
		}
		if (plain.length > softCharLimit) {
			toast.error(`Too long for this mode (${plain.length}/${softCharLimit}).`);
			return;
		}
		busy = true;
		try {
			const overrides = mode === 'custom' ? bodiesByIntegrationId : undefined;
			const r = await postsRepository.createPost({
				organizationId: workspaceId,
				body: globalBody,
				...(overrides ? { bodiesByIntegrationId: overrides } : {}),
				...(postMediaItems.length ? { media: postMediaItems } : {}),
				integrationIds: selectedIds,
				isGlobal: mode === 'global',
				scheduledAt: datetimeLocalToIso(scheduledLocal),
				repeatInterval,
				tagNames: selectedTagNames,
				status: 'draft'
			});
			if (r.ok) {
				toast.success('Draft saved.');
				open = false;
			} else {
				toast.error(r.error);
			}
		} finally {
			busy = false;
		}
	}

	async function schedulePost() {
		persistEditorBody();
		if (!workspaceId) {
			toast.error('Select a workspace.');
			return;
		}
		if (selectedIds.length === 0) {
			toast.error('Select at least one channel above.');
			return;
		}
		const plain = stripHtmlToPlainText(editorBody);
		const hasText = plain.length > 0;
		const hasMedia = postMediaItems.length > 0;
		if (!hasText && !hasMedia) {
			toast.error('Write something or attach at least one image.');
			return;
		}
		if (hasText && plain.length < minimumCharacters) {
			toast.error(`Please add at least ${minimumCharacters} characters.`);
			return;
		}
		if (plain.length > softCharLimit) {
			toast.error(`Too long for this mode (${plain.length}/${softCharLimit}).`);
			return;
		}
		busy = true;
		try {
			const overrides = mode === 'custom' ? bodiesByIntegrationId : undefined;
			const r = await postsRepository.createPost({
				organizationId: workspaceId,
				body: globalBody,
				...(overrides ? { bodiesByIntegrationId: overrides } : {}),
				...(postMediaItems.length ? { media: postMediaItems } : {}),
				integrationIds: selectedIds,
				isGlobal: mode === 'global',
				scheduledAt: datetimeLocalToIso(scheduledLocal),
				repeatInterval,
				tagNames: selectedTagNames,
				status: 'scheduled'
			});
			if (r.ok) {
				toast.success('Post scheduled.');
				open = false;
			} else {
				toast.error(r.error);
			}
		} finally {
			busy = false;
		}
	}

	const primaryLabel = $derived(
		selectedIds.length === 0 ? 'Select channels above' : 'Add to calendar'
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		showCloseButton={false}
		class="flex max-h-[min(92vh,900px)] w-[min(100vw-1rem,1400px)] max-w-[min(100vw-1rem,1400px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(100vw-1rem,1400px)]"
	>
		<div class="flex items-start justify-between border-b border-base-300 px-4 py-3 sm:px-6">
			<div class="flex flex-wrap items-center gap-3 text-lg font-semibold text-base-content">
				<span>Create Post</span>
			</div>
			<button
				type="button"
				class="hover:bg-base-200 rounded-md p-2 text-base-content/70 outline-none focus-visible:ring-2 focus-visible:ring-primary"
				onclick={() => requestClose()}
				aria-label="Close"
			>
				<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
			</button>
		</div>

		<div class="flex min-h-0 flex-1 flex-col">
			<AddEditModal
				socialChannels={baseSocialChannels}
				bind:body={editorBody}
				bind:postMediaItems
				uploadUid={uploadUid}
				{busy}
				{selectedIds}
				{mode}
				{focusedIntegrationId}
				previewText={previewText}
				charCount={charCount}
				softCharLimit={softCharLimit}
				selectedGroupId={selectedGroupId}
				onToggleChannel={toggleChannel}
				onToggleGlobal={() => (mode === 'custom' ? backToGlobalMode() : undefined)}
				onRemoveSelected={removeSelected}
				onFocusIntegration={focusIntegration}
				onRequestCustomize={requestCustomize}
				onSelectGroup={selectGroup}
				editorLocked={mode === 'custom' ? editorLocked : false}
				editorLockMessage="Click this button to exit global editing and customize the post for this channel"
				onEditorUnlock={() => ((customEditingUnlocked = true), (editorLocked = false))}
				editorBannerLeftLabel={mode === 'custom' ? 'Editing a Specific Network' : null}
				editorBannerRightActionLabel={mode === 'custom' ? 'Back to global' : null}
				onEditorBannerRightAction={mode === 'custom' ? backToGlobalMode : null}
				{postComment}
				onAddPost={() => toast.message('Thread replies will be added next.')}
				bind:settingsOpen
				providerSettings={providerSettingsByIntegrationId[focusedIntegrationId ?? ''] ?? {}}
				onProviderSettingsChange={updateFocusedProviderSettings}
				mediaUrls={previewMediaUrls}
			/>

			<div class="shrink-0">
				<ManageModal
					{tagList}
					{selectedTagNames}
					{repeatInterval}
					{repeatOptions}
					bind:scheduledLocal
					{busy}
					primaryLabel={primaryLabel}
					scheduleDisabled={selectedIds.length === 0}
					onToggleTag={toggleTag}
					onAddTag={addNewTag}
					onDeleteTag={deleteWorkspaceTag}
					onRepeatChange={(v) => (repeatInterval = v)}
					onSaveDraft={saveAsDraft}
					onSchedule={schedulePost}
				/>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<DeleteDialog
	bind:open={confirmCloseOpen}
	onConfirm={confirmClose}
	onCancel={() => (confirmCloseOpen = false)}
/>

