import type { ChatStatus } from '$lib/ui/components/ai-elements/prompt-input';
import type { WriterAvailability } from '$lib/ai-writer/utils/getWriterAvailability';
import type { WriterSession } from '$lib/ai-writer/utils/createComposerWriter';
import type {
	ComposerWriterConstraintProvider,
	ComposerWriterCreateCoreOptions,
	ComposerWriterDraftConstraints
} from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';

import { COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS } from '$lib/ai-writer/constants/config';
import { acceptWriterSoftOptIn } from '$lib/ai-writer/utils/acceptWriterSoftOptIn';
import {
	buildComposerWriterCreateOptions,
	normalizeWriterProviderIdentifiers,
	toWriterConstraintProviders
} from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';
import { createComposerWriter } from '$lib/ai-writer/utils/createComposerWriter';
import { destroyWriter } from '$lib/ai-writer/utils/destroyWriter';
import { getWriterAvailability } from '$lib/ai-writer/utils/getWriterAvailability';
import { hasWriterSoftOptIn } from '$lib/ai-writer/utils/hasWriterSoftOptIn';
import { isWriterSupported } from '$lib/ai-writer/utils/isWriterSupported';
import { writeDraftStreaming } from '$lib/ai-writer/utils/writeDraftStreaming';

export type WriterUiPhase = 'opt-in' | 'resolving' | 'unsupported' | 'ready';

export type WriterChatRole = 'user' | 'assistant';

/** One turn rendered in the AI Writer conversation panel. */
export type WriterChatMessageViewModel = {
	id: string;
	role: WriterChatRole;
	content: string;
};

export type WriterRunWriteOptions = {
	existingBody?: string;
};

/**
 * Feature presenter for the composer AI Writer modal: soft opt-in, on-device
 * Writer session lifecycle, streaming drafts, and soft-char-limit awareness.
 */
export class WriterPresenter {
	phase = $state<WriterUiPhase>('resolving');
	availability = $state<WriterAvailability | null>(null);
	downloadPercent = $state<number | null>(null);
	chatStatus = $state<ChatStatus>('ready');
	/** App-owned turn list (Writer API itself is single-shot; we supply prior draft as context). */
	messagesVm = $state<WriterChatMessageViewModel[]>([]);
	lastPrompt = $state('');
	draftText = $state('');
	errorMessage = $state<string | null>(null);
	promptText = $state('');
	/** One-shot error for the modal to toast; cleared via {@link clearPendingToastError}. */
	pendingToastError = $state<string | null>(null);

	/** Soft character limit mirrored from the composer (for UI + create options). */
	maxCharacters = $state(COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS);
	providerIdentifier = $state<string | null>(null);
	providerIdentifiers = $state<string[]>([]);
	constraintProvidersVm = $state<ComposerWriterConstraintProvider[]>([]);
	composerMode = $state<'global' | 'custom'>('global');

	private writerSession: WriterSession | null = null;
	private abortController: AbortController | null = null;
	private sessionGeneration = 0;
	private createCore: ComposerWriterCreateCoreOptions = buildComposerWriterCreateOptions();
	private messageSeq = 0;

	isBusy = $derived(this.chatStatus === 'submitted' || this.chatStatus === 'streaming');
	canInsert = $derived(this.draftText.trim().length > 0 && !this.isBusy);
	showEmptyState = $derived(
		this.messagesVm.length === 0 && !this.isBusy && !this.errorMessage
	);
	showDownloadBanner = $derived(
		this.downloadPercent != null &&
			this.downloadPercent < 100 &&
			(this.availability === 'downloadable' ||
				this.availability === 'downloading' ||
				this.chatStatus === 'submitted')
	);
	draftLength = $derived(this.draftText.length);
	isOverLimit = $derived(this.draftLength > this.maxCharacters);

	/** Updates create-time constraints; call before {@link onOpen} / session create. */
	setDraftConstraints(constraints: ComposerWriterDraftConstraints): void {
		const max = Number.isFinite(constraints.maxCharacters)
			? Math.max(1, Math.floor(constraints.maxCharacters))
			: COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS;
		const ids = normalizeWriterProviderIdentifiers(
			constraints.providerIdentifiers?.length
				? constraints.providerIdentifiers
				: constraints.providerIdentifier
					? [constraints.providerIdentifier]
					: []
		);
		this.maxCharacters = max;
		this.providerIdentifiers = ids;
		this.providerIdentifier = ids[0] ?? null;
		this.constraintProvidersVm = toWriterConstraintProviders(ids);
		this.composerMode = constraints.composerMode ?? 'global';
		this.createCore = buildComposerWriterCreateOptions({
			maxCharacters: max,
			providerIdentifiers: ids,
			providerIdentifier: this.providerIdentifier,
			composerMode: this.composerMode
		});
	}

	/**
	 * Drops a platform from Writer sharedContext. Invalidates the on-device session
	 * so the next write recreates with updated constraints.
	 */
	removeConstraintProvider(identifier: string): void {
		const key = identifier.trim().toLowerCase();
		if (!key) return;
		const next = this.providerIdentifiers.filter((id) => id.toLowerCase() !== key);
		if (next.length === this.providerIdentifiers.length) return;
		this.setDraftConstraints({
			maxCharacters: this.maxCharacters,
			providerIdentifiers: next,
			composerMode: this.composerMode
		});
		destroyWriter(this.writerSession);
		this.writerSession = null;
	}

	async onOpen(): Promise<void> {
		if (!hasWriterSoftOptIn()) {
			this.phase = 'opt-in';
			return;
		}
		await this.startWriterSession();
	}

	async acceptOptIn(): Promise<void> {
		acceptWriterSoftOptIn();
		await this.startWriterSession();
	}

	resetUi(): void {
		this.phase = 'resolving';
		this.availability = null;
		this.downloadPercent = null;
		this.chatStatus = 'ready';
		this.messagesVm = [];
		this.lastPrompt = '';
		this.draftText = '';
		this.errorMessage = null;
		this.promptText = '';
		this.pendingToastError = null;
		this.providerIdentifiers = [];
		this.providerIdentifier = null;
		this.constraintProvidersVm = [];
		this.messageSeq = 0;
	}

	clearPendingToastError(): void {
		this.pendingToastError = null;
	}

	teardown(): void {
		this.sessionGeneration += 1;
		this.abortController?.abort();
		this.abortController = null;
		destroyWriter(this.writerSession);
		this.writerSession = null;
	}

	stopGeneration(): void {
		this.abortController?.abort();
		this.abortController = new AbortController();
		if (this.chatStatus === 'submitted' || this.chatStatus === 'streaming') {
			this.chatStatus = 'ready';
		}
	}

	async runWrite(prompt: string, options: WriterRunWriteOptions = {}): Promise<void> {
		const trimmed = prompt.trim();
		if (!trimmed || this.isBusy) return;

		const previousDraft = this.draftText.trim();
		this.lastPrompt = trimmed;
		this.draftText = '';
		this.errorMessage = null;
		this.promptText = '';
		this.chatStatus = 'submitted';

		const userMsg: WriterChatMessageViewModel = {
			id: this.nextMessageId('user'),
			role: 'user',
			content: trimmed
		};
		const assistantMsg: WriterChatMessageViewModel = {
			id: this.nextMessageId('assistant'),
			role: 'assistant',
			content: ''
		};
		this.messagesVm = [...this.messagesVm, userMsg, assistantMsg];
		const assistantId = assistantMsg.id;

		const bodyContext = options.existingBody?.trim() || '';
		const revisionContext = previousDraft
			? `Previous draft to revise or build on:\n${previousDraft}`
			: '';
		const context = [revisionContext, bodyContext].filter(Boolean).join('\n\n') || undefined;
		const gen = this.sessionGeneration;

		try {
			const writer = await this.ensureWriter();
			if (gen !== this.sessionGeneration) return;

			this.chatStatus = 'streaming';
			let assembled = '';
			for await (const chunk of writeDraftStreaming(writer, trimmed, {
				context,
				signal: this.abortController?.signal
			})) {
				if (gen !== this.sessionGeneration) return;
				assembled += chunk;
				this.draftText = assembled;
				this.patchAssistantMessage(assistantId, assembled);
			}
			if (gen !== this.sessionGeneration) return;
			this.chatStatus = 'ready';
		} catch (err) {
			if (gen !== this.sessionGeneration) return;
			const aborted =
				(err instanceof DOMException && err.name === 'AbortError') ||
				(err instanceof Error && err.name === 'AbortError');
			if (aborted) {
				this.chatStatus = 'ready';
				return;
			}
			this.chatStatus = 'error';
			const message =
				err instanceof Error && err.message
					? err.message
					: 'Could not generate a draft. Try again.';
			this.errorMessage = message;
			this.pendingToastError = message;
			this.patchAssistantMessage(assistantId, message);
		}
	}

	private nextMessageId(role: WriterChatRole): string {
		this.messageSeq += 1;
		return `${role}-${this.messageSeq}`;
	}

	private patchAssistantMessage(id: string, content: string): void {
		this.messagesVm = this.messagesVm.map((m) => (m.id === id ? { ...m, content } : m));
	}

	private async startWriterSession(): Promise<void> {
		const gen = ++this.sessionGeneration;
		this.phase = 'resolving';
		this.availability = null;
		this.downloadPercent = null;
		this.errorMessage = null;
		this.abortController = new AbortController();

		if (!isWriterSupported()) {
			if (gen !== this.sessionGeneration) return;
			this.phase = 'unsupported';
			this.availability = 'unavailable';
			return;
		}

		const nextAvailability = await getWriterAvailability(this.createCore);
		if (gen !== this.sessionGeneration) return;
		this.availability = nextAvailability;

		if (nextAvailability === 'unavailable') {
			this.phase = 'unsupported';
			return;
		}

		this.phase = 'ready';

		if (nextAvailability === 'downloadable' || nextAvailability === 'downloading') {
			void this.ensureWriter().catch((err) => {
				if (gen !== this.sessionGeneration) return;
				const aborted =
					(err instanceof DOMException && err.name === 'AbortError') ||
					(err instanceof Error && err.name === 'AbortError');
				if (aborted) return;
				this.downloadPercent = null;
				this.pendingToastError =
					err instanceof Error && err.message
						? err.message
						: 'Could not download the on-device Writer model.';
			});
		}
	}

	private async ensureWriter(): Promise<WriterSession> {
		if (this.writerSession) return this.writerSession;
		const signal = this.abortController?.signal;
		const created = await createComposerWriter({
			signal,
			createOptions: this.createCore,
			onDownloadProgress: (loaded) => {
				this.downloadPercent = Math.round(loaded * 100);
			}
		});
		this.writerSession = created;
		this.downloadPercent = 100;
		this.availability = 'available';
		return created;
	}
}
