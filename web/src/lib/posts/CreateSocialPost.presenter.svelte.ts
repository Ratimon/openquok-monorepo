import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { IntegrationEditorMode } from '$lib/integrations/integrationEditorMode';
import type { HumanizePresenter } from '$lib/ai-humanize';
import type { SummarizerPresenter } from '$lib/ai-summarizer';
import type { WriterPresenter } from '$lib/ai-writer';
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
	CreateSocialPostPrepareOpenOptions,
	ThreadFollowUpReply
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
	applyThreadFollowUpRepliesToSettings,
	buildPostUpsertPayload,
	buildProgrammaticCreatePostPayloadPreview,
	channelSupportsFollowUpComments,
	clearPerChannelBodies,
	clearPerChannelMedia,
	cloneProviderSettingsByIntegrationId,
	computeLaunchMaxMediaItems,
	computeScheduleValidationError,
	computeScheduleValidationErrorAsync,
	getPrimaryThreadFollowUpIntegrationId,
	isChannelSchedulable,
	isComposerDirty,
	legacySharedRepliesFromProviderSnapshot,
	listThreadFollowUpSupportedIntegrationIds,
	mergeProviderSettingsPatch,
	migrateProviderSettingsByIntegrationIdOnLoad,
	serializeComposerSnapshot,
	syncSharedFollowUpsToProviderSettingsForSetAuthoring,
	threadFollowUpRepliesRawForIntegration,
	unschedulableReason,
	validateComposerContent,
	type BuildPostUpsertPayloadInput
} from '$lib/posts/utils/create-post';
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
	composerBodyForEditorMode,
	computeSoftCharLimitAcrossSelected,
	createComposerTextHistory,
	maxCharactersForChannel,
	selectedIdsIncludeXChannel,
	stripComposerBodyForEditor,
	xWeightedLength,
	type ComposerTextHistory,
	type ComposerTextSnapshot
} from '$lib/posts/utils/composer';
import {
	datetimeLocalToIso,
	isoToDatetimeLocalValue,
	utcIsoToDatetimeLocalValue
} from '$lib/utils/postingSchedulePreferences';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
import { toast } from '$lib/ui/sonner';

export type { CreateSocialPostPrepareOpenOptions } from '$lib/posts/createSocialPost.types';
export { isChannelSchedulable, unschedulableReason } from '$lib/posts/utils/create-post';

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
		private readonly writerPresenter: WriterPresenter,
		private readonly summarizerPresenter: SummarizerPresenter,
		private readonly humanizePresenter: HumanizePresenter,
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
	private tagsVmCache: { workspaceId: string; loadedAtMs: number } | null = null;
	private signaturesCache: { organizationId: string; items: SignatureViewModel[]; loadedAtMs: number } | null = null;
	private readonly signaturesCacheTtlMs = 30_000;
	private composerTextHistoryByKey = new Map<string, ComposerTextHistory>();

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
	/** Group status when edit load finished; used for optimistic posts/month usage after schedule. */
	editingGroupStatusBeforeSave = $state<'draft' | 'scheduled' | null>(null);
	/** Billing-month usage delta from the last successful schedule or draft save (consume from page callbacks). */
	lastPostsUsageRowDelta = $state(0);

	mode = $state<CreateSocialPostMode>('global');
	focusedIntegrationId = $state<string | null>(null);
	editorLocked = $state(false);
	customEditingUnlocked = $state(false);
	settingsOpen = $state(false);
	providerSettingsByIntegrationId = $state<Record<string, Record<string, unknown>>>({});

	globalBody = $state('');
	bodiesByIntegrationId = $state<Record<string, string>>({});
	editorBody = $state('');
	globalMediaItems = $state<PostMediaViewModel[]>([]);
	mediaByIntegrationId = $state<Record<string, PostMediaViewModel[]>>({});

	selectedIds = $state<string[]>([]);
	selectedGroupId = $state<string | null>(null);
	scheduledLocal = $state('');
	repeatInterval = $state<RepeatIntervalKey | null>(null);
	selectedTagNames = $state<string[]>([]);
	tagsVm = $state<PostTagViewModel[]>([]);
	postMediaItemsVm = $state<PostMediaViewModel[]>([]);
	busy = $state(false);
	confirmCloseOpen = $state(false);
	initialSnapshot = $state('');
	contentSetAuthoringActive = $state(false);
	editingSetId = $state<string | null>(null);
	editingSetName = $state<string>('');
	sharedFollowUpRepliesVm = $state<SetSharedFollowUpReplyViewModel[]>([]);

	// --- Derived view models ---

	baseSocialChannelsVm = $derived(
		this.connectedChannelsForSessionVm.filter((c) => (c.type ?? '').toLowerCase() === 'social')
	);

	focusedProviderIdentifier = $derived.by(() => {
		if (this.mode !== 'custom' || !this.focusedIntegrationId) return null;
		return this.baseSocialChannelsVm.find((c) => c.id === this.focusedIntegrationId)?.identifier ?? null;
	});

	focusedChannelVm = $derived.by(() => {
		if (!this.focusedIntegrationId) return null;
		return this.baseSocialChannelsVm.find((c) => c.id === this.focusedIntegrationId) ?? null;
	});

	/** Global mode always uses Standard (`normal`); per-channel unlock uses the channel's `editor`. */
	composerEditorMode = $derived.by((): IntegrationEditorMode => {
		if (this.mode === 'global') return 'normal';
		return this.focusedChannelVm?.editor ?? 'normal';
	});

	providerConfig = $derived(getLaunchProviderConfig(this.focusedProviderIdentifier));

	launchMaxMediaItems = $derived.by((): number | null =>
		computeLaunchMaxMediaItems({
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		})
	);

	softCharLimit = $derived.by(() => {
		if (this.mode === 'global' && this.selectedIds.length > 0) {
			return computeSoftCharLimitAcrossSelected({
				selectedIds: this.selectedIds,
				baseSocialChannelsVm: this.baseSocialChannelsVm
			});
		}
		return maxCharactersForChannel(this.focusedChannelVm);
	});
	minimumCharacters = $derived(this.providerConfig.minimumCharacters);
	postComment = $derived(this.providerConfig.postComment);

	/**
	 * Unique provider identifiers for AI Writer constraints / UI strip.
	 * Custom mode → focused channel; Global Edit → selected channels (deduped).
	 */
	writerConstraintProviderIdentifiers = $derived.by((): string[] => {
		if (this.mode === 'custom') {
			const id = (this.focusedProviderIdentifier ?? '').trim();
			return id ? [id] : [];
		}
		const seen = new Set<string>();
		const out: string[] = [];
		for (const integrationId of this.selectedIds) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === integrationId);
			const ident = (ch?.identifier ?? '').trim();
			if (!ident) continue;
			const key = ident.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(ident);
		}
		return out;
	});

	/** Plain text for character counting (always normal strip — ignores rich-editor HTML tags). */
	charCountText = $derived(stripComposerBodyForEditor('normal', this.editorBody));
	previewText = $derived(
		stripComposerBodyForEditor(this.composerEditorMode, this.editorBody)
	);
	usesWeightedCharCount = $derived.by(() => {
		if ((this.focusedProviderIdentifier ?? '').toLowerCase() === 'x') return true;
		return (
			this.mode === 'global' &&
			this.selectedIds.length > 0 &&
			selectedIdsIncludeXChannel(this.selectedIds, this.baseSocialChannelsVm)
		);
	});
	charCount = $derived.by(() => {
		if (this.usesWeightedCharCount) {
			return xWeightedLength(this.charCountText);
		}
		return this.charCountText.length;
	});
	previewMediaItems = $derived.by((): PostMediaViewModel[] => {
		const hasPreviewChannel =
			(this.mode === 'custom' && this.focusedIntegrationId) ||
			(this.mode === 'global' && this.selectedIds.length === 1);
		return hasPreviewChannel ? this.postMediaItemsVm : this.globalMediaItems;
	});
	previewMediaUrls = $derived(
		this.scheduledPostsPresenter.toPostMediaPreviewUrlsVm(this.previewMediaItems)
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
			globalMediaItems: this.globalMediaItems,
			mediaByIntegrationId: this.mediaByIntegrationId,
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

	/** Injected composer AI Writer feature presenter (session + draft UI state). */
	get composerWriterPresenter(): WriterPresenter {
		return this.writerPresenter;
	}

	/** Injected composer AI Summarizer feature presenter (session + summary UI state). */
	get composerSummarizerPresenter(): SummarizerPresenter {
		return this.summarizerPresenter;
	}

	/** Injected composer Humanize feature presenter (session + rewrite UI state). */
	get composerHumanizePresenter(): HumanizePresenter {
		return this.humanizePresenter;
	}

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
				this.loadEditorMedia();
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

	composerHistoryKey(): string {
		return this.mode === 'custom' && this.focusedIntegrationId
			? this.focusedIntegrationId
			: 'global';
	}

	getComposerTextHistory(): ComposerTextHistory {
		const key = this.composerHistoryKey();
		let history = this.composerTextHistoryByKey.get(key);
		if (!history) {
			history = createComposerTextHistory();
			const text = this.editorBody;
			history.clear({
				text,
				selectionStart: text.length,
				selectionEnd: text.length
			});
			this.composerTextHistoryByKey.set(key, history);
		}
		return history;
	}

	private clearComposerTextHistories(): void {
		this.composerTextHistoryByKey.clear();
	}

	recordComposerTextMutation(before: ComposerTextSnapshot, after: ComposerTextSnapshot): void {
		this.getComposerTextHistory().recordMutation(before, after);
	}

	persistEditorBody(): void {
		const normalized = composerBodyForEditorMode(this.composerEditorMode, this.editorBody);
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.bodiesByIntegrationId = {
				...this.bodiesByIntegrationId,
				[this.focusedIntegrationId]: normalized
			};
			return;
		}
		this.globalBody = normalized;
	}

	loadEditorBody(): void {
		const raw =
			this.mode === 'custom' && this.focusedIntegrationId
				? (this.bodiesByIntegrationId[this.focusedIntegrationId] ?? this.globalBody)
				: this.globalBody;
		this.editorBody = composerBodyForEditorMode(this.composerEditorMode, raw);
	}

	persistEditorMedia(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.mediaByIntegrationId = {
				...this.mediaByIntegrationId,
				[this.focusedIntegrationId]: [...this.postMediaItemsVm]
			};
			return;
		}
		this.globalMediaItems = [...this.postMediaItemsVm];
	}

	loadEditorMedia(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.postMediaItemsVm = [
				...(this.mediaByIntegrationId[this.focusedIntegrationId] ?? this.globalMediaItems)
			];
			return;
		}
		this.postMediaItemsVm = [...this.globalMediaItems];
	}

	enterCustomMode(integrationId: string): void {
		if (this.contentSetAuthoringActive) {
			toast.message('Per-channel editing is disabled while you define a reusable set.');
			return;
		}
		this.persistEditorBody();
		this.persistEditorMedia();
		this.mode = 'custom';
		this.focusedIntegrationId = integrationId;
		this.editorLocked = !this.customEditingUnlocked;
		this.settingsOpen = false;
		this.loadEditorBody();
		this.loadEditorMedia();
	}

	backToGlobalMode(): void {
		this.persistEditorBody();
		this.persistEditorMedia();
		this.bodiesByIntegrationId = clearPerChannelBodies();
		this.mediaByIntegrationId = clearPerChannelMedia();
		this.mode = 'global';
		this.focusedIntegrationId = null;
		this.editorLocked = false;
		this.customEditingUnlocked = false;
		this.settingsOpen = false;
		this.loadEditorBody();
		this.loadEditorMedia();
	}

	requestCustomize(integrationId: string): void {
		this.enterCustomMode(integrationId);
	}

	focusIntegration(id: string): void {
		if (this.mode !== 'custom') return;
		if (this.focusedIntegrationId === id) return;
		this.persistEditorBody();
		this.persistEditorMedia();
		this.focusedIntegrationId = id;
		this.settingsOpen = false;
		this.loadEditorBody();
		this.loadEditorMedia();
	}

	updateFocusedProviderSettings(next: Record<string, unknown>): void {
		if (this.mode !== 'custom' || !this.focusedIntegrationId) return;
		this.updateProviderSettingsForIntegration(this.focusedIntegrationId, next);
	}

	/** Patch provider settings for a specific integration (global or custom mode). */
	updateProviderSettingsForIntegration(
		integrationId: string,
		patch: Record<string, unknown>
	): void {
		const id = (integrationId ?? '').trim();
		if (!id) return;
		const current = this.providerSettingsByIntegrationId[id] ?? {};
		const merged = mergeProviderSettingsPatch(current, patch);
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
				toast.message(
					'Add at least one supported channel (Threads, X, Instagram, LinkedIn, or Facebook) to use follow-up comments.'
				);
				return false;
			}
			this.sharedFollowUpRepliesVm = [
				...this.sharedFollowUpRepliesVm,
				{ id: crypto.randomUUID(), message: '', delaySeconds: 0 }
			];
			return true;
		}

		const targets = this.listThreadFollowUpSupportedIntegrationIds();
		if (targets.length === 0) {
			if (this.mode === 'custom') {
				toast.message(
					'Follow-up comments are supported on Threads, X, Instagram, LinkedIn, and Facebook.'
				);
			} else {
				toast.message(
					'Select at least one supported channel (Threads, X, Instagram, LinkedIn, or Facebook) to add follow-up comments.'
				);
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
		this.sharedFollowUpRepliesVm = next;
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

	getThreadFollowUpRepliesForEditor(): ThreadFollowUpReply[] {
		const pid = this.getPrimaryThreadFollowUpIntegrationId();
		if (!pid) return [];
		return threadFollowUpRepliesRawForIntegration({
			integrationId: pid,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		});
	}

	applyThreadFollowUpReplies(next: ThreadFollowUpReply[]): void {
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
				this.tagsVm = [...this.tagsVm.filter((x) => x.id !== createTagPmResult.tag.id), createTagPmResult.tag];
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
				this.tagsVm = this.tagsVm.filter((x) => x.id !== tag.id);
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
		this.persistEditorMedia();
		const workspaceId = this.workspaceIdForSession;
		if (!workspaceId) {
			toast.error('Select a workspace.');
			return false;
		}
		const content = validateComposerContent({
			editorBody: this.editorBody,
			postMediaItems: this.postMediaItemsVm,
			minimumCharacters: this.minimumCharacters,
			softCharLimit: this.softCharLimit,
			charCount: this.charCount
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
				this.lastPostsUsageRowDelta = this.draftUsageRowDeltaForResult(
					persistDraftPmResult.postIds.length
				);
				if (this.editingPostGroup) {
					this.editingGroupStatusBeforeSave = 'draft';
				}
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
		return this.persistScheduledPost({
			scheduledLocal: this.scheduledLocal,
			successMessage: this.editingPostGroup ? 'Post updated.' : 'Post scheduled.'
		});
	}

	async publishNowPost(): Promise<boolean> {
		const nowLocal = isoToDatetimeLocalValue(new Date().toISOString());
		const ok = await this.persistScheduledPost({
			scheduledLocal: nowLocal,
			successMessage: this.editingPostGroup ? 'Post queued to publish now.' : 'Publishing now.'
		});
		if (ok) {
			this.scheduledLocal = nowLocal;
		}
		return ok;
	}

	private async persistScheduledPost(opts: {
		scheduledLocal: string;
		successMessage: string;
	}): Promise<boolean> {
		this.persistEditorBody();
		this.persistEditorMedia();
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
		const asyncValidationError = await computeScheduleValidationErrorAsync({
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			globalMediaItems: this.globalMediaItems,
			mediaByIntegrationId: this.mediaByIntegrationId,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		});
		if (asyncValidationError) {
			toast.warning(asyncValidationError);
			return false;
		}
		const content = validateComposerContent({
			editorBody: this.editorBody,
			postMediaItems: this.postMediaItemsVm,
			minimumCharacters: this.minimumCharacters,
			softCharLimit: this.softCharLimit,
			charCount: this.charCount
		});
		if (!content.ok) {
			toast.error(content.error);
			return false;
		}
		this.busy = true;
		try {
			const payload = buildPostUpsertPayload(
				this.buildPersistInput(workspaceId, 'scheduled', opts.scheduledLocal)
			);
			const schedulePostPmResult = this.editingPostGroup
				? await this.postsRepository.updatePostGroup(this.editingPostGroup, payload)
				: await this.postsRepository.createPost(payload);
			if (schedulePostPmResult.ok) {
				this.lastPostsUsageRowDelta = this.scheduledUsageRowDeltaForResult(
					schedulePostPmResult.postIds.length
				);
				if (this.editingPostGroup) {
					this.editingGroupStatusBeforeSave = 'scheduled';
				}
				toast.success(opts.successMessage);
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
		this.persistEditorMedia();
		let providerCopy = cloneProviderSettingsByIntegrationId(this.providerSettingsByIntegrationId);
		if (this.contentSetAuthoringActive) {
			providerCopy = syncSharedFollowUpsToProviderSettingsForSetAuthoring({
				base: providerCopy,
				sharedFollowUpReplies: this.sharedFollowUpRepliesVm,
				selectedIds: this.selectedIds,
				baseSocialChannelsVm: this.baseSocialChannelsVm
			});
		}
		const shared =
			this.contentSetAuthoringActive && this.sharedFollowUpRepliesVm.length > 0
				? (JSON.parse(JSON.stringify(this.sharedFollowUpRepliesVm)) as SetSharedFollowUpReplyViewModel[])
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
			globalMediaItems: [...this.globalMediaItems],
			...(Object.keys(this.mediaByIntegrationId).length > 0
				? { mediaByIntegrationId: { ...this.mediaByIntegrationId } }
				: {}),
			postMediaItems: [...this.globalMediaItems],
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
		this.persistEditorMedia();
		const plain = stripHtmlToPlainText(this.editorBody);
		const hasText = plain.length > 0;
		const hasMedia = this.globalMediaItems.length > 0;
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
			toast.success('Template saved.');
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
			globalMediaItems: this.globalMediaItems,
			mediaByIntegrationId: this.mediaByIntegrationId,
			postMediaItems: this.postMediaItemsVm,
			selectedIds: this.selectedIds,
			scheduledLocal: this.scheduledLocal,
			repeatInterval: this.repeatInterval,
			selectedTagNames: this.selectedTagNames,
			contentSetAuthoringActive: this.contentSetAuthoringActive,
			sharedFollowUpReplies: this.sharedFollowUpRepliesVm
		};
	}

	private buildPersistInput(
		workspaceId: string,
		status: BuildPostUpsertPayloadInput['status'],
		scheduledLocal = this.scheduledLocal
	): BuildPostUpsertPayloadInput {
		return {
			workspaceId,
			mode: this.mode,
			globalBody: this.globalBody,
			bodiesByIntegrationId: this.bodiesByIntegrationId,
			focusedIntegrationId: this.focusedIntegrationId,
			editorBody: this.editorBody,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId,
			globalMediaItems: this.globalMediaItems,
			mediaByIntegrationId: this.mediaByIntegrationId,
			postMediaItems: this.postMediaItemsVm,
			selectedIds: this.selectedIds,
			scheduledLocal,
			repeatInterval: this.repeatInterval,
			selectedTagNames: this.selectedTagNames,
			status
		};
	}

	/** Rows that newly count toward `posts_per_month` after a successful schedule. */
	private scheduledUsageRowDeltaForResult(scheduledRowCount: number): number {
		if (scheduledRowCount < 1) return 0;
		if (!this.editingPostGroup) return scheduledRowCount;
		if (this.editingGroupStatusBeforeSave === 'draft') return scheduledRowCount;
		return 0;
	}

	/** Rows freed from the monthly cap when a scheduled group is saved as draft. */
	private draftUsageRowDeltaForResult(rowCount: number): number {
		if (rowCount < 1) return 0;
		if (!this.editingPostGroup) return 0;
		if (this.editingGroupStatusBeforeSave === 'scheduled') return -rowCount;
		return 0;
	}

	consumeLastPostsUsageRowDelta(): number {
		const delta = this.lastPostsUsageRowDelta;
		this.lastPostsUsageRowDelta = 0;
		return delta;
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
		this.editingGroupStatusBeforeSave = null;
		this.lastPostsUsageRowDelta = 0;
		this.contentSetAuthoringActive = false;
		this.editingSetId = null;
		this.editingSetName = '';

		this.globalBody = '';
		this.bodiesByIntegrationId = {};
		this.editorBody = '';
		this.globalMediaItems = [];
		this.mediaByIntegrationId = {};
		this.postMediaItemsVm = [];
		this.providerSettingsByIntegrationId = {};
		this.sharedFollowUpRepliesVm = [];

		this.selectedIds = [];
		this.selectedGroupId = null;
		this.repeatInterval = null;
		this.selectedTagNames = [];
		this.initialSnapshot = '';
		this.clearComposerTextHistories();
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
		this.clearComposerTextHistories();
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
		this.providerSettingsByIntegrationId = migrateProviderSettingsByIntegrationIdOnLoad(
			cloneProviderSettingsByIntegrationId(snapshot.providerSettingsByIntegrationId)
		);

		if (this.contentSetAuthoringActive) {
			const sfr = snapshot.sharedFollowUpReplies;
			if (Array.isArray(sfr) && sfr.length > 0) {
				this.sharedFollowUpRepliesVm = JSON.parse(JSON.stringify(sfr)) as SetSharedFollowUpReplyViewModel[];
			} else {
				this.sharedFollowUpRepliesVm = legacySharedRepliesFromProviderSnapshot({
					snapshot,
					okIntegrationIds: okIds,
					baseSocialChannelsVm: this.baseSocialChannelsVm
				});
			}
		} else {
			this.sharedFollowUpRepliesVm = [];
		}
		this.globalMediaItems = Array.isArray(snapshot.globalMediaItems)
			? [...snapshot.globalMediaItems]
			: Array.isArray(snapshot.postMediaItems)
				? [...snapshot.postMediaItems]
				: [];
		this.mediaByIntegrationId = snapshot.mediaByIntegrationId
			? Object.fromEntries(
					Object.entries(snapshot.mediaByIntegrationId).map(([id, items]) => [id, [...items]])
				)
			: {};
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
		this.loadEditorMedia();
	}

	private async loadInitial(workspaceId: string, preselectScheduledAtIso?: string | null): Promise<void> {
		this.busy = true;
		this.clearComposerTextHistories();
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
			this.globalMediaItems = [];
			this.mediaByIntegrationId = {};
			this.postMediaItemsVm = [];
		} finally {
			this.busy = false;
		}
	}

	private async loadExisting(workspaceId: string, postGroup: string): Promise<void> {
		this.busy = true;
		this.clearComposerTextHistories();
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
			this.editingGroupStatusBeforeSave = g.status ?? null;
			this.lastLoadedEditKey = editKey;
			this.repeatInterval = g.repeatInterval ?? null;
			this.selectedTagNames = Array.isArray(g.tagNames) ? g.tagNames : [];
			this.globalMediaItems = Array.isArray(g.media) ? g.media : [];
			this.mediaByIntegrationId = g.mediaByIntegrationId
				? Object.fromEntries(
						Object.entries(g.mediaByIntegrationId).map(([id, items]) => [id, [...items]])
					)
				: {};
			this.scheduledLocal = isoToDatetimeLocalValue(g.publishDateIso);

			const allowed = new Set(this.baseSocialChannelsVm.map((c) => c.id));
			this.selectedIds = (g.integrationIds ?? []).filter((id) => allowed.has(id));

			this.globalBody = g.body ?? '';
			this.bodiesByIntegrationId = g.bodiesByIntegrationId ?? {};
			this.providerSettingsByIntegrationId = migrateProviderSettingsByIntegrationIdOnLoad(
				g.providerSettingsByIntegrationId && typeof g.providerSettingsByIntegrationId === 'object'
					? { ...g.providerSettingsByIntegrationId }
					: {}
			);

			if (g.isGlobal) {
				this.mode = 'global';
				this.focusedIntegrationId = null;
				this.editorLocked = false;
				this.customEditingUnlocked = false;
				this.loadEditorBody();
				this.loadEditorMedia();
				return;
			}

			this.mode = 'custom';
			this.focusedIntegrationId = this.selectedIds[0] ?? null;
			this.editorLocked = true;
			this.customEditingUnlocked = false;
			this.settingsOpen = false;
			this.loadEditorBody();
			this.loadEditorMedia();
		} finally {
			this.busy = false;
		}
	}

	private async ensureTagListLoaded(workspaceId: string): Promise<void> {
		const now = Date.now();
		const freshForMs = 30_000;
		if (this.tagsVmCache?.workspaceId === workspaceId && now - this.tagsVmCache.loadedAtMs < freshForMs) {
			return;
		}
		const tags = await this.postsRepository.listTags(workspaceId);
		if (tags.ok) {
			this.tagsVm = tags.tags;
			this.tagsVmCache = { workspaceId, loadedAtMs: now };
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

		this.recordComposerTextMutation(
			{ text: '', selectionStart: 0, selectionEnd: 0 },
			{ text: content, selectionStart: content.length, selectionEnd: content.length }
		);
		this.globalBody = content;
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.bodiesByIntegrationId = { ...this.bodiesByIntegrationId, [this.focusedIntegrationId]: content };
		}
		this.editorBody = content;
	}
}
