import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type {
	BackgroundPanelViewModel,
	DesignTemplateViewModel,
	ExportCanvasToMediaArgs,
	ExportDesignToMediaResult,
	GenerateMediaModalPresenter
} from '$lib/canvas';
import type { GetScheduledPostsPresenter } from '$lib/posts/GetScheduledPost.presenter.svelte';
import type {
	PostMediaViewModel,
	PostTagViewModel,
	PostsRepository,
	RepeatIntervalKey
} from '$lib/posts/Post.repository.svelte';
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

function isPlainSettingsObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Merge a partial provider-settings update into what we already have per integration.
 * Top-level buckets (`threads`, `instagram`, a future `tiktok`, …) are shallow-merged so UI that
 * only emits one subsection does not wipe siblings (e.g. `threads.replies` from the composer).
 * Non-objects (and arrays) are replaced wholesale by `next`, matching normal `{ ...current, ...next }`.
 */
function mergeProviderSettingsPatch(
	current: Record<string, unknown>,
	next: Record<string, unknown>
): Record<string, unknown> {
	const merged: Record<string, unknown> = { ...current };
	for (const key of Object.keys(next)) {
		const n = next[key];
		const c = current[key];
		if (isPlainSettingsObject(c) && isPlainSettingsObject(n)) {
			merged[key] = { ...c, ...n };
		} else {
			merged[key] = n;
		}
	}
	return merged;
}

type Mode = 'global' | 'custom';

export type CreateSocialPostPrepareOpenOptions = {
	preselectIntegrationId: string | null;
	preselectGroupId?: string | null;
	/** Optional UTC ISO-ish schedule time to seed the composer with (calendar cell click). */
	preselectScheduledAtIso?: string | null;
	/**
	 * Calendar page: multi-select targeted channels (may span multiple groups or include ungrouped).
	 * When it resolves to a single workspace group, `selectedGroupId` will be set automatically.
	 */
	preselectIntegrationIds?: string[] | null;
	/** When true, immediately focus the first selected channel for per-channel editing. */
	autoCustomizeFirstSelected?: boolean;
	/** Restore a saved workspace “set” (channels + composer fields) after load. */
	setSnapshot?: SetSnapshotViewModel | null;
	/** Settings: define a reusable preset; optional `editingSetId` / `editingSetName` for update. */
	contentSetAuthoring?: { editingSetId?: string | null; editingSetName?: string | null } | null;
};

/** User-visible prefix for provider validation toasts and inline copy (network + account name). */
function formatProviderScheduleValidationMessage(
	ch: CreateSocialPostChannelViewModel,
	raw: string
): string {
	const id = (ch.identifier ?? '').toLowerCase();
	const label = (ch.name ?? '').trim() || 'Channel';
	if (id.startsWith('instagram')) {
		return `Instagram (${label}): ${raw}`;
	}
	if (id === 'threads') {
		return `Threads (${label}): ${raw}`;
	}
	return `${label}: ${raw}`;
}

export function isChannelSchedulable(ch: CreateSocialPostChannelViewModel | null | undefined): boolean {
	if (!ch) return false;
	// Prefer the precomputed view-model flag (keeps UI logic consistent across components).
	if (typeof (ch as any).schedulable === 'boolean') return (ch as any).schedulable as boolean;
	return !ch.disabled && !ch.inBetweenSteps && !ch.refreshNeeded;
}

export function unschedulableReason(ch: CreateSocialPostChannelViewModel | null | undefined): string | null {
	if (!ch) return 'Channel not found.';
	if (typeof (ch as any).unschedulableReason === 'string' || (ch as any).unschedulableReason === null) {
		return ((ch as any).unschedulableReason ?? null) as string | null;
	}
	if (ch.disabled) return 'This channel is disabled.';
	if (ch.inBetweenSteps) return 'Finish connecting this channel first.';
	if (ch.refreshNeeded) return 'Reconnect this channel first.';
	return null;
}

/**
 * Shared composer state for the create-post dialog: scheduling UI, repository calls,
 * and optional single-channel preselection (e.g. integration menu → create post).
 */
export class CreateSocialPostPresenter {
	/** Assigned in constructor — `$derived` fields otherwise see TDZ vs parameter timing (Svelte class analysis). */
	private readonly scheduledPostsPresenter!: GetScheduledPostsPresenter;

	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly mediaModalPresenter: GenerateMediaModalPresenter,
		private readonly getSignaturesPresenter: GetSignaturesPresenter,
		scheduledPostsPresenter: GetScheduledPostsPresenter,
		private readonly upsertSetPresenter: UpsertSetPresenter
	) {
		this.scheduledPostsPresenter = scheduledPostsPresenter;
	}

	private signaturesCache: { organizationId: string; items: SignatureViewModel[]; loadedAtMs: number } | null = null;
	private readonly signaturesCacheTtlMs = 30_000;

	/** Composer toolbar: fetch signatures without mutating settings presenter state. */
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
		// Only auto-add on a fresh composer; never overwrite existing content.
		if (this.globalBody.trim().length > 0) return;
		if (Object.keys(this.bodiesByIntegrationId ?? {}).length > 0) return;

		const res = await this.loadSignaturesVmForComposer(workspaceId);
		if (!res.ok) return;
		const sig = res.items.find((s) => s.isDefault);
		const content = (sig?.content ?? '').trim();
		if (!content) return;

		this.globalBody = content;
		// Keep the visible editor in sync with current mode.
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.bodiesByIntegrationId = { ...this.bodiesByIntegrationId, [this.focusedIntegrationId]: content };
		}
		this.editorBody = content;
	}

	/** Stock rows for the design-media dialog (from the injected media modal presenter). */
	get stockPhotosVm() {
		return this.mediaModalPresenter.stockPhotosVm;
	}

	/** Built-in Konva templates for the design dialog templates panel. */
	get designTemplatesVm(): readonly DesignTemplateViewModel[] {
		return this.mediaModalPresenter.designTemplatesVm;
	}

	get backgroundPanelVm(): BackgroundPanelViewModel {
		return this.mediaModalPresenter.backgroundPanelVm;
	}

	fetchPolotnoTemplateListPage(
		params: { query: string; page: number },
		signal?: AbortSignal
	) {
		return this.mediaModalPresenter.fetchPolotnoTemplateListPagePm(params, signal);
	}

	exportCanvasToMedia(args: ExportCanvasToMediaArgs): Promise<ExportDesignToMediaResult> {
		return this.mediaModalPresenter.exportCanvasToMedia(args);
	}

	/** Set before opening the modal; consumed on the next {@link onModalOpen}. */
	private pendingPreselectIntegrationId: string | null = null;
	private pendingPreselectGroupId: string | null = null;
	private pendingPreselectScheduledAtIso: string | null = null;
	private pendingPreselectIntegrationIds: string[] | null = null;
	private pendingAutoCustomizeFirstSelected = false;
	private pendingEditPostGroup: string | null = null;
	private pendingDuplicatePostGroup: string | null = null;
	private pendingSetSnapshot: SetSnapshotViewModel | null = null;
	private pendingContentSetAuthoring: { editingSetId?: string | null; editingSetName?: string | null } | null =
		null;
	private lastLoadedEditKey: string | null = null;
	private tagListCache: { workspaceId: string; loadedAtMs: number } | null = null;

	workspaceIdForSession = $state<string | null>(null);
	connectedChannelsForSessionVm = $state<CreateSocialPostChannelViewModel[]>([]);

	editingPostGroup = $state<string | null>(null);

	mode = $state<Mode>('global');
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
	/** True while defining a reusable channel+preset bundle from workspace settings. */
	contentSetAuthoringActive = $state(false);
	editingSetId = $state<string | null>(null);
	/** Pre-filled in Save set dialog when editing an existing preset. */
	editingSetName = $state<string>('');
	/**
	 * Global” follow-up list while authoring a set: one chain for all selected
	 * Threads/Instagram channels, fanned out into `providerSettings` on save.
	 */
	sharedFollowUpReplies = $state<SetSharedFollowUpReplyViewModel[]>([]);

	baseSocialChannelsVm = $derived(
		this.connectedChannelsForSessionVm.filter(
			(c) => (c.type ?? '').toLowerCase() === 'social'
		)
	);

	focusedProviderIdentifier = $derived.by(() => {
		if (this.mode !== 'custom' || !this.focusedIntegrationId) return null;
		return this.baseSocialChannelsVm.find((c) => c.id === this.focusedIntegrationId)?.identifier ?? null;
	});

	providerConfig = $derived(getLaunchProviderConfig(this.focusedProviderIdentifier));

	/**
	 * For providers with `comments: 'no-media'` (e.g. Instagram), allow only one attachment in the composer.
	 */
	launchCommentsMode = $derived.by((): LaunchProviderCommentsMode => {
		let out: LaunchProviderCommentsMode = true;
		for (const id of this.selectedIds) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
			if (!ch) continue;
			const cfg = getLaunchProviderConfig(ch.identifier);
			if (typeof cfg.comments === 'undefined') continue;
			if (cfg.comments === 'no-media') {
				out = 'no-media';
			}
		}
		return out;
	});

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

	scheduleValidationError = $derived.by((): string | null => {
		if (!this.selectedIds.length) return null;
		for (const id of this.selectedIds) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
			if (!ch) continue;
			const cfg = getLaunchProviderConfig(ch.identifier);
			if (!cfg.checkValidity) continue;
			const res = cfg.checkValidity({
				media: this.postMediaItems,
				settings: this.providerSettingsByIntegrationId[id] ?? {}
			});
			if (typeof res === 'string' && res.trim().length > 0) {
				return formatProviderScheduleValidationMessage(ch, res);
			}
		}
		return null;
	});

	/**
	 * Do not disable "Add to calendar" when `scheduleValidationError` is set; otherwise the user
	 */
	canSchedule = $derived(!this.busy && this.selectedIds.length > 0);

	dirty = $derived.by(() => {
		if (this.initialSnapshot === '') return false;
		const snap = JSON.stringify({
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
			...(this.contentSetAuthoringActive ? { sharedFollowUpReplies: this.sharedFollowUpReplies } : {})
		});
		return snap !== this.initialSnapshot;
	});

	prepareOpen(options: CreateSocialPostPrepareOpenOptions): void {
		this.pendingEditPostGroup = null;
		this.pendingDuplicatePostGroup = null;
		this.pendingPreselectIntegrationId = options.preselectIntegrationId;
		this.pendingPreselectGroupId = options.preselectGroupId ?? null;
		this.pendingPreselectScheduledAtIso = options.preselectScheduledAtIso ?? null;
		this.pendingPreselectIntegrationIds = options.preselectIntegrationIds ?? null;
		this.pendingAutoCustomizeFirstSelected = options.autoCustomizeFirstSelected ?? false;
		this.pendingSetSnapshot = options.setSnapshot ?? null;
		this.pendingContentSetAuthoring = options.contentSetAuthoring ?? null;
	}

	prepareEdit(postGroup: string): void {
		this.pendingPreselectIntegrationId = null;
		this.pendingPreselectGroupId = null;
		this.pendingPreselectScheduledAtIso = null;
		this.pendingPreselectIntegrationIds = null;
		this.pendingAutoCustomizeFirstSelected = false;
		this.pendingSetSnapshot = null;
		this.pendingContentSetAuthoring = null;
		this.pendingEditPostGroup = postGroup;
		this.pendingDuplicatePostGroup = null;
	}

	prepareDuplicate(postGroup: string): void {
		this.pendingPreselectIntegrationId = null;
		this.pendingPreselectGroupId = null;
		this.pendingPreselectScheduledAtIso = null;
		this.pendingPreselectIntegrationIds = null;
		this.pendingAutoCustomizeFirstSelected = false;
		this.pendingSetSnapshot = null;
		this.pendingContentSetAuthoring = null;
		this.pendingEditPostGroup = null;
		this.pendingDuplicatePostGroup = postGroup;
	}

	/** Open the composer to author or edit a reusable workspace set (consumers bind modal `open`). */
	prepareContentSetAuthoring(opts: {
		editingSetId?: string | null;
		editingSetName?: string | null;
		snapshot?: SetSnapshotViewModel | null;
	}): void {
		this.pendingEditPostGroup = null;
		this.pendingDuplicatePostGroup = null;
		this.pendingPreselectIntegrationId = null;
		this.pendingPreselectGroupId = null;
		this.pendingPreselectScheduledAtIso = null;
		this.pendingPreselectIntegrationIds = null;
		this.pendingAutoCustomizeFirstSelected = false;
		this.pendingSetSnapshot = opts.snapshot ?? null;
		this.pendingContentSetAuthoring = {
			editingSetId: opts.editingSetId ?? null,
			editingSetName: opts.editingSetName ?? null
		};
	}

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

	/**
	 * Upstream parity: "Add post in a thread" / "Add comment" adds another text item for the focused provider.
	 * Set authoring: one shared list for all Threads/Instagram targets.
	 */
	addThreadReplyForFocused(): boolean {
		if (this.contentSetAuthoringActive) {
			const hasSupport = this.selectedIds.some((id) => {
				const ch = this.baseSocialChannelsVm.find((c) => c.id === id);
				return this._channelSupportsFollowUpComments(ch?.identifier);
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
		const replies = this._threadFollowUpRepliesRawForIntegration(primary);
		const nextReplies = [
			...replies,
			{ id: crypto.randomUUID(), message: '', delaySeconds: 0 }
		];
		this.applyThreadFollowUpReplies(nextReplies);
		return true;
	}

	setSharedFollowUpRepliesForSetAuthoring(next: SetSharedFollowUpReplyViewModel[]): void {
		this.sharedFollowUpReplies = next;
	}

	private _channelSupportsFollowUpComments(identifier: string | null | undefined): boolean {
		const id = (identifier ?? '').toLowerCase();
		return id === 'threads' || id.startsWith('instagram');
	}

	private _followUpBucketForChannel(identifier: string | null | undefined): 'threads' | 'instagram' {
		const id = (identifier ?? '').trim().toLowerCase();
		return id.startsWith('instagram') ? 'instagram' : 'threads';
	}

	/**
	 * Channels that participate in follow-up comments for the current mode/selection.
	 * Global + multi-select: every selected Threads/Instagram channel. Custom: focused channel if it supports follow-ups.
	 */
	listThreadFollowUpSupportedIntegrationIds(): string[] {
		if (this.contentSetAuthoringActive) return [];
		if (this.mode === 'custom') {
			const fid = this.focusedIntegrationId;
			if (!fid) return [];
			const ch = this.baseSocialChannelsVm.find((c) => c.id === fid);
			return this._channelSupportsFollowUpComments(ch?.identifier) ? [fid] : [];
		}
		return this.selectedIds.filter((sid) => {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === sid);
			return this._channelSupportsFollowUpComments(ch?.identifier);
		});
	}

	/**
	 * Which integration’s bucket we read for the follow-up editor. Prefer a channel that already has non-empty replies
	 * (edit + multi-target), else the first Threads/Instagram in the selection.
	 */
	getPrimaryThreadFollowUpIntegrationId(): string | null {
		if (this.contentSetAuthoringActive) {
			return (
				this.selectedIds.find((sid) => {
					const ch = this.baseSocialChannelsVm.find((c) => c.id === sid);
					const id = (ch?.identifier ?? '').trim().toLowerCase();
					return id === 'threads' || id.startsWith('instagram');
				}) ?? null
			);
		}
		const supporters = this.listThreadFollowUpSupportedIntegrationIds();
		if (supporters.length === 0) return null;
		for (const sid of supporters) {
			const raw = this._threadFollowUpRepliesRawForIntegration(sid);
			if (raw.some((r) => (r.message ?? '').trim().length > 0)) return sid;
		}
		return supporters[0] ?? null;
	}

	private _threadFollowUpRepliesRawForIntegration(integrationId: string): {
		id: string;
		message: string;
		delaySeconds: number;
	}[] {
		const ch = this.baseSocialChannelsVm.find((c) => c.id === integrationId);
		const bucket = this._followUpBucketForChannel(ch?.identifier);
		const settings = this.providerSettingsByIntegrationId[integrationId] ?? {};
		const block = (settings as Record<string, unknown>)[bucket];
		const rep = (block as { replies?: unknown } | undefined)?.replies;
		if (!Array.isArray(rep)) return [];
		return rep as { id: string; message: string; delaySeconds: number }[];
	}

	/** Follow-up list for the composer (non–set-authoring). */
	getThreadFollowUpRepliesForEditor(): { id: string; message: string; delaySeconds: number }[] {
		const pid = this.getPrimaryThreadFollowUpIntegrationId();
		if (!pid) return [];
		return this._threadFollowUpRepliesRawForIntegration(pid);
	}

	/** Writes the same follow-up program to every selected Threads/Instagram channel (global multi-select). */
	applyThreadFollowUpReplies(next: { id: string; message: string; delaySeconds: number }[]): void {
		const targets = this.listThreadFollowUpSupportedIntegrationIds();
		if (targets.length === 0) return;
		const merged: Record<string, Record<string, unknown>> = { ...this.providerSettingsByIntegrationId };
		for (const intId of targets) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === intId);
			const bucket = this._followUpBucketForChannel(ch?.identifier);
			const current = merged[intId] ?? {};
			const prevRaw = (current as Record<string, unknown>)[bucket];
			const bucketObj: Record<string, unknown> =
				prevRaw && typeof prevRaw === 'object' && !Array.isArray(prevRaw)
					? { ...(prevRaw as Record<string, unknown>) }
					: bucket === 'threads'
						? { enabled: false, message: "That's a wrap!" }
						: {};
			merged[intId] = {
				...current,
				[bucket]: {
					...bucketObj,
					replies: next
				}
			};
		}
		this.providerSettingsByIntegrationId = merged;
	}

	private _legacySharedRepliesFromProviderSnapshot(
		snapshot: SetSnapshotViewModel,
		okIds: string[]
	): SetSharedFollowUpReplyViewModel[] {
		for (const intId of okIds) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === intId);
			if (!this._channelSupportsFollowUpComments(ch?.identifier)) continue;
			const ident = (ch?.identifier ?? '').toLowerCase();
			const bucket: 'threads' | 'instagram' = ident.startsWith('instagram') ? 'instagram' : 'threads';
			const ps = snapshot.providerSettingsByIntegrationId?.[intId];
			if (!ps) continue;
			const sub = ps[bucket] as Record<string, unknown> | undefined;
			const rep = sub?.replies;
			if (!Array.isArray(rep) || rep.length === 0) continue;
			return rep.map((r: unknown) => {
				const x = r as Record<string, unknown>;
				const id =
					typeof x.id === 'string' && x.id.length > 0 ? x.id : crypto.randomUUID();
				return {
					id,
					message: typeof x.message === 'string' ? x.message : '',
					delaySeconds: Number.isFinite(Number(x.delaySeconds))
						? Math.max(0, Math.floor(Number(x.delaySeconds)))
						: 0
				};
			});
		}
		return [];
	}

	/** While authoring a set, mirror `sharedFollowUpReplies` into every selected Threads/IG bucket (or clear replies). */
	private _syncSharedFollowUpsToProviderSettingsForSetAuthoring(
		base: Record<string, Record<string, unknown>>
	): Record<string, Record<string, unknown>> {
		const shared = this.sharedFollowUpReplies;
		const serial =
			shared.length > 0
				? (JSON.parse(JSON.stringify(shared)) as SetSharedFollowUpReplyViewModel[])
				: [];
		const out: Record<string, Record<string, unknown>> = JSON.parse(JSON.stringify(base));
		for (const intId of this.selectedIds) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === intId);
			if (!this._channelSupportsFollowUpComments(ch?.identifier)) continue;
			const ident = (ch?.identifier ?? '').toLowerCase();
			const bucket: 'threads' | 'instagram' = ident.startsWith('instagram') ? 'instagram' : 'threads';
			const cur =
				out[intId] && typeof out[intId] === 'object' && !Array.isArray(out[intId])
					? { ...(out[intId] as Record<string, unknown>) }
					: {};
			const prevB =
				cur[bucket] && typeof cur[bucket] === 'object' && !Array.isArray(cur[bucket])
					? { ...(cur[bucket] as Record<string, unknown>) }
					: bucket === 'threads'
						? { enabled: false, message: "That's a wrap!" }
						: {};
			out[intId] = { ...cur, [bucket]: { ...prevB, replies: serial } };
		}
		return out;
	}

	/**
	 * Handler for the "+ Add comment or post" button.
	 *
	 * - **Define reusable set:** append to the shared follow-up list when any Threads/Instagram channel is selected.
	 * - **Else:** one focused channel only (custom mode or a single selected id); replies live in that integration’s settings.
	 */
	handleAddThreadItemClick(): void {
		const ok = this.addThreadReplyForFocused();
		if (ok) {
			toast.success('Comment editor added below — you can edit it there.');
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

	async onModalOpen(workspaceId: string, connectedChannels: CreateSocialPostChannelViewModel[]): Promise<void> {
		const preselect = this.pendingPreselectIntegrationId;
		this.pendingPreselectIntegrationId = null;
		const preselectGroupId = this.pendingPreselectGroupId;
		this.pendingPreselectGroupId = null;
		const preselectScheduledAtIso = this.pendingPreselectScheduledAtIso;
		this.pendingPreselectScheduledAtIso = null;
		const preselectIntegrationIds = this.pendingPreselectIntegrationIds;
		this.pendingPreselectIntegrationIds = null;
		const autoCustomize = this.pendingAutoCustomizeFirstSelected;
		this.pendingAutoCustomizeFirstSelected = false;
		const editPostGroup = this.pendingEditPostGroup;
		this.pendingEditPostGroup = null;
		const duplicatePostGroup = this.pendingDuplicatePostGroup;
		this.pendingDuplicatePostGroup = null;
		const pendingSnapshot = this.pendingSetSnapshot;
		this.pendingSetSnapshot = null;
		const pendingAuthoring = this.pendingContentSetAuthoring;
		this.pendingContentSetAuthoring = null;

		this.workspaceIdForSession = workspaceId;
		this.connectedChannelsForSessionVm = connectedChannels;

		this.resetForm();
		if (duplicatePostGroup) {
			await this.loadExisting(workspaceId, duplicatePostGroup);

			// Ensure saving creates a new group (not overwriting the original).
			this.editingPostGroup = null;
			this.lastLoadedEditKey = null;

			const slot = await this.postsRepository.findSlot(workspaceId);
			if (slot.ok) {
				this.scheduledLocal = isoToDatetimeLocalValue(slot.dateIso);
			}

			this.captureInitialSnapshot();
			return;
		}
		if (editPostGroup) {
			await this.loadExisting(workspaceId, editPostGroup);
			this.captureInitialSnapshot();
			return;
		}
		await this.loadInitial(workspaceId, preselectScheduledAtIso);

		if (pendingAuthoring) {
			this.contentSetAuthoringActive = true;
			this.editingSetId = pendingAuthoring.editingSetId ?? null;
			this.editingSetName = (pendingAuthoring.editingSetName ?? '').trim();
		} else {
			this.contentSetAuthoringActive = false;
			this.editingSetId = null;
			this.editingSetName = '';
		}

		if (pendingSnapshot) {
			this.applySetSnapshot(pendingSnapshot);
			this.captureInitialSnapshot();
			return;
		}

		if (!this.contentSetAuthoringActive) {
			await this.maybeAutoAddDefaultSignature(workspaceId);
		}

		if (preselectGroupId) {
			this.selectGroup(preselectGroupId);
		}

		if (Array.isArray(preselectIntegrationIds) && preselectIntegrationIds.length > 0 && !preselectGroupId) {
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

			// If all targeted channels belong to exactly one group, reflect that in the group selector UI.
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

		if (
			preselect &&
			(!preselectIntegrationIds || preselectIntegrationIds.length === 0) &&
			!preselectGroupId &&
			this.baseSocialChannelsVm.some((c) => c.id === preselect)
		) {
			const ch = this.baseSocialChannelsVm.find((c) => c.id === preselect);
			if (isChannelSchedulable(ch)) {
				this.selectedIds = [preselect];
			} else {
				toast.error(unschedulableReason(ch) ?? 'Reconnect this channel first.');
			}
		}

		if (autoCustomize && this.selectedIds.length > 0 && !this.contentSetAuthoringActive) {
			this.enterCustomMode(this.selectedIds[0]!);
		}

		this.captureInitialSnapshot();
	}

	private async ensureTagListLoaded(workspaceId: string): Promise<void> {
		const now = Date.now();
		// Tags rarely change; avoid refetching on rapid reopen/HMR.
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

	/** Loads workspace tags into {@link tagList} (shared with composer; same cache as modal open). */
	async loadWorkspaceTagsIfNeeded(workspaceId: string): Promise<void> {
		await this.ensureTagListLoaded(workspaceId);
	}

	onModalClose(): void {
		this.confirmCloseOpen = false;
		this.pendingPreselectIntegrationId = null;
		this.pendingPreselectGroupId = null;
		this.pendingPreselectScheduledAtIso = null;
		this.pendingPreselectIntegrationIds = null;
		this.pendingAutoCustomizeFirstSelected = false;
		this.pendingEditPostGroup = null;
		this.pendingSetSnapshot = null;
		this.pendingContentSetAuthoring = null;
	}

	private captureInitialSnapshot(): void {
		this.initialSnapshot = JSON.stringify({
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
			...(this.contentSetAuthoringActive ? { sharedFollowUpReplies: this.sharedFollowUpReplies } : {})
		});
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
					// treat server timestamp as UTC then convert to local.
					this.scheduledLocal = utcIsoToDatetimeLocalValue(slot.dateIso);
				} else {
					// Fallback: "now + 5 minutes" in local time.
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

			// Custom mode: focus first selected integration.
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

	/** @returns whether the caller should set the dialog `open` prop to false */
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

	async saveAsDraft(): Promise<boolean> {
		this.persistEditorBody();
		const workspaceId = this.workspaceIdForSession;
		if (!workspaceId) {
			toast.error('Select a workspace.');
			return false;
		}
		const plain = stripHtmlToPlainText(this.editorBody);
		const hasText = plain.length > 0;
		const hasMedia = this.postMediaItems.length > 0;
		if (!hasText && !hasMedia) {
			toast.error('Write something or attach at least one image.');
			return false;
		}
		if (hasText && plain.length < this.minimumCharacters) {
			toast.error(`Please add at least ${this.minimumCharacters} characters.`);
			return false;
		}
		if (plain.length > this.softCharLimit) {
			toast.error(`Too long for this mode (${plain.length}/${this.softCharLimit}).`);
			return false;
		}
		this.busy = true;
		try {
			const overrides = this.mode === 'custom' ? this.bodiesByIntegrationId : undefined;
			const payload = {
				organizationId: workspaceId,
				body: this.globalBody,
				...(overrides ? { bodiesByIntegrationId: overrides } : {}),
				...(Object.keys(this.providerSettingsByIntegrationId ?? {}).length
					? { providerSettingsByIntegrationId: this.providerSettingsByIntegrationId }
					: {}),
				...(this.postMediaItems.length ? { media: this.postMediaItems } : {}),
				integrationIds: this.selectedIds,
				isGlobal: this.mode === 'global',
				scheduledAt: datetimeLocalToIso(this.scheduledLocal),
				repeatInterval: this.repeatInterval,
				tagNames: this.selectedTagNames,
				status: 'draft' as const
			};
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
		try {
			this.providerSettingsByIntegrationId = JSON.parse(
				JSON.stringify(snapshot.providerSettingsByIntegrationId ?? {})
			) as Record<string, Record<string, unknown>>;
		} catch {
			this.providerSettingsByIntegrationId = {};
		}

		if (this.contentSetAuthoringActive) {
			const sfr = snapshot.sharedFollowUpReplies;
			if (Array.isArray(sfr) && sfr.length > 0) {
				this.sharedFollowUpReplies = JSON.parse(JSON.stringify(sfr)) as SetSharedFollowUpReplyViewModel[];
			} else {
				this.sharedFollowUpReplies = this._legacySharedRepliesFromProviderSnapshot(snapshot, okIds);
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
					: okIds[0] ?? null;
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

	buildSetSnapshot(): SetSnapshotViewModel {
		this.persistEditorBody();
		let providerCopy: Record<string, Record<string, unknown>> = {};
		try {
			providerCopy = JSON.parse(JSON.stringify(this.providerSettingsByIntegrationId ?? {})) as Record<
				string,
				Record<string, unknown>
			>;
		} catch {
			providerCopy = {};
		}
		if (this.contentSetAuthoringActive) {
			providerCopy = this._syncSharedFollowUpsToProviderSettingsForSetAuthoring(providerCopy);
		}
		const shared =
			this.contentSetAuthoringActive && this.sharedFollowUpReplies.length > 0
				? JSON.parse(JSON.stringify(this.sharedFollowUpReplies)) as SetSharedFollowUpReplyViewModel[]
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
		const plain = stripHtmlToPlainText(this.editorBody);
		const hasText = plain.length > 0;
		const hasMedia = this.postMediaItems.length > 0;
		if (!hasText && !hasMedia) {
			toast.error('Write something or attach at least one image.');
			return false;
		}
		if (hasText && plain.length < this.minimumCharacters) {
			toast.error(`Please add at least ${this.minimumCharacters} characters.`);
			return false;
		}
		if (plain.length > this.softCharLimit) {
			toast.error(`Too long for this mode (${plain.length}/${this.softCharLimit}).`);
			return false;
		}
		this.busy = true;
		try {
			const overrides = this.mode === 'custom' ? this.bodiesByIntegrationId : undefined;
			const payload = {
				organizationId: workspaceId,
				body: this.globalBody,
				...(overrides ? { bodiesByIntegrationId: overrides } : {}),
				...(Object.keys(this.providerSettingsByIntegrationId ?? {}).length
					? { providerSettingsByIntegrationId: this.providerSettingsByIntegrationId }
					: {}),
				...(this.postMediaItems.length ? { media: this.postMediaItems } : {}),
				integrationIds: this.selectedIds,
				isGlobal: this.mode === 'global',
				scheduledAt: datetimeLocalToIso(this.scheduledLocal),
				repeatInterval: this.repeatInterval,
				tagNames: this.selectedTagNames,
				status: 'scheduled' as const
			};
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
				toast.success('Post deleted.');
				return true;
			}
			toast.error(deletePostGroupPmResult.error);
			return false;
		} finally {
			this.busy = false;
		}
	}
}
