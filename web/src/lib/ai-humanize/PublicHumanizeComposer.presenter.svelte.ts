import type { CreateSocialPostChannelViewModel } from '$lib/channels';
import type {
	HumanizeComposerMode,
	HumanizeThreadReplyViewModel
} from '$lib/ai-humanize/Humanize.presenter.svelte';
import type {
	BackgroundPanelViewModel,
	DesignTemplateProgrammerModel,
	ExportCanvasToMediaFn,
	StockPhotoViewModel
} from '$lib/canvas';
import type { PostMediaProgrammerModel, PostTagViewModel, RepeatIntervalKey } from '$lib/posts/Post.repository.svelte';

import { HumanizePresenter } from '$lib/ai-humanize/Humanize.presenter.svelte';
import { SummarizerPresenter } from '$lib/ai-summarizer';
import { WriterPresenter } from '$lib/ai-writer';
import {
	buildHumanizeMockChannels,
	humanizeMockChannelId
} from '$lib/ai-humanize/utils/buildHumanizeMockChannels';
import { getLaunchProviderConfig } from '$lib/ui/components/posts/providers';
import {
	clearPerChannelBodies,
	computeLaunchMaxMediaItems,
	isChannelSchedulable,
	mergeProviderSettingsPatch,
	unschedulableReason
} from '$lib/posts/utils/create-post';
import {
	postMediaPreviewUrls,
	revokeLocalMediaPreviewUrls,
	xMaxCharactersForChannel,
	xWeightedLength
} from '$lib/posts/utils/composer';
import { toast } from '$lib/ui/sonner';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

const EMPTY_BACKGROUND_PANEL: BackgroundPanelViewModel = {
	fetchPolotnoUnsplashPagePm: async () => ({ items: [], page: 1, totalPages: 1 }),
	triggerPolotnoUnsplashDownloadPm: () => {}
};

const EMPTY_EXPORT_CANVAS: ExportCanvasToMediaFn = async () => ({
	ok: false,
	error: 'The Photo Editor saves to a workspace. Sign in to continue.'
});

export type PublicHumanizeComposerInit = {
	focusedProviderIdentifier?: string | null;
	composerMode?: HumanizeComposerMode;
};

/**
 * Local-only composer for the public Humanizer tool. Holds body, media, and
 * channel selection — no posts repository and no cloud uploads.
 */
export class PublicHumanizeComposerPresenter {
	readonly writerPresenter = new WriterPresenter();
	readonly summarizerPresenter = new SummarizerPresenter();
	readonly humanizePresenter = new HumanizePresenter();

	readonly stockPhotosVm: readonly StockPhotoViewModel[] = [];
	readonly designTemplatesVm: readonly DesignTemplateProgrammerModel[] = [];
	readonly backgroundPanelVm = EMPTY_BACKGROUND_PANEL;
	readonly exportCanvasToMedia = EMPTY_EXPORT_CANVAS;
	readonly tagsVm: PostTagViewModel[] = [];

	baseSocialChannelsVm = $state<CreateSocialPostChannelViewModel[]>([]);

	mode = $state<HumanizeComposerMode>('global');
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
	postMediaItemsVm = $state<PostMediaProgrammerModel[]>([]);
	busy = $state(false);
	threadRepliesVm = $state<HumanizeThreadReplyViewModel[]>([]);

	constructor(init?: PublicHumanizeComposerInit) {
		const channels = buildHumanizeMockChannels();
		this.baseSocialChannelsVm = channels;
		this.selectedIds = channels.map((channel) => channel.id);
		this.applyPageChannel(init);
	}

	/** Preselect + focus the matching mock on channel SEO pages; Global Edit otherwise. */
	applyPageChannel(init?: PublicHumanizeComposerInit): void {
		const mode = init?.composerMode ?? 'global';
		const identifier = (init?.focusedProviderIdentifier ?? '').trim().toLowerCase();

		if (mode !== 'custom' || !identifier) {
			if (this.mode === 'custom') {
				this.backToGlobalMode();
			}
			return;
		}

		const match = this.baseSocialChannelsVm.find(
			(channel) =>
				channel.identifier.toLowerCase() === identifier ||
				channel.id === humanizeMockChannelId(identifier)
		);
		if (!match) return;
		if (this.mode === 'custom' && this.focusedIntegrationId === match.id) return;
		this.enterCustomMode(match.id);
	}

	fetchPolotnoTemplateListPage = async () => ({ items: [], page: 1, totalPages: 1 });

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

	providerConfig = $derived(getLaunchProviderConfig(this.focusedProviderIdentifier));

	launchMaxMediaItems = $derived.by((): number | null =>
		computeLaunchMaxMediaItems({
			selectedIds: this.selectedIds,
			baseSocialChannelsVm: this.baseSocialChannelsVm,
			providerSettingsByIntegrationId: this.providerSettingsByIntegrationId
		})
	);

	softCharLimit = $derived.by(() => {
		const id = (this.focusedProviderIdentifier ?? '').toLowerCase();
		if (id === 'x') return xMaxCharactersForChannel(this.focusedChannelVm);
		return this.providerConfig.maximumCharacters;
	});

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

	previewText = $derived(stripHtmlToPlainText(this.editorBody));
	charCount = $derived.by(() => {
		if ((this.focusedProviderIdentifier ?? '').toLowerCase() === 'x') {
			return xWeightedLength(this.previewText);
		}
		return this.previewText.length;
	});
	usesWeightedCharCount = $derived((this.focusedProviderIdentifier ?? '').toLowerCase() === 'x');
	weightedCharCount = $derived(this.usesWeightedCharCount ? this.charCount : undefined);

	previewMediaUrls = $derived(postMediaPreviewUrls(this.postMediaItemsVm));

	focusedProviderSettings = $derived.by(() => {
		if (!this.focusedIntegrationId) return {};
		return this.providerSettingsByIntegrationId[this.focusedIntegrationId] ?? {};
	});

	threadProviderIdentifier = $derived.by(() => {
		const integrationId =
			this.mode === 'custom'
				? this.focusedIntegrationId
				: this.selectedIds.length === 1
					? this.selectedIds[0]
					: null;
		if (!integrationId) return null;
		return this.baseSocialChannelsVm.find((channel) => channel.id === integrationId)?.identifier ?? null;
	});

	previewProviderSettings = $derived.by(() => {
		const integrationId =
			this.mode === 'custom'
				? this.focusedIntegrationId
				: this.selectedIds.length === 1
					? this.selectedIds[0]
					: null;
		if (!integrationId) return {};
		return this.providerSettingsByIntegrationId[integrationId] ?? {};
	});

	teardown(): void {
		revokeLocalMediaPreviewUrls(this.postMediaItemsVm);
	}

	toggleChannel(id: string): void {
		if (this.selectedIds.includes(id)) {
			this.selectedIds = this.selectedIds.filter((item) => item !== id);
			if (this.mode === 'custom' && this.focusedIntegrationId === id) {
				this.focusedIntegrationId = this.selectedIds.length ? this.selectedIds[0]! : null;
				this.editorLocked = true;
				this.loadEditorBody();
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
		}
	}

	selectGroup(): void {
		this.selectedGroupId = null;
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
		this.bodiesByIntegrationId = clearPerChannelBodies();
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

	unlockEditor(): void {
		this.customEditingUnlocked = true;
		this.editorLocked = false;
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

	addThreadReply(): void {
		this.threadRepliesVm = [
			...this.threadRepliesVm,
			{ id: crypto.randomUUID(), message: '', delaySeconds: 0 }
		];
	}

	applyThreadReplies(next: HumanizeThreadReplyViewModel[]): void {
		this.threadRepliesVm = next;
	}

	toggleTag(name: string): void {
		if (!name.trim()) return;
	}

	addTag(name?: string): void {
		if (!name?.trim()) return;
	}

	onRepeatChange(value: RepeatIntervalKey | null): void {
		this.repeatInterval = value;
	}

	async copyPostText(): Promise<void> {
		const text = this.previewText.trim();
		if (!text) {
			toast.error('Write something first.');
			return;
		}
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Post text copied.');
		} catch {
			toast.error('Could not copy to clipboard.');
		}
	}

	downloadPostText(): void {
		const text = this.previewText.trim();
		if (!text) {
			toast.error('Write something first.');
			return;
		}
		if (typeof document === 'undefined') return;
		const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
		const href = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = href;
		anchor.download = 'humanizer-post.txt';
		anchor.rel = 'noopener noreferrer';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(href);
		toast.success('Download started.');
	}
}
