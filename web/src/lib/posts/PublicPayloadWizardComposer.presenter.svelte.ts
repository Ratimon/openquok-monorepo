import type { CreateSocialPostChannelViewModel } from '$lib/channels';
import type { CreateSocialPostMode } from '$lib/posts/createSocialPost.types';
import type { ThreadFollowUpReply } from '$lib/posts/createSocialPost.types';
import type {
	BackgroundPanelViewModel,
	DesignTemplateProgrammerModel,
	ExportCanvasToMediaFn,
	StockPhotoViewModel
} from '$lib/canvas';
import type {
	CreatePostProgrammerModel,
	PostMediaProgrammerModel,
	PostTagViewModel,
	RepeatIntervalKey
} from '$lib/posts/Post.repository.svelte';

import { HumanizePresenter } from '$lib/ai-humanize/Humanize.presenter.svelte';
import { SummarizerPresenter } from '$lib/ai-summarizer';
import { WriterPresenter } from '$lib/ai-writer';
import {
	buildPayloadWizardMockChannels,
	defaultPayloadWizardGuestSelectedIntegrationIds,
	PAYLOAD_WIZARD_PREVIEW_WORKSPACE_ID,
	payloadWizardMockIntegrationId
} from '$lib/posts/utils/buildPayloadWizardMockChannels';
import { defaultPayloadWizardScheduledLocal } from '$lib/posts/utils/defaultPayloadWizardScheduledLocal';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
import {
	applyThreadFollowUpRepliesToSettings,
	buildProgrammaticCreatePostPayloadPreview,
	clearPerChannelBodies,
	clearPerChannelMedia,
	computeLaunchMaxMediaItems,
	getPrimaryThreadFollowUpIntegrationId,
	isChannelSchedulable,
	listThreadFollowUpSupportedIntegrationIds,
	mergeProviderSettingsPatch,
	resolvePayloadPreviewValidationIntegrationIds,
	threadFollowUpRepliesRawForIntegration,
	unschedulableReason
} from '$lib/posts/utils/create-post';
import {
	composerBodyForEditorMode,
	computeSoftCharLimitAcrossSelected,
	maxCharactersForChannel,
	postMediaPreviewUrls,
	revokeLocalMediaPreviewUrls,
	selectedIdsIncludeXChannel,
	stripComposerBodyForEditor,
	xWeightedLength
} from '$lib/posts/utils/composer';
import { toast } from '$lib/ui/sonner';

const EMPTY_BACKGROUND_PANEL: BackgroundPanelViewModel = {
	fetchPolotnoUnsplashPagePm: async () => ({ items: [], page: 1, totalPages: 1 }),
	triggerPolotnoUnsplashDownloadPm: () => {}
};

const EMPTY_EXPORT_CANVAS: ExportCanvasToMediaFn = async () => ({
	ok: false,
	error: 'The Photo Editor saves to a workspace. Sign in to continue.'
});

export type PublicPayloadWizardComposerInit = {
	focusedProviderIdentifier?: string | null;
	composerMode?: CreateSocialPostMode;
};

/**
 * Local-only composer for the public Payload Wizard. Mock channels, live JSON preview,
 * and clipboard copy — no posts repository and no cloud uploads.
 */
export class PublicPayloadWizardComposerPresenter {
	readonly writerPresenter = new WriterPresenter();
	readonly summarizerPresenter = new SummarizerPresenter();
	readonly humanizePresenter = new HumanizePresenter();

	readonly stockPhotosVm: readonly StockPhotoViewModel[] = [];
	readonly designTemplatesVm: readonly DesignTemplateProgrammerModel[] = [];
	readonly backgroundPanelVm = EMPTY_BACKGROUND_PANEL;
	readonly exportCanvasToMedia = EMPTY_EXPORT_CANVAS;
	readonly tagsVm: PostTagViewModel[] = [];

	baseSocialChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);

	mode = $state<CreateSocialPostMode>('global');
	focusedIntegrationId = $state<string | null>(null);
	editorLocked = $state(false);
	customEditingUnlocked = $state(false);
	settingsOpen = $state(false);
	providerSettingsByIntegrationId = $state<Record<string, Record<string, unknown>>>({});

	globalBody = $state('');
	bodiesByIntegrationId = $state<Record<string, string>>({});
	editorBody = $state('');
	globalMediaItems = $state<PostMediaProgrammerModel[]>([]);
	mediaByIntegrationId = $state<Record<string, PostMediaProgrammerModel[]>>({});

	selectedIds = $state<string[]>([]);
	selectedGroupId = $state<string | null>(null);
	scheduledLocal = $state(defaultPayloadWizardScheduledLocal());
	repeatInterval = $state<RepeatIntervalKey | null>(null);
	selectedTagNames = $state<string[]>([]);
	postMediaItemsVm = $state<PostMediaProgrammerModel[]>([]);
	busy = $state(false);

	constructor(init?: PublicPayloadWizardComposerInit) {
		const channels = buildPayloadWizardMockChannels();
		this.baseSocialChannelsVm = channels;
		this.selectedIds = defaultPayloadWizardGuestSelectedIntegrationIds(channels);
		this.applyPageChannel(init);
	}

	/** Preselect + focus the matching mock on platform API pages; Global Edit otherwise. */
	applyPageChannel(init?: PublicPayloadWizardComposerInit): void {
		const mode = init?.composerMode ?? 'global';
		const identifier = (init?.focusedProviderIdentifier ?? '').trim().toLowerCase();

		if (mode !== 'custom' || !identifier) {
			if (this.mode === 'custom') {
				this.backToGlobalMode();
			}
			return;
		}

		const match = this.baseSocialChannelsVm.find(
			(channel) => channel.identifier.toLowerCase() === identifier
		);
		if (!match) return;
		if (this.mode === 'custom' && this.focusedIntegrationId === match.id) return;
		this.enterCustomMode(match.id);
	}

	fetchPolotnoTemplateListPage = async () => ({ items: [], page: 1, totalPages: 1 });

	loadSignaturesVmForComposer = async () => ({ ok: true as const, items: [] });

	focusedProviderIdentifier = $derived.by(() => {
		if (this.mode !== 'custom' || !this.focusedIntegrationId) return null;
		return (
			this.baseSocialChannelsVm.find((channel) => channel.id === this.focusedIntegrationId)
				?.identifier ?? null
		);
	});

	focusedChannelVm = $derived.by(() => {
		if (!this.focusedIntegrationId) return null;
		return this.baseSocialChannelsVm.find((channel) => channel.id === this.focusedIntegrationId) ?? null;
	});

	composerEditorMode = $derived.by(() => {
		if (this.mode === 'global') return 'normal' as const;
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

	writerConstraintProviderIdentifiers = $derived.by((): string[] => {
		if (this.mode === 'custom') {
			const id = (this.focusedProviderIdentifier ?? '').trim();
			return id ? [id] : [];
		}
		const out: string[] = [];
		for (const integrationId of this.selectedIds) {
			const channel = this.baseSocialChannelsVm.find((item) => item.id === integrationId);
			const ident = (channel?.identifier ?? '').trim();
			if (!ident) continue;
			const key = ident.toLowerCase();
			if (out.some((existing) => existing.toLowerCase() === key)) continue;
			out.push(ident);
		}
		return out;
	});

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

	previewMediaUrls = $derived(postMediaPreviewUrls(this.postMediaItemsVm));

	/** Custom mode previews one network at a time — do not fail on other selected targets. */
	payloadPreviewTargetIntegrationIds = $derived.by((): string[] =>
		resolvePayloadPreviewValidationIntegrationIds({
			mode: this.mode,
			focusedIntegrationId: this.focusedIntegrationId,
			selectedIds: this.selectedIds
		})
	);

	wizardPayloadResult = $derived(this.getProgrammaticCreatePostPayloadPreview('scheduled'));
	wizardPayload = $derived(this.wizardPayloadResult.ok ? this.wizardPayloadResult.payload : null);

	teardown(): void {
		revokeLocalMediaPreviewUrls(this.postMediaItemsVm);
		revokeLocalMediaPreviewUrls(this.globalMediaItems);
		for (const items of Object.values(this.mediaByIntegrationId)) {
			revokeLocalMediaPreviewUrls(items);
		}
	}

	getProgrammaticCreatePostPayloadPreview(
		status: CreatePostProgrammerModel['status']
	):
		| { ok: true; payload: Omit<CreatePostProgrammerModel, 'organizationId'> }
		| { ok: false; error: string } {
		return buildProgrammaticCreatePostPayloadPreview(
			{
				workspaceId: PAYLOAD_WIZARD_PREVIEW_WORKSPACE_ID,
				mode: this.mode,
				globalBody: this.globalBody,
				bodiesByIntegrationId: this.bodiesByIntegrationId,
				focusedIntegrationId: this.focusedIntegrationId,
				editorBody: this.editorBody,
				providerSettingsByIntegrationId: this.providerSettingsByIntegrationId,
				globalMediaItems: this.globalMediaItems,
				mediaByIntegrationId: this.mediaByIntegrationId,
				postMediaItems: this.postMediaItemsVm,
				selectedIds: this.payloadPreviewTargetIntegrationIds,
				scheduledLocal: this.scheduledLocal,
				repeatInterval: this.repeatInterval,
				selectedTagNames: this.selectedTagNames,
				status,
				scheduleValidationIntegrationIds: this.payloadPreviewTargetIntegrationIds,
				baseSocialChannelsVm: this.baseSocialChannelsVm,
				minimumCharacters: this.minimumCharacters,
				softCharLimit: this.softCharLimit
			},
			status
		);
	}

	async copyProgrammaticPayload(status: 'draft' | 'scheduled'): Promise<void> {
		this.persistEditorBody();
		this.persistEditorMedia();
		const res = this.getProgrammaticCreatePostPayloadPreview(status);
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		try {
			await navigator.clipboard.writeText(JSON.stringify(res.payload, null, 2));
			toast.success(status === 'draft' ? 'Draft payload copied.' : 'Scheduled payload copied.');
		} catch {
			toast.error('Could not copy to clipboard.');
		}
	}

	toggleChannel(id: string): void {
		if (this.selectedIds.includes(id)) {
			this.selectedIds = this.selectedIds.filter((item) => item !== id);
			if (this.mode === 'custom' && this.focusedIntegrationId === id) {
				this.focusedIntegrationId = this.selectedIds.length ? this.selectedIds[0]! : null;
				this.editorLocked = true;
				this.loadEditorBody();
				this.loadEditorMedia();
			}
			return;
		}
		const channel = this.baseSocialChannelsVm.find((item) => item.id === id);
		if (!isChannelSchedulable(channel)) {
			toast.error(unschedulableReason(channel) ?? 'Reconnect this channel first.');
			return;
		}
		this.selectedIds = [...this.selectedIds, id];
	}

	removeSelected(id: string): void {
		this.selectedIds = this.selectedIds.filter((item) => item !== id);
		if (this.mode === 'custom' && this.focusedIntegrationId === id) {
			this.focusedIntegrationId = this.selectedIds.length ? this.selectedIds[0]! : null;
			this.loadEditorBody();
			this.loadEditorMedia();
		}
	}

	selectGroup(groupId: string | null): void {
		this.selectedGroupId = groupId;
	}

	persistEditorBody(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.bodiesByIntegrationId = {
				...this.bodiesByIntegrationId,
				[this.focusedIntegrationId]: this.editorBody
			};
			return;
		}
		this.globalBody = this.editorBody;
	}

	loadEditorBody(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.editorBody = composerBodyForEditorMode(
				this.composerEditorMode,
				this.bodiesByIntegrationId[this.focusedIntegrationId] ?? this.globalBody
			);
			return;
		}
		this.editorBody = composerBodyForEditorMode(this.composerEditorMode, this.globalBody);
	}

	persistEditorMedia(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.mediaByIntegrationId = {
				...this.mediaByIntegrationId,
				[this.focusedIntegrationId]: this.postMediaItemsVm
			};
			return;
		}
		this.globalMediaItems = this.postMediaItemsVm;
	}

	loadEditorMedia(): void {
		if (this.mode === 'custom' && this.focusedIntegrationId) {
			this.postMediaItemsVm = this.mediaByIntegrationId[this.focusedIntegrationId] ?? this.globalMediaItems;
			return;
		}
		this.postMediaItemsVm = this.globalMediaItems;
	}

	enterCustomMode(integrationId: string): void {
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

	updateProviderSettingsForIntegration(integrationId: string, patch: Record<string, unknown>): void {
		const id = (integrationId ?? '').trim();
		if (!id) return;
		const current = this.providerSettingsByIntegrationId[id] ?? {};
		this.providerSettingsByIntegrationId = {
			...this.providerSettingsByIntegrationId,
			[id]: mergeProviderSettingsPatch(current, patch)
		};
	}

	listThreadFollowUpSupportedIntegrationIds(): string[] {
		return listThreadFollowUpSupportedIntegrationIds({
			mode: this.mode,
			contentSetAuthoringActive: false,
			focusedIntegrationId: this.focusedIntegrationId,
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		});
	}

	getPrimaryThreadFollowUpIntegrationId(): string | null {
		return getPrimaryThreadFollowUpIntegrationId({
			contentSetAuthoringActive: false,
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
		const targets = this.listThreadFollowUpSupportedIntegrationIds();
		if (targets.length === 0) {
			toast.message(
				'Select at least one supported channel (Threads, X, Instagram, LinkedIn, Facebook, or Bluesky) to add follow-up comments.'
			);
			return;
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
		toast.success('Comment editor added below — you can edit it there.');
	}

	toggleTag(name: string): void {
		if (!name.trim()) return;
	}

	addNewTag(name?: string): void {
		if (!name?.trim()) return;
	}

	deleteWorkspaceTag(): void {}
}
