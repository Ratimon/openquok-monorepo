import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type {
	DesignTemplateProgrammerModel,
	ExportCanvasToMediaArgs,
	ExportDesignToMediaResult,
	GeneratePictureModalPresenter
} from '$lib/canvas';
import type {
	PostMediaProgrammerModel,
	PostTagProgrammerModel,
	PostsRepository,
	RepeatIntervalKey
} from '$lib/posts/Posts.repository.svelte';

import { mediaItemsToPreviewUrls } from '$lib/posts/Posts.repository.svelte';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
import { datetimeLocalToIso, isoToDatetimeLocalValue } from '$lib/utils/postingSchedulePreferences';
import { stripHtmlToPlainText } from '$lib/utils/stripHtml';
import { toast } from '$lib/ui/sonner';

type Mode = 'global' | 'custom';

export type CreateSocialPostPrepareOpenOptions = {
	preselectIntegrationId: string | null;
};

/**
 * Shared composer state for the create-post dialog: scheduling UI, repository calls,
 * and optional single-channel preselection (e.g. integration menu → create post).
 */
export class CreateSocialPostPresenter {
	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly pictureModalPresenter: GeneratePictureModalPresenter
	) {}

	/** Stock rows for the design-media dialog (from the injected picture modal). */
	get stockPhotosVm() {
		return this.pictureModalPresenter.stockPhotosPm;
	}

	/** Built-in Konva templates for the design dialog templates panel. */
	get designTemplatesVm(): readonly DesignTemplateProgrammerModel[] {
		return this.pictureModalPresenter.designTemplatesPm;
	}

	fetchPolotnoTemplateListPage(
		params: { query: string; page: number },
		signal?: AbortSignal
	) {
		return this.pictureModalPresenter.fetchPolotnoTemplateListPagePm(params, signal);
	}

	exportCanvasToMedia(args: ExportCanvasToMediaArgs): Promise<ExportDesignToMediaResult> {
		return this.pictureModalPresenter.exportCanvasToMedia(args);
	}

	/** Set before opening the modal; consumed on the next {@link onModalOpen}. */
	private pendingPreselectIntegrationId: string | null = null;

	workspaceIdForSession = $state<string | null>(null);
	connectedChannelsForSessionVm = $state<CreateSocialPostChannelViewModel[]>([]);

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
	tagList = $state<PostTagProgrammerModel[]>([]);
	postMediaItems = $state<PostMediaProgrammerModel[]>([]);
	busy = $state(false);
	confirmCloseOpen = $state(false);
	initialSnapshot = $state('');

	baseSocialChannelsVm = $derived(
		this.connectedChannelsForSessionVm.filter(
			(c) => (c.type ?? '').toLowerCase() === 'social' && !c.disabled
		)
	);

	focusedProviderIdentifier = $derived.by(() => {
		if (this.mode !== 'custom' || !this.focusedIntegrationId) return null;
		return this.baseSocialChannelsVm.find((c) => c.id === this.focusedIntegrationId)?.identifier ?? null;
	});

	providerConfig = $derived(getLaunchProviderConfig(this.focusedProviderIdentifier));

	softCharLimit = $derived(this.providerConfig.maximumCharacters);
	minimumCharacters = $derived(this.providerConfig.minimumCharacters);
	postComment = $derived(this.providerConfig.postComment);

	previewText = $derived(stripHtmlToPlainText(this.editorBody));
	charCount = $derived(this.previewText.length);
	previewMediaUrls = $derived(mediaItemsToPreviewUrls(this.postMediaItems));

	primaryLabel = $derived(
		this.selectedIds.length === 0 ? 'Select channels above' : 'Add to calendar'
	);

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
			selectedTagNames: this.selectedTagNames
		});
		return snap !== this.initialSnapshot;
	});

	prepareOpen(options: CreateSocialPostPrepareOpenOptions): void {
		this.pendingPreselectIntegrationId = options.preselectIntegrationId;
	}

	toggleChannel(id: string): void {
		if (this.selectedIds.includes(id)) {
			this.selectedIds = this.selectedIds.filter((x) => x !== id);
			if (this.mode === 'custom' && this.focusedIntegrationId === id) {
				this.focusedIntegrationId = this.selectedIds.length ? this.selectedIds[0] : null;
				this.editorLocked = true;
				this.loadEditorBody();
			}
		} else {
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
		this.providerSettingsByIntegrationId = {
			...this.providerSettingsByIntegrationId,
			[this.focusedIntegrationId]: next
		};
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

		this.workspaceIdForSession = workspaceId;
		this.connectedChannelsForSessionVm = connectedChannels;

		this.resetForm();
		await this.loadInitial(workspaceId);

		if (
			preselect &&
			this.baseSocialChannelsVm.some((c) => c.id === preselect)
		) {
			this.selectedIds = [preselect];
		}

		this.captureInitialSnapshot();
	}

	onModalClose(): void {
		this.confirmCloseOpen = false;
		this.pendingPreselectIntegrationId = null;
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
			selectedTagNames: this.selectedTagNames
		});
	}

	private resetForm(): void {
		this.mode = 'global';
		this.focusedIntegrationId = null;
		this.editorLocked = false;
		this.customEditingUnlocked = false;

		this.globalBody = '';
		this.bodiesByIntegrationId = {};
		this.editorBody = '';
		this.postMediaItems = [];

		this.selectedIds = [];
		this.selectedGroupId = null;
		this.repeatInterval = null;
		this.selectedTagNames = [];
		this.initialSnapshot = '';
	}

	private async loadInitial(workspaceId: string): Promise<void> {
		this.busy = true;
		try {
			const slot = await this.postsRepository.findSlot(workspaceId);
			if (slot.ok) {
				this.scheduledLocal = isoToDatetimeLocalValue(slot.dateIso);
			} else {
				this.scheduledLocal = isoToDatetimeLocalValue(new Date().toISOString());
				toast.error(slot.error);
			}
			const tags = await this.postsRepository.listTags(workspaceId);
			if (tags.ok) {
				this.tagList = tags.tags;
			} else {
				toast.error(tags.error);
			}

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
			const r = await this.postsRepository.createTag(this.workspaceIdForSession, t, c);
			if (r.ok) {
				this.tagList = [...this.tagList.filter((x) => x.id !== r.tag.id), r.tag];
				if (!this.selectedTagNames.includes(r.tag.name)) {
					this.selectedTagNames = [...this.selectedTagNames, r.tag.name];
				}
				toast.success('Tag added.');
			} else {
				toast.error(r.error);
			}
		} finally {
			this.busy = false;
		}
	}

	async deleteWorkspaceTag(tag: PostTagProgrammerModel): Promise<void> {
		if (!this.workspaceIdForSession) return;
		this.busy = true;
		try {
			const r = await this.postsRepository.deleteTag(this.workspaceIdForSession, tag.id);
			if (r.ok) {
				this.tagList = this.tagList.filter((x) => x.id !== tag.id);
				this.selectedTagNames = this.selectedTagNames.filter((n) => n !== tag.name);
				toast.success('Tag deleted.');
			} else {
				toast.error(r.error);
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
			const r = await this.postsRepository.createPost({
				organizationId: workspaceId,
				body: this.globalBody,
				...(overrides ? { bodiesByIntegrationId: overrides } : {}),
				...(this.postMediaItems.length ? { media: this.postMediaItems } : {}),
				integrationIds: this.selectedIds,
				isGlobal: this.mode === 'global',
				scheduledAt: datetimeLocalToIso(this.scheduledLocal),
				repeatInterval: this.repeatInterval,
				tagNames: this.selectedTagNames,
				status: 'draft'
			});
			if (r.ok) {
				toast.success('Draft saved.');
				return true;
			}
			toast.error(r.error);
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
			const r = await this.postsRepository.createPost({
				organizationId: workspaceId,
				body: this.globalBody,
				...(overrides ? { bodiesByIntegrationId: overrides } : {}),
				...(this.postMediaItems.length ? { media: this.postMediaItems } : {}),
				integrationIds: this.selectedIds,
				isGlobal: this.mode === 'global',
				scheduledAt: datetimeLocalToIso(this.scheduledLocal),
				repeatInterval: this.repeatInterval,
				tagNames: this.selectedTagNames,
				status: 'scheduled'
			});
			if (r.ok) {
				toast.success('Post scheduled.');
				return true;
			}
			toast.error(r.error);
			return false;
		} finally {
			this.busy = false;
		}
	}
}
