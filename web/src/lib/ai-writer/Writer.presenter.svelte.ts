import type { ChatStatus } from '$lib/ui/components/ai-elements/prompt-input';
import type { ComposerRewriterRefineAction } from '$lib/ai-writer/constants/config';
import type {
	ComposerWriterConstraintProvider,
	ComposerWriterCreateCoreOptions,
	ComposerWriterDraftConstraints,
	RewriterAvailability,
	RewriterSession,
	WriterAvailability,
	WriterSession
} from '$lib/ai-writer/utils';

import { COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS } from '$lib/ai-writer/constants/config';
import {
	acceptRewriterSoftOptIn,
	acceptWriterSoftOptIn,
	buildComposerRewriterCreateOptionsFromAction,
	buildComposerWriterCreateOptions,
	createComposerRewriter,
	createComposerWriter,
	destroyAiSession,
	destroyWriter,
	getRewriterAvailability,
	getWriterAvailability,
	hasRewriterSoftOptIn,
	hasWriterSoftOptIn,
	isRewriterSupported,
	isWriterSupported,
	normalizeWriterProviderIdentifiers,
	rewriteDraftStreaming,
	toWriterConstraintProviders,
	writeDraftStreaming
} from '$lib/ai-writer/utils';

export type WriterUiPhase = 'opt-in' | 'resolving' | 'unsupported' | 'ready';

/** Soft gate shown before first Rewriter refine (or when Rewriter is missing after consent). */
export type RewriterUiGate = 'opt-in' | 'unsupported' | null;

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
 * Writer/Rewriter session lifecycle, streaming drafts / refine, and soft-char-limit awareness.
 */
export class WriterPresenter {
	phase = $state<WriterUiPhase>('resolving');
	availability = $state<WriterAvailability | null>(null);
	/** Rewriter model availability (probed on open; does not gate Writer entry). */
	rewriterAvailability = $state<RewriterAvailability | null>(null);
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
	/**
	 * Inline Rewriter consent / unsupported panel while the Writer session stays ready.
	 * Set when the user first requests a refine chip without Rewriter opt-in (or when
	 * Rewriter is missing after consent).
	 */
	rewriterGate = $state<RewriterUiGate>(null);

	private writerSession: WriterSession | null = null;
	private rewriterSession: RewriterSession | null = null;
	/** Cache key `tone:length` for the current Rewriter session. */
	private rewriterSessionKey: string | null = null;
	private abortController: AbortController | null = null;
	private sessionGeneration = 0;
	private createCore: ComposerWriterCreateCoreOptions = buildComposerWriterCreateOptions();
	private messageSeq = 0;
	/** Refine action waiting on Rewriter soft opt-in Continue. */
	private pendingRefineAction: ComposerRewriterRefineAction | null = null;

	isBusy = $derived(this.chatStatus === 'submitted' || this.chatStatus === 'streaming');
	canInsert = $derived(this.draftText.trim().length > 0 && !this.isBusy);
	/**
	 * Rewriter may be used for refine (API present and not confirmed unavailable).
	 * `null` availability (still probing) counts as usable so chips can appear promptly.
	 */
	rewriterUsable = $derived(
		isRewriterSupported() && this.rewriterAvailability !== 'unavailable'
	);
	/**
	 * Show refine chip row after any conversation turn (empty-state topic chips are hidden).
	 * Independent of `canInsert` so the row stays visible while a refine streams.
	 */
	showRefineActions = $derived(this.messagesVm.length > 0);
	/** Tone/length refine chips: Rewriter usable and an insertable draft exists. */
	canRefine = $derived(this.canInsert && this.rewriterUsable);
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
		destroyAiSession(this.rewriterSession);
		this.rewriterSession = null;
		this.rewriterSessionKey = null;
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
		this.rewriterAvailability = null;
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
		this.rewriterGate = null;
		this.pendingRefineAction = null;
	}

	clearPendingToastError(): void {
		this.pendingToastError = null;
	}

	/** Dismiss Rewriter opt-in / unsupported panel; keep the draft conversation. */
	dismissRewriterGate(): void {
		this.rewriterGate = null;
		this.pendingRefineAction = null;
	}

	/**
	 * Entry point for refine chips: soft opt-in first, then unsupported panel if needed,
	 * otherwise stream via {@link runRefine}.
	 */
	async requestRefine(action: ComposerRewriterRefineAction): Promise<void> {
		const input = this.draftText.trim();
		if (!input || this.isBusy) return;

		if (!hasRewriterSoftOptIn()) {
			this.pendingRefineAction = action;
			this.rewriterGate = 'opt-in';
			return;
		}

		await this.refreshRewriterAvailability(this.sessionGeneration);
		if (!isRewriterSupported() || this.rewriterAvailability === 'unavailable') {
			this.pendingRefineAction = null;
			this.rewriterGate = 'unsupported';
			return;
		}

		this.rewriterGate = null;
		await this.runRefine(action);
	}

	async acceptRewriterOptIn(): Promise<void> {
		acceptRewriterSoftOptIn();
		const action = this.pendingRefineAction;
		this.pendingRefineAction = null;
		this.rewriterGate = null;
		if (!action) return;

		await this.refreshRewriterAvailability(this.sessionGeneration);
		if (!isRewriterSupported() || this.rewriterAvailability === 'unavailable') {
			this.rewriterGate = 'unsupported';
			return;
		}
		await this.runRefine(action);
	}

	teardown(): void {
		this.sessionGeneration += 1;
		this.abortController?.abort();
		this.abortController = null;
		destroyWriter(this.writerSession);
		this.writerSession = null;
		destroyAiSession(this.rewriterSession);
		this.rewriterSession = null;
		this.rewriterSessionKey = null;
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

		const assistantId = this.appendTurnPair(trimmed);

		const bodyContext = options.existingBody?.trim() || '';
		const revisionContext = previousDraft
			? `Previous draft to revise or build on:\n${previousDraft}`
			: '';
		const context = [revisionContext, bodyContext].filter(Boolean).join('\n\n') || undefined;
		const gen = this.sessionGeneration;

		try {
			const writer = await this.ensureWriter();
			if (gen !== this.sessionGeneration) return;

			await this.streamAssistant(
				assistantId,
				writeDraftStreaming(writer, trimmed, {
					context,
					signal: this.abortController?.signal
				}),
				gen
			);
		} catch (err) {
			if (gen !== this.sessionGeneration) return;
			this.failAssistant(assistantId, err);
		}
	}

	/**
	 * Relative tone/length refine via Chrome Rewriter. Appends a chip-label user turn
	 * and streams a new draft; history is never cleared mid-session.
	 * Prefer {@link requestRefine} from the UI (handles soft opt-in / unsupported).
	 */
	async runRefine(action: ComposerRewriterRefineAction): Promise<void> {
		const input = this.draftText.trim();
		if (!input || this.isBusy) return;
		if (!isRewriterSupported() || this.rewriterAvailability === 'unavailable') {
			this.rewriterGate = 'unsupported';
			return;
		}

		this.lastPrompt = action.label;
		this.draftText = '';
		this.errorMessage = null;
		this.promptText = '';
		this.chatStatus = 'submitted';

		const assistantId = this.appendTurnPair(action.label);
		const gen = this.sessionGeneration;

		try {
			const rewriter = await this.ensureRewriter(action);
			if (gen !== this.sessionGeneration) return;

			await this.streamAssistant(
				assistantId,
				rewriteDraftStreaming(rewriter, input, {
					signal: this.abortController?.signal
				}),
				gen
			);
		} catch (err) {
			if (gen !== this.sessionGeneration) return;
			this.failAssistant(assistantId, err);
		}
	}

	private appendTurnPair(userContent: string): string {
		const userMsg: WriterChatMessageViewModel = {
			id: this.nextMessageId('user'),
			role: 'user',
			content: userContent
		};
		const assistantMsg: WriterChatMessageViewModel = {
			id: this.nextMessageId('assistant'),
			role: 'assistant',
			content: ''
		};
		this.messagesVm = [...this.messagesVm, userMsg, assistantMsg];
		return assistantMsg.id;
	}

	private async streamAssistant(
		assistantId: string,
		chunks: AsyncIterable<string>,
		gen: number
	): Promise<void> {
		this.chatStatus = 'streaming';
		let assembled = '';
		for await (const chunk of chunks) {
			if (gen !== this.sessionGeneration) return;
			assembled += chunk;
			this.draftText = assembled;
			this.patchAssistantMessage(assistantId, assembled);
		}
		if (gen !== this.sessionGeneration) return;
		this.chatStatus = 'ready';
	}

	private failAssistant(assistantId: string, err: unknown): void {
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

	private nextMessageId(role: WriterChatRole): string {
		this.messageSeq += 1;
		return `${role}-${this.messageSeq}`;
	}

	private patchAssistantMessage(id: string, content: string): void {
		this.messagesVm = this.messagesVm.map((m) => (m.id === id ? { ...m, content } : m));
	}

	private draftConstraints(): ComposerWriterDraftConstraints {
		return {
			maxCharacters: this.maxCharacters,
			providerIdentifiers: this.providerIdentifiers,
			providerIdentifier: this.providerIdentifier,
			composerMode: this.composerMode
		};
	}

	private async startWriterSession(): Promise<void> {
		const gen = ++this.sessionGeneration;
		this.phase = 'resolving';
		this.availability = null;
		this.rewriterAvailability = null;
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
		void this.refreshRewriterAvailability(gen);

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

	private async refreshRewriterAvailability(gen: number): Promise<void> {
		if (!isRewriterSupported()) {
			if (gen !== this.sessionGeneration) return;
			this.rewriterAvailability = 'unavailable';
			return;
		}
		const availability = await getRewriterAvailability(
			buildComposerRewriterCreateOptionsFromAction(
				{ tone: 'as-is', length: 'as-is' },
				this.draftConstraints()
			)
		);
		if (gen !== this.sessionGeneration) return;
		this.rewriterAvailability = availability;
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

	/**
	 * Rewriter sessions are immutable for tone/length; cache by those keys and
	 * destroy the previous session when the refine action changes.
	 */
	private async ensureRewriter(
		action: Pick<ComposerRewriterRefineAction, 'tone' | 'length'>
	): Promise<RewriterSession> {
		const key = `${action.tone}:${action.length}`;
		if (this.rewriterSession && this.rewriterSessionKey === key) {
			return this.rewriterSession;
		}

		destroyAiSession(this.rewriterSession);
		this.rewriterSession = null;
		this.rewriterSessionKey = null;

		const createOptions = buildComposerRewriterCreateOptionsFromAction(
			action,
			this.draftConstraints()
		);
		const created = await createComposerRewriter({
			signal: this.abortController?.signal,
			createOptions,
			onDownloadProgress: (loaded) => {
				this.downloadPercent = Math.round(loaded * 100);
			}
		});
		this.rewriterSession = created;
		this.rewriterSessionKey = key;
		this.downloadPercent = 100;
		this.rewriterAvailability = 'available';
		return created;
	}
}
