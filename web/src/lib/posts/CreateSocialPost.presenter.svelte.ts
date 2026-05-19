import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type {
	BackgroundPanelViewModel,
	DesignTemplateViewModel,
	ExportCanvasToMediaArgs,
	ExportDesignToMediaResult,
	GenerateMediaModalPresenter
} from '$lib/canvas';
import type { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { SchedulerPresenter } from '$lib/posts/Scheduler.presenter.svelte';
import type {
	ComposerSnapshotInput,
	CreateSocialPostMode,
	CreateSocialPostPendingOpenState,
	CreateSocialPostPrepareOpenOptions
} from '$lib/posts/createSocialPost.types';
import { createEmptyPendingOpenState } from '$lib/posts/createSocialPost.types';
import type {
	PostMediaViewModel,
	PostTagViewModel,
	CreatePostProgrammerModel,
	PostsRepository,
	RepeatIntervalKey
} from '$lib/posts/Post.repository.svelte';
import {
	isChannelSchedulable,
	unschedulableReason
} from '$lib/posts/utils/createSocialPostChannel';
import {
	applyThreadFollowUpRepliesToSettings,
	channelSupportsFollowUpComments,
	getPrimaryThreadFollowUpIntegrationId,
	legacySharedRepliesFromProviderSnapshot,
	listThreadFollowUpSupportedIntegrationIds,
	syncSharedFollowUpsToProviderSettingsForSetAuthoring,
	threadFollowUpRepliesRawForIntegration
} from '$lib/posts/utils/createSocialPostFollowUp';
import {
	buildPostUpsertPayload,
	buildProgrammaticCreatePostPayloadPreview,
	validateComposerContent,
	type BuildPostUpsertPayloadInput
} from '$lib/posts/utils/createSocialPostPayload';
import { mergeProviderSettingsPatch, cloneProviderSettingsByIntegrationId } from '$lib/posts/utils/createSocialPostProviderSettings';
import {
	computeLaunchCommentsMode,
	computeScheduleValidationError
} from '$lib/posts/utils/createSocialPostScheduleValidation';
import { isComposerDirty, serializeComposerSnapshot } from '$lib/posts/utils/createSocialPostSnapshot';
import type { LaunchProviderCommentsMode } from '$lib/ui/components/posts/providers/provider.types';
import type {
	GetSignaturesPresenter,
	SignatureViewModel
} from '$lib/signatures/GetSignature.presenter.svelte';
import type {
	SetSharedFollowUpReplyViewModel,
	SetSnapshotViewModel
} from '$lib/sets/GetSet.presenter.svelte';
import type { UpsertSetPresenter } from '$lib/sets/UpsertSet.presenter.svelte';

import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
import {
	datetimeLocalToIso,
	isoToDatetimeLocalValue,
	utcIsoToDatetimeLocalValue
} from '$lib/utils/postingSchedulePreferences';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
import { toast } from '$lib/ui/sonner';

export type { CreateSocialPostPrepareOpenOptions } from '$lib/posts/createSocialPost.types';
export { isChannelSchedulable, unschedulableReason } from '$lib/posts/utils/createSocialPostChannel';

/**
 * Shared composer state for the create-post dialog: scheduling UI, repository calls,
 * and optional single-channel preselection (e.g. integration menu → create post).
 */
export class CreateSocialPostPresenter {
	// --- Construction & injected presenters ---

	/** Assigned in constructor — `$derived` fields otherwise see TDZ vs parameter timing (Svelte class analysis). */
	private readonly scheduledPostsPresenter!: GetScheduledPostsPresenter;

	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly mediaModalPresenter: GenerateMediaModalPresenter,
		private readonly getSignaturesPresenter: GetSignaturesPresenter,
		scheduledPostsPresenter: GetScheduledPostsPresenter,
		private readonly upsertSetPresenter: UpsertSetPresenter,
		private readonly schedulerPresenter: SchedulerPresenter
	) {
		this.scheduledPostsPresenter = scheduledPostsPresenter;
	}

	// --- Pending open / edit state (consumed on next onModalOpen) ---

	private pendingOpen = createEmptyPendingOpenState();
	private lastLoadedEditKey: string | null = null;
	private tagListCache: { workspaceId: string; loadedAtMs: number } | null = null;
	private signaturesCache: { organizationId: string; items: SignatureViewModel[]; loadedAtMs: number } | null = null;
	private readonly signaturesCacheTtlMs = 30_000;

	private clearPendingOpenFields(): void {
		this.pendingOpen = createEmptyPendingOpenState();
	}

	private takePendingOpenState(): CreateSocialPostPendingOpenState {
		const snapshot = { ...this.pendingOpen };
		this.clearPendingOpenFields();
		return snapshot;
	}

	// --- Session & composer $state ---

	workspaceIdForSession = $state<string | null>(null);
	connectedChannelsForSessionVm = $state<CreateSocialPostChannelViewModel[]>([]);

	editingPostGroup = $state<string | null>(null);

	mode = $state<CreateSocialPostMode>('global');
	focusedIntegrationId = $state<string | null>(null);
	editorLocked = $state(false);
	customEditingUnlocked = $state(false);
	settingsOpen = $state(false);
	providerSettingsByIntegrationId = $state<Record<string, Record<string, unknown>>>({});

	globalBody = $state('');
	bodiesByIntegrationId = $state<Record<string, string>>({});
	editorBody = $state('');

	selectedIds = $state<string[]>([]);
	selectedGroupId = $state<string | null>(null);
	scheduledLocal = $state('');
	repeatInterval = $state<RepeatIntervalKey | null>(null);
	selectedTagNames = $state<string[]>([]);
	tagList = $state<PostTagViewModel[]>([]);
	postMediaItems = $state<PostMediaViewModel[]>([]);
	busy = $state(false);
	confirmCloseOpen = $state(false);
	initialSnapshot = $state('');
	contentSetAuthoringActive = $state(false);
	editingSetId = $state<string | null>(null);
	editingSetName = $state<string>('');
	sharedFollowUpReplies = $state<SetSharedFollowUpReplyViewModel[]>([]);

	// --- Derived view models ---

	baseSocialChannelsVm = $derived(
		this.connectedChannelsForSessionVm.filter((c) => (c.type ?? '').toLowerCase() === 'social')
	);

	focusedProviderIdentifier = $derived.by(() => {
		if (this.mode !== 'custom' || !this.focusedIntegrationId) return null;
		return this.baseSocialChannelsVm.find((c) => c.id === this.focusedIntegrationId)?.identifier ?? null;
	});

	providerConfig = $derived(getLaunchProviderConfig(this.focusedProviderIdentifier));

	launchCommentsMode = $derived.by((): LaunchProviderCommentsMode =>
		computeLaunchCommentsMode({
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm
		})
	);

	softCharLimit = $derived(this.providerConfig.maximumCharacters);
	minimumCharacters = $derived(this.providerConfig.minimumCharacters);
	postComment = $derived(this.providerConfig.postComment);

	previewText = $derived(stripHtmlToPlainText(this.editorBody));
	charCount = $derived(this.previewText.length);
	previewMediaUrls = $derived(
		this.scheduledPostsPresenter.toPostMediaPreviewUrlsVm(this.postMediaItems)
	);

	primaryLabel = $derived(
		this.selectedIds.length === 0
			? 'Select channels above'
			: this.editingPostGroup
				? 'Update'
				: 'Add to calendar'
	);

	scheduleValidationError = $derived.by((): string | null =>
		computeScheduleValidationError({
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			postMediaItems: this.postMediaItems,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		})
	);

	canSchedule = $derived(!this.busy && this.selectedIds.length > 0);

	dirty = $derived(isComposerDirty(this.initialSnapshot, this.composerSnapshotInput()));

	// --- Media modal passthrough ---

	get stockPhotosVm() {
		return this.mediaModalPresenter.stockPhotosVm;
	}

	get designTemplatesVm(): readonly DesignTemplateViewModel[] {
		return this.mediaModalPresenter.designTemplatesVm;
	}

	get backgroundPanelVm(): BackgroundPanelViewModel {
		return this.mediaModalPresenter.backgroundPanelVm;
	}

	/** Arrow so `this` stays bound when passed into MediaGenerationModal / ComposerMediaToolbar. */
	fetchPolotnoTemplateListPage = (
		params: { query: string; page: number },
		signal?: AbortSignal
	) => this.mediaModalPresenter.fetchPolotnoTemplateListPagePm(params, signal);

	exportCanvasToMedia = (args: ExportCanvasToMediaArgs): Promise<ExportDesignToMediaResult> =>
		this.mediaModalPresenter.exportCanvasToMedia(args);

	// --- Open / close preparation ---

	prepareOpen(options: CreateSocialPostPrepareOpenOptions): void {
		this.clearPendingOpenFields();
		this.pendingOpen = {
			...createEmptyPendingOpenState(),
			preselectIntegrationId: options.preselectIntegrationId,
			preselectGroupId: options.preselectGroupId ?? null,
			preselectScheduledAtIso: options.preselectScheduledAtIso ?? null,
			preselectIntegrationIds: options.preselectIntegrationIds ?? null,
			autoCustomizeFirstSelected: options.autoCustomizeFirstSelected ?? false,
			setSnapshot: options.setSnapshot ?? null,
			contentSetAuthoring: options.contentSetAuthoring ?? null
		};
	}

	prepareEdit(postGroup: string): void {
		this.clearPendingOpenFields();
		this.pendingOpen.editPostGroup = postGroup;
	}

	prepareDuplicate(postGroup: string): void {
		this.clearPendingOpenFields();
		this.pendingOpen.duplicatePostGroup = postGroup;
	}

	prepareContentSetAuthoring(opts: {
		editingSetId?: string | null;
		editingSetName?: string | null;
		snapshot?: SetSnapshotViewModel | null;
	}): void {
		this.clearPendingOpenFields();
		this.pendingOpen.setSnapshot = opts.snapshot ?? null;
		this.pendingOpen.contentSetAuthoring = {
			editingSetId: opts.editingSetId ?? null,
			editingSetName: opts.editingSetName ?? null
		};
	}

	// --- Channel & tag selection ---

	toggleChannel(id: string): void {
		if (this.selectedIds.includes(id)) {
			this.selectedIds = this.selectedIds.filter((x) => x !== id);
			if (this.mode === 'custom' && this.focusedIntegrationId === id) {
				this.focusedIntegrationId = this.selectedIds.length ? this.selectedIds[0]! : null;
				this.editorLocked = true;
				this.loadEditorBody();
			}
		} else {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
			if (!isChannelSchedulable(ch)) {
				toast.error(unschedulableReason(ch) ?? 'Reconnect this channel first.');
				return;
			}
			this.selectedIds = [...this.selectedIds, id];
		}
	}

	removeSelected(id: string): void {
		const nextSelected = this.selectedIds.filter((x) => x !== id);
		this.selectedIds = nextSelected;

		if (this.selectedGroupId) {
			const hasAnyFromCustomer = nextSelected.some(
				(sid) => this.baseSocialChannelsVm.find((c) => c.id === sid)?.group?.id === this.selectedGroupId
			);
			if (!hasAnyFromCustomer) {
				this.selectedGroupId = null;
			}
		}
	}

	toggleTag(name: string): void {
		const t = name.trim();
		if (!t) return;
		if (this.selectedTagNames.includes(t)) {
			this.selectedTagNames = this.selectedTagNames.filter((x) => x !== t);
		} else {
			this.selectedTagNames = [...this.selectedTagNames, t];
		}
	}

	selectGroup(groupId: string | null): void {
		this.selectedGroupId = groupId;
		if (!groupId) return;
		const ids = this.baseSocialChannelsVm.filter((c) => c.group?.id === groupId).map((c) => c.id);
		this.selectedIds = ids;
		if (ids.length) {
			toast.success('Group channels selected');
		}
	}

	// --- Editor mode & body persistence ---

	persistEditorBody(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.bodiesByIntegrationId = { ...this.bodiesByIntegrationId, [this.focusedIntegrationId]: this.editorBody };
			return;
		}
		this.globalBody = this.editorBody;
	}

	loadEditorBody(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.editorBody = this.bodiesByIntegrationId[this.focusedIntegrationId] ?? this.globalBody;
			return;
		}
		this.editorBody = this.globalBody;
	}

	enterCustomMode(integrationId: string): void {
		if (this.contentSetAuthoringActive) {
			toast.message('Per-channel editing is disabled while you define a reusable set.');
			return;
		}
		this.persistEditorBody();
		this.mode = 'custom';
		this.focusedIntegrationId = integrationId;
		this.editorLocked = !this.customEditingUnlocked;
		this.settingsOpen = false;
		this.loadEditorBody();
	}

	backToGlobalMode(): void {
		this.persistEditorBody();
		this.mode = 'global';
		this.focusedIntegrationId = null;
		this.editorLocked = false;
		this.customEditingUnlocked = false;
		this.settingsOpen = false;
		this.loadEditorBody();
	}

	requestCustomize(integrationId: string): void {
		this.enterCustomMode(integrationId);
	}

	focusIntegration(id: string): void {
		if (this.mode !== 'custom') return;
		if (this.focusedIntegrationId === id) return;
		this.persistEditorBody();
		this.focusedIntegrationId = id;
		this.settingsOpen = false;
		this.loadEditorBody();
	}

	updateFocusedProviderSettings(next: Record<string, unknown>): void {
		if (this.mode !== 'custom' || !this.focusedIntegrationId) return;
		const id = this.focusedIntegrationId;
		const current = this.providerSettingsByIntegrationId[id] ?? {};
		const merged = mergeProviderSettingsPatch(current, next);
		this.providerSettingsByIntegrationId = {
			...this.providerSettingsByIntegrationId,
			[id]: merged
		};
	}

	// --- Follow-up replies ---

	addThreadReplyForFocused(): boolean {
		if (this.contentSetAuthoringActive) {
			const hasSupport = this.selectedIds.some((id) => {
				const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
				return channelSupportsFollowUpComments(ch?.identifier);
			});
			if (!hasSupport) {
				toast.message('Add at least one Threads or Instagram channel to use follow-up comments.');
				return false;
			}
			this.sharedFollowUpReplies = [
				...this.sharedFollowUpReplies,
				{ id: crypto.randomUUID(), message: '', delaySeconds: 0 }
			];
			return true;
		}

		const targets = this.listThreadFollowUpSupportedIntegrationIds();
		if (targets.length === 0) {
			if (this.mode === 'custom') {
				toast.message('Follow-up comments are supported on Threads and Instagram only.');
			} else {
				toast.message('Select at least one Threads or Instagram channel to add follow-up comments.');
			}
			return false;
		}

		const primary = this.getPrimaryThreadFollowUpIntegrationId() ?? targets[0]!;
		const replies = threadFollowUpRepliesRawForIntegration({
			integrationId: primary,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		});
		this.applyThreadFollowUpReplies([
			...replies,
			{ id: crypto.randomUUID(), message: '', delaySeconds: 0 }
		]);
		return true;
	}

	setSharedFollowUpRepliesForSetAuthoring(next: SetSharedFollowUpReplyViewModel[]): void {
		this.sharedFollowUpReplies = next;
	}

	listThreadFollowUpSupportedIntegrationIds(): string[] {
		return listThreadFollowUpSupportedIntegrationIds({
			mode: this.mode,
			contentSetAuthoringActive: this.contentSetAuthoringActive,
			focusedIntegrationId: this.focusedIntegrationId,
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm
		});
	}

	getPrimaryThreadFollowUpIntegrationId(): string | null {
		return getPrimaryThreadFollowUpIntegrationId({
			contentSetAuthoringActive: this.contentSetAuthoringActive,
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			supportedIntegrationIds: this.listThreadFollowUpSupportedIntegrationIds(),
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		});
	}

	getThreadFollowUpRepliesForEditor(): { id: string; message: string; delaySeconds: number }[] {
		const pid = this.getPrimaryThreadFollowUpIntegrationId();
		if (!pid) return [];
		return threadFollowUpRepliesRawForIntegration({
			integrationId: pid,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		});
	}

	applyThreadFollowUpReplies(next: { id: string; message: string; delaySeconds: number }[]): void {
		const targets = this.listThreadFollowUpSupportedIntegrationIds();
		this.providerSettingsByIntegrationId = applyThreadFollowUpRepliesToSettings({
			next,
			targetIntegrationIds: targets,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		});
	}

	handleAddThreadItemClick(): void {
		const ok = this.addThreadReplyForFocused();
		if (ok) {
			toast.success('Comment editor added below — you can edit it there.');
		}
	}

	// --- Modal lifecycle ---

	async onModalOpen(workspaceId: string, connectedChannels: CreateSocialPostChannelViewModel[]): Promise<void> {
		const pending = this.takePendingOpenState();

		this.workspaceIdForSession = workspaceId;
		this.connectedChannelsForSessionVm = connectedChannels;

		this.resetForm();
		if (pending.duplicatePostGroup) {
			await this.loadExisting(workspaceId, pending.duplicatePostGroup);
			this.editingPostGroup = null;
			this.lastLoadedEditKey = null;

			const slot = await this.postsRepository.findSlot(workspaceId);
			if (slot.ok) {
				this.scheduledLocal = isoToDatetimeLocalValue(slot.dateIso);
			}

			this.captureInitialSnapshot();
			return;
		}
		if (pending.editPostGroup) {
			await this.loadExisting(workspaceId, pending.editPostGroup);
			this.captureInitialSnapshot();
			return;
		}
		await this.loadInitial(workspaceId, pending.preselectScheduledAtIso);

		if (pending.contentSetAuthoring) {
			this.contentSetAuthoringActive = true;
			this.editingSetId = pending.contentSetAuthoring.editingSetId ?? null;
			this.editingSetName = (pending.contentSetAuthoring.editingSetName ?? '').trim();
		} else {
			this.contentSetAuthoringActive = false;
			this.editingSetId = null;
			this.editingSetName = '';
		}

		if (pending.setSnapshot) {
			this.applySetSnapshot(pending.setSnapshot);
			this.captureInitialSnapshot();
			return;
		}

		if (!this.contentSetAuthoringActive) {
			await this.maybeAutoAddDefaultSignature(workspaceId);
		}

		if (pending.preselectGroupId) {
			this.selectGroup(pending.preselectGroupId);
		}

		if (
			Array.isArray(pending.preselectIntegrationIds) &&
			pending.preselectIntegrationIds.length > 0 &&
			!pending.preselectGroupId
		) {
			this.applyPreselectedIntegrationIds(pending.preselectIntegrationIds);
		}

		if (
			pending.preselectIntegrationId &&
			(!pending.preselectIntegrationIds || pending.preselectIntegrationIds.length === 0) &&
			!pending.preselectGroupId &&
			this.baseSocialChannelsVm.some((c) => c.id === pending.preselectIntegrationId)
		) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === pending.preselectIntegrationId);
			if (isChannelSchedulable(ch)) {
				this.selectedIds = [pending.preselectIntegrationId];
			} else {
				toast.error(unschedulableReason(ch) ?? 'Reconnect this channel first.');
			}
		}

		if (pending.autoCustomizeFirstSelected && this.selectedIds.length > 0 && !this.contentSetAuthoringActive) {
			this.enterCustomMode(this.selectedIds[0]!);
		}

		this.captureInitialSnapshot();
	}

	onModalClose(): void {
		this.confirmCloseOpen = false;
		const duplicatePostGroup = this.pendingOpen.duplicatePostGroup;
		this.clearPendingOpenFields();
		this.pendingOpen.duplicatePostGroup = duplicatePostGroup;
	}

	requestClose(): boolean {
		if (this.dirty) {
			this.confirmCloseOpen = true;
			return false;
		}
		return true;
	}

	confirmClose(): void {
		this.confirmCloseOpen = false;
	}

	// --- Tags ---

	async loadWorkspaceTagsIfNeeded(workspaceId: string): Promise<void> {
		await this.ensureTagListLoaded(workspaceId);
	}

	async addNewTag(name?: string, color?: string): Promise<void> {
		if (!name) return;
		const c = (color ?? '').trim() || '#6366f1';
		const t = name.trim();
		if (!t || !this.workspaceIdForSession) return;
		this.busy = true;
		try {
			const createTagPmResult = await this.postsRepository.createTag(this.workspaceIdForSession, t, c);
			if (createTagPmResult.ok) {
				this.tagList = [...this.tagList.filter((x) => x.id !== createTagPmResult.tag.id), createTagPmResult.tag];
				if (!this.selectedTagNames.includes(createTagPmResult.tag.name)) {
					this.selectedTagNames = [...this.selectedTagNames, createTagPmResult.tag.name];
				}
				toast.success('Tag added.');
			} else {
				toast.error(createTagPmResult.error);
			}
		} finally {
			this.busy = false;
		}
	}

	async deleteWorkspaceTag(tag: PostTagViewModel): Promise<void> {
		if (!this.workspaceIdForSession) return;
		this.busy = true;
		try {
			const deleteTagPmResult = await this.postsRepository.deleteTag(this.workspaceIdForSession, tag.id);
			if (deleteTagPmResult.ok) {
				this.tagList = this.tagList.filter((x) => x.id !== tag.id);
				this.selectedTagNames = this.selectedTagNames.filter((n) => n !== tag.name);
				toast.success('Tag deleted.');
			} else {
				toast.error(deleteTagPmResult.error);
			}
		} finally {
			this.busy = false;
		}
	}

	// --- Payload preview & persist ---

	getProgrammaticCreatePostPayloadPreview(
		status: CreatePostProgrammerModel['status']
	):
		| { ok: true; payload: Omit<CreatePostProgrammerModel, 'organizationId'> }
		| { ok: false; error: string } {
		const workspaceId = this.workspaceIdForSession ?? '';
		return buildProgrammaticCreatePostPayloadPreview(
			{
				...this.buildPersistInput(workspaceId, status),
				scheduleValidationError: this.scheduleValidationError,
				baseSocialChannelsVm: this.baseSocialChannelsVm,
				minimumCharacters: this.minimumCharacters,
				softCharLimit: this.softCharLimit
			},
			status
		);
	}

	async saveAsDraft(): Promise<boolean> {
		this.persistEditorBody();
		const workspaceId = this.workspaceIdForSession;
		if (!workspaceId) {
			toast.error('Select a workspace.');
			return false;
		}
		const content = validateComposerContent({
			editorBody: this.editorBody,
			postMediaItems: this.postMediaItems,
			minimumCharacters: this.minimumCharacters,
			softCharLimit: this.softCharLimit
		});
		if (!content.ok) {
			toast.error(content.error);
			return false;
		}
		this.busy = true;
		try {
			const payload = buildPostUpsertPayload(this.buildPersistInput(workspaceId, 'draft'));
			const persistDraftPmResult = this.editingPostGroup
				? await this.postsRepository.updatePostGroup(this.editingPostGroup, payload)
				: await this.postsRepository.createPost(payload);
			if (persistDraftPmResult.ok) {
				toast.success(this.editingPostGroup ? 'Draft updated.' : 'Draft saved.');
				return true;
			}
			toast.error(persistDraftPmResult.error);
			return false;
		} finally {
			this.busy = false;
		}
	}

	async schedulePost(): Promise<boolean> {
		this.persistEditorBody();
		const workspaceId = this.workspaceIdForSession;
		if (!workspaceId) {
			toast.error('Select a workspace.');
			return false;
		}
		if (this.selectedIds.length === 0) {
			toast.error('Select at least one channel above.');
			return false;
		}
		for (const id of this.selectedIds) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
			if (!isChannelSchedulable(ch)) {
				toast.error(unschedulableReason(ch) ?? 'Reconnect this channel first.');
				return false;
			}
		}
		if (this.scheduleValidationError) {
			toast.warning(this.scheduleValidationError);
			return false;
		}
		const content = validateComposerContent({
			editorBody: this.editorBody,
			postMediaItems: this.postMediaItems,
			minimumCharacters: this.minimumCharacters,
			softCharLimit: this.softCharLimit
		});
		if (!content.ok) {
			toast.error(content.error);
			return false;
		}
		this.busy = true;
		try {
			const payload = buildPostUpsertPayload(this.buildPersistInput(workspaceId, 'scheduled'));
			const schedulePostPmResult = this.editingPostGroup
				? await this.postsRepository.updatePostGroup(this.editingPostGroup, payload)
				: await this.postsRepository.createPost(payload);
			if (schedulePostPmResult.ok) {
				toast.success(this.editingPostGroup ? 'Post updated.' : 'Post scheduled.');
				return true;
			}
			toast.error(schedulePostPmResult.error);
			return false;
		} finally {
			this.busy = false;
		}
	}

	async deleteEditingPostGroup(): Promise<boolean> {
		const postGroup = this.editingPostGroup;
		if (!postGroup) return false;
		this.busy = true;
		try {
			const deletePostGroupPmResult = await this.postsRepository.deletePostGroup(postGroup);
			if (deletePostGroupPmResult.ok) {
				this.schedulerPresenter.evictPostGroupFromCache(postGroup);
				toast.success('Post deleted.');
				return true;
			}
			toast.error(deletePostGroupPmResult.error);
			return false;
		} finally {
			this.busy = false;
		}
	}

	// --- Workspace sets ---

	buildSetSnapshot(): SetSnapshotViewModel {
		this.persistEditorBody();
		let providerCopy = cloneProviderSettingsByIntegrationId(this.providerSettingsByIntegrationId);
		if (this.contentSetAuthoringActive) {
			providerCopy = syncSharedFollowUpsToProviderSettingsForSetAuthoring({
				base: providerCopy,
				sharedFollowUpReplies: this.sharedFollowUpReplies,
				selectedIds: this.selectedIds,
				baseSocialChannelsVm: this.baseSocialChannelsVm
			});
		}
		const shared =
			this.contentSetAuthoringActive && this.sharedFollowUpReplies.length > 0
				? (JSON.parse(JSON.stringify(this.sharedFollowUpReplies)) as SetSharedFollowUpReplyViewModel[])
				: undefined;
		return {
			selectedIntegrationIds: [...this.selectedIds],
			selectedGroupId: this.selectedGroupId,
			mode: this.mode,
			focusedIntegrationId: this.focusedIntegrationId,
			globalBody: this.globalBody,
			bodiesByIntegrationId: { ...this.bodiesByIntegrationId },
			providerSettingsByIntegrationId: providerCopy,
			...(shared && shared.length > 0 ? { sharedFollowUpReplies: shared } : {}),
			postMediaItems: [...this.postMediaItems],
			selectedTagNames: [...this.selectedTagNames],
			repeatInterval: this.repeatInterval
		};
	}

	async saveContentSet(workspaceId: string, name: string): Promise<boolean> {
		const trimmed = name.trim();
		if (!trimmed) {
			toast.error('Enter a name for this set.');
			return false;
		}
		if (!this.selectedIds.length) {
			toast.error('Select at least one channel for this set.');
			return false;
		}
		this.persistEditorBody();
		const plain = stripHtmlToPlainText(this.editorBody);
		const hasText = plain.length > 0;
		const hasMedia = this.postMediaItems.length > 0;
		if (!hasText && !hasMedia) {
			toast.error('Write something or attach media before saving a set.');
			return false;
		}
		const snapshot = this.buildSetSnapshot();
		this.busy = true;
		try {
			const resultVm = await this.upsertSetPresenter.upsertSet({
				organizationId: workspaceId,
				...(this.editingSetId ? { id: this.editingSetId } : {}),
				name: trimmed,
				snapshot
			});
			if (!resultVm.ok) {
				toast.error(resultVm.error);
				return false;
			}
			this.editingSetId = resultVm.id;
			this.editingSetName = trimmed;
			toast.success('Set saved.');
			this.captureInitialSnapshot();
			return true;
		} finally {
			this.busy = false;
		}
	}

	// --- Private helpers ---

	private composerSnapshotInput(): ComposerSnapshotInput {
		return {
			mode: this.mode,
			focusedIntegrationId: this.focusedIntegrationId,
			selectedGroupId: this.selectedGroupId,
			globalBody: this.globalBody,
			bodiesByIntegrationId: this.bodiesByIntegrationId,
			editorBody: this.editorBody,
			postMediaItems: this.postMediaItems,
			selectedIds: this.selectedIds,
			scheduledLocal: this.scheduledLocal,
			repeatInterval: this.repeatInterval,
			selectedTagNames: this.selectedTagNames,
			contentSetAuthoringActive: this.contentSetAuthoringActive,
			sharedFollowUpReplies: this.sharedFollowUpReplies
		};
	}

	private buildPersistInput(
		workspaceId: string,
		status: BuildPostUpsertPayloadInput['status']
	): BuildPostUpsertPayloadInput {
		return {
			workspaceId,
			mode: this.mode,
			globalBody: this.globalBody,
			bodiesByIntegrationId: this.bodiesByIntegrationId,
			focusedIntegrationId: this.focusedIntegrationId,
			editorBody: this.editorBody,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId,
			postMediaItems: this.postMediaItems,
			selectedIds: this.selectedIds,
			scheduledLocal: this.scheduledLocal,
			repeatInterval: this.repeatInterval,
			selectedTagNames: this.selectedTagNames,
			status
		};
	}

	private captureInitialSnapshot(): void {
		this.initialSnapshot = serializeComposerSnapshot(this.composerSnapshotInput());
	}

	private resetForm(): void {
		this.mode = 'global';
		this.focusedIntegrationId = null;
		this.editorLocked = false;
		this.customEditingUnlocked = false;
		this.editingPostGroup = null;
		this.contentSetAuthoringActive = false;
		this.editingSetId = null;
		this.editingSetName = '';

		this.globalBody = '';
		this.bodiesByIntegrationId = {};
		this.editorBody = '';
		this.postMediaItems = [];
		this.providerSettingsByIntegrationId = {};
		this.sharedFollowUpReplies = [];

		this.selectedIds = [];
		this.selectedGroupId = null;
		this.repeatInterval = null;
		this.selectedTagNames = [];
		this.initialSnapshot = '';
	}

	private applyPreselectedIntegrationIds(preselectIntegrationIds: string[]): void {
		const allowed = new Set(this.baseSocialChannelsVm.map((c) => c.id));
		const deduped = [...new Set(preselectIntegrationIds)].filter((id) => allowed.has(id));
		const okIds = deduped.filter((id) => {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
			return isChannelSchedulable(ch);
		});
		const dropped = deduped.filter((id) => !okIds.includes(id));
		this.selectedIds = okIds;
		if (dropped.length > 0) {
			toast.error('Some channels need reconnecting before you can schedule posts to them.');
		}

		const selectedGroups = new Set(
			this.selectedIds
				.map((id) => this.baseSocialChannelsVm.find((c) => c.id === id)?.group?.id ?? null)
				.filter((g): g is string => Boolean(g))
		);
		const hasUngrouped = this.selectedIds.some(
			(id) => !this.baseSocialChannelsVm.find((c) => c.id === id)?.group?.id
		);
		if (!hasUngrouped && selectedGroups.size === 1) {
			this.selectedGroupId = [...selectedGroups][0] ?? null;
		}
	}

	private applySetSnapshot(snapshot: SetSnapshotViewModel): void {
		const allowed = new Set(this.baseSocialChannelsVm.map((c) => c.id));
		const ids = snapshot.selectedIntegrationIds.filter((id) => allowed.has(id));
		const okIds = ids.filter((id) => {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
			return isChannelSchedulable(ch);
		});
		this.selectedIds = okIds;

		let gid = snapshot.selectedGroupId;
		if (
			gid &&
			!okIds.some((id) => this.baseSocialChannelsVm.find((c) => c.id === id)?.group?.id === gid)
		) {
			gid = null;
		}
		this.selectedGroupId = gid;

		this.globalBody = snapshot.globalBody ?? '';
		this.bodiesByIntegrationId = { ...snapshot.bodiesByIntegrationId };
		this.providerSettingsByIntegrationId = cloneProviderSettingsByIntegrationId(
			snapshot.providerSettingsByIntegrationId
		);

		if (this.contentSetAuthoringActive) {
			const sfr = snapshot.sharedFollowUpReplies;
			if (Array.isArray(sfr) && sfr.length > 0) {
				this.sharedFollowUpReplies = JSON.parse(JSON.stringify(sfr)) as SetSharedFollowUpReplyViewModel[];
			} else {
				this.sharedFollowUpReplies = legacySharedRepliesFromProviderSnapshot({
					snapshot,
					okIntegrationIds: okIds,
					baseSocialChannelsVm: this.baseSocialChannelsVm
				});
			}
		} else {
			this.sharedFollowUpReplies = [];
		}
		this.postMediaItems = Array.isArray(snapshot.postMediaItems) ? [...snapshot.postMediaItems] : [];
		this.selectedTagNames = [...(snapshot.selectedTagNames ?? [])];
		this.repeatInterval = snapshot.repeatInterval ?? null;

		const mode = snapshot.mode === 'custom' ? 'custom' : 'global';
		this.mode = mode;
		if (mode === 'custom') {
			const focusCandidate =
				snapshot.focusedIntegrationId && okIds.includes(snapshot.focusedIntegrationId)
					? snapshot.focusedIntegrationId
					: (okIds[0] ?? null);
			this.focusedIntegrationId = focusCandidate;
			this.editorLocked = true;
			this.customEditingUnlocked = false;
		} else {
			this.focusedIntegrationId = null;
			this.editorLocked = false;
			this.customEditingUnlocked = false;
		}
		this.settingsOpen = false;
		this.loadEditorBody();
	}

	private async loadInitial(workspaceId: string, preselectScheduledAtIso?: string | null): Promise<void> {
		this.busy = true;
		try {
			if (preselectScheduledAtIso) {
				const v = utcIsoToDatetimeLocalValue(preselectScheduledAtIso);
				if (v) {
					this.scheduledLocal = v;
				} else {
					const fallbackMs = Date.now() + 5 * 60 * 1000;
					this.scheduledLocal = isoToDatetimeLocalValue(new Date(fallbackMs).toISOString());
				}
			} else {
				const slot = await this.postsRepository.findSlot(workspaceId);
				if (slot.ok) {
					this.scheduledLocal = utcIsoToDatetimeLocalValue(slot.dateIso);
				} else {
					const fallbackMs = Date.now() + 5 * 60 * 1000;
					this.scheduledLocal = isoToDatetimeLocalValue(new Date(fallbackMs).toISOString());
					toast.error(slot.error);
				}
			}
			await this.ensureTagListLoaded(workspaceId);

			this.mode = 'global';
			this.focusedIntegrationId = null;
			this.editorLocked = false;
			this.globalBody = '';
			this.bodiesByIntegrationId = {};
			this.editorBody = '';
			this.postMediaItems = [];
		} finally {
			this.busy = false;
		}
	}

	private async loadExisting(workspaceId: string, postGroup: string): Promise<void> {
		this.busy = true;
		try {
			await this.ensureTagListLoaded(workspaceId);

			const editKey = `${workspaceId}:${postGroup}`;
			if (this.lastLoadedEditKey === editKey && this.editingPostGroup === postGroup) {
				return;
			}

			const getPostGroupPmResult = await this.postsRepository.getPostGroup(postGroup);
			if (!getPostGroupPmResult.ok) {
				toast.error(getPostGroupPmResult.error);
				await this.loadInitial(workspaceId);
				return;
			}
			const g = getPostGroupPmResult.group;
			if (g.organizationId !== workspaceId) {
				toast.error('Post is not in the selected workspace.');
				await this.loadInitial(workspaceId);
				return;
			}

			this.editingPostGroup = g.postGroup;
			this.lastLoadedEditKey = editKey;
			this.repeatInterval = g.repeatInterval ?? null;
			this.selectedTagNames = Array.isArray(g.tagNames) ? g.tagNames : [];
			this.postMediaItems = Array.isArray(g.media) ? g.media : [];
			this.scheduledLocal = isoToDatetimeLocalValue(g.publishDateIso);

			const allowed = new Set(this.baseSocialChannelsVm.map((c) => c.id));
			this.selectedIds = (g.integrationIds ?? []).filter((id) => allowed.has(id));

			this.globalBody = g.body ?? '';
			this.bodiesByIntegrationId = g.bodiesByIntegrationId ?? {};
			this.providerSettingsByIntegrationId =
				g.providerSettingsByIntegrationId && typeof g.providerSettingsByIntegrationId === 'object'
					? { ...g.providerSettingsByIntegrationId }
					: {};

			if (g.isGlobal) {
				this.mode = 'global';
				this.focusedIntegrationId = null;
				this.editorLocked = false;
				this.customEditingUnlocked = false;
				this.editorBody = this.globalBody;
				return;
			}

			this.mode = 'custom';
			this.focusedIntegrationId = this.selectedIds[0] ?? null;
			this.editorLocked = true;
			this.customEditingUnlocked = false;
			this.settingsOpen = false;
			this.loadEditorBody();
		} finally {
			this.busy = false;
		}
	}

	private async ensureTagListLoaded(workspaceId: string): Promise<void> {
		const now = Date.now();
		const freshForMs = 30_000;
		if (this.tagListCache?.workspaceId === workspaceId && now - this.tagListCache.loadedAtMs < freshForMs) {
			return;
		}
		const tags = await this.postsRepository.listTags(workspaceId);
		if (tags.ok) {
			this.tagList = tags.tags;
			this.tagListCache = { workspaceId, loadedAtMs: now };
		} else {
			toast.error(tags.error);
		}
	}

	loadSignaturesVmForComposer = async (organizationId: string) => {
		const oid = (organizationId ?? '').trim();
		if (!oid) return { ok: true as const, items: [] };

		const cached = this.signaturesCache;
		if (
			cached &&
			cached.organizationId === oid &&
			Date.now() - cached.loadedAtMs < this.signaturesCacheTtlMs
		) {
			return { ok: true as const, items: cached.items };
		}

		const resVm = await this.getSignaturesPresenter.loadSignaturesForOrganizationResult(oid);
		if (resVm.ok) {
			this.signaturesCache = { organizationId: oid, items: resVm.items, loadedAtMs: Date.now() };
		}
		return resVm;
	};

	private async maybeAutoAddDefaultSignature(workspaceId: string): Promise<void> {
		if (this.globalBody.trim().length > 0) return;
		if (Object.keys(this.bodiesByIntegrationId ?? {}).length > 0) return;

		const res = await this.loadSignaturesVmForComposer(workspaceId);
		if (!res.ok) return;
		const sig = res.items.find((s) => s.isDefault);
		const content = (sig?.content ?? '').trim();
		if (!content) return;

		this.globalBody = content;
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.bodiesByIntegrationId = { ...this.bodiesByIntegrationId, [this.focusedIntegrationId]: content };
		}
		this.editorBody = content;
	}
}
