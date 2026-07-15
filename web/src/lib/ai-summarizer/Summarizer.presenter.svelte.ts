import type {
	ComposerSummarizerConstraintProvider,
	ComposerSummarizerCreateCoreOptions,
	ComposerSummarizerDraftConstraints,
	SummarizerAvailability,
	SummarizerSession
} from '$lib/ai-summarizer/utils';

import {
	COMPOSER_SUMMARIZER_DEFAULTS,
	COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS
} from '$lib/ai-summarizer/constants/config';
import {
	acceptSummarizerSoftOptIn,
	buildComposerSummarizerCreateOptions,
	createComposerSummarizer,
	destroySummarizer,
	getSummarizerAvailability,
	hasSummarizerSoftOptIn,
	isSummarizerSupported,
	normalizeSummarizerProviderIdentifiers,
	summarizeWithQuotaAwareStreaming,
	toSummarizerConstraintProviders
} from '$lib/ai-summarizer/utils';

export type SummarizerUiPhase = 'opt-in' | 'resolving' | 'unsupported' | 'ready';

export type SummarizerRunStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/**
 * Feature presenter for the composer AI Summarize modal: soft opt-in, on-device
 * Summarizer session lifecycle, quota-aware streaming summaries, and soft-char-limit awareness.
 * No chat/refine — one source → one replaceable summary.
 */
export class SummarizerPresenter {
	phase = $state<SummarizerUiPhase>('resolving');
	availability = $state<SummarizerAvailability | null>(null);
	downloadPercent = $state<number | null>(null);
	runStatus = $state<SummarizerRunStatus>('ready');
	summaryText = $state('');
	errorMessage = $state<string | null>(null);
	/** One-shot error for the modal to toast; cleared via {@link clearPendingToastError}. */
	pendingToastError = $state<string | null>(null);

	/** Soft character limit mirrored from the composer (for UI + create options). */
	maxCharacters = $state(COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS);
	providerIdentifier = $state<string | null>(null);
	providerIdentifiers = $state<string[]>([]);
	constraintProvidersVm = $state<ComposerSummarizerConstraintProvider[]>([]);
	composerMode = $state<'global' | 'custom'>('global');

	/** Immutable create-time controls (recreate session when changed after ready). */
	type = $state<SummarizerType>(COMPOSER_SUMMARIZER_DEFAULTS.type);
	length = $state<SummarizerLength>(COMPOSER_SUMMARIZER_DEFAULTS.length);

	private summarizerSession: SummarizerSession | null = null;
	/** Cache key `type:length:sharedContext` for the current Summarizer session. */
	private sessionKey: string | null = null;
	private abortController: AbortController | null = null;
	private sessionGeneration = 0;
	private createCore: ComposerSummarizerCreateCoreOptions = buildComposerSummarizerCreateOptions();

	isBusy = $derived(this.runStatus === 'submitted' || this.runStatus === 'streaming');
	canReplace = $derived(this.summaryText.trim().length > 0 && !this.isBusy);
	showDownloadBanner = $derived(
		this.downloadPercent != null &&
			this.downloadPercent < 100 &&
			(this.availability === 'downloadable' ||
				this.availability === 'downloading' ||
				this.runStatus === 'submitted')
	);
	summaryLength = $derived(this.summaryText.length);
	isOverLimit = $derived(this.summaryLength > this.maxCharacters);

	/** Updates create-time constraints; call before {@link onOpen} / session create. */
	setDraftConstraints(constraints: ComposerSummarizerDraftConstraints): void {
		const max = Number.isFinite(constraints.maxCharacters)
			? Math.max(1, Math.floor(constraints.maxCharacters))
			: COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS;
		const ids = normalizeSummarizerProviderIdentifiers(
			constraints.providerIdentifiers?.length
				? constraints.providerIdentifiers
				: constraints.providerIdentifier
					? [constraints.providerIdentifier]
					: []
		);
		this.maxCharacters = max;
		this.providerIdentifiers = ids;
		this.providerIdentifier = ids[0] ?? null;
		this.constraintProvidersVm = toSummarizerConstraintProviders(ids);
		this.composerMode = constraints.composerMode ?? 'global';
		this.refreshCreateCore({ resetLengthFromLimit: this.sessionKey == null });
	}

	/**
	 * Updates summary type. Invalidates the on-device session (create options are immutable).
	 */
	setType(type: SummarizerType): void {
		if (this.type === type) return;
		this.type = type;
		this.invalidateSession();
		this.refreshCreateCore();
	}

	/**
	 * Updates summary length. Invalidates the on-device session (create options are immutable).
	 */
	setLength(length: SummarizerLength): void {
		if (this.length === length) return;
		this.length = length;
		this.invalidateSession();
		this.refreshCreateCore();
	}

	/**
	 * Drops a platform from Summarizer sharedContext. Invalidates the on-device session
	 * so the next run recreates with updated constraints.
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
		this.invalidateSession();
	}

	async onOpen(): Promise<void> {
		if (!hasSummarizerSoftOptIn()) {
			this.phase = 'opt-in';
			return;
		}
		await this.startSummarizerSession();
	}

	async acceptOptIn(): Promise<void> {
		acceptSummarizerSoftOptIn();
		await this.startSummarizerSession();
	}

	resetUi(): void {
		this.phase = 'resolving';
		this.availability = null;
		this.downloadPercent = null;
		this.runStatus = 'ready';
		this.summaryText = '';
		this.errorMessage = null;
		this.pendingToastError = null;
		this.providerIdentifiers = [];
		this.providerIdentifier = null;
		this.constraintProvidersVm = [];
		this.type = COMPOSER_SUMMARIZER_DEFAULTS.type;
		this.length = COMPOSER_SUMMARIZER_DEFAULTS.length;
		this.createCore = buildComposerSummarizerCreateOptions();
		this.sessionKey = null;
	}

	clearPendingToastError(): void {
		this.pendingToastError = null;
	}

	teardown(): void {
		this.sessionGeneration += 1;
		this.abortController?.abort();
		this.abortController = null;
		destroySummarizer(this.summarizerSession);
		this.summarizerSession = null;
		this.sessionKey = null;
	}

	stopGeneration(): void {
		this.abortController?.abort();
		this.abortController = new AbortController();
		if (this.runStatus === 'submitted' || this.runStatus === 'streaming') {
			this.runStatus = 'ready';
		}
	}

	/**
	 * Summarizes `sourceText` (quota-aware / summary-of-summaries when needed) into
	 * {@link summaryText}. Prefer streaming for the final pass.
	 */
	async runSummarize(sourceText: string): Promise<void> {
		const trimmed = sourceText.trim();
		if (!trimmed || this.isBusy) return;

		this.summaryText = '';
		this.errorMessage = null;
		this.runStatus = 'submitted';
		const gen = this.sessionGeneration;

		try {
			const summarizer = await this.ensureSummarizer();
			if (gen !== this.sessionGeneration) return;

			this.runStatus = 'streaming';
			let assembled = '';
			for await (const chunk of summarizeWithQuotaAwareStreaming(summarizer, trimmed, {
				signal: this.abortController?.signal
			})) {
				if (gen !== this.sessionGeneration) return;
				assembled += chunk;
				this.summaryText = assembled;
			}
			if (gen !== this.sessionGeneration) return;
			this.runStatus = 'ready';
		} catch (err) {
			if (gen !== this.sessionGeneration) return;
			this.failRun(err);
		}
	}

	private failRun(err: unknown): void {
		const aborted =
			(err instanceof DOMException && err.name === 'AbortError') ||
			(err instanceof Error && err.name === 'AbortError');
		if (aborted) {
			this.runStatus = 'ready';
			return;
		}
		this.runStatus = 'error';
		const message =
			err instanceof Error && err.message
				? err.message
				: 'Could not summarize this post. Try again.';
		this.errorMessage = message;
		this.pendingToastError = message;
	}

	private draftConstraints(): ComposerSummarizerDraftConstraints {
		return {
			maxCharacters: this.maxCharacters,
			providerIdentifiers: this.providerIdentifiers,
			providerIdentifier: this.providerIdentifier,
			composerMode: this.composerMode
		};
	}

	private refreshCreateCore(options: { resetLengthFromLimit?: boolean } = {}): void {
		if (options.resetLengthFromLimit) {
			this.length = buildComposerSummarizerCreateOptions({
				type: this.type,
				constraints: this.draftConstraints()
			}).length;
		}
		this.createCore = buildComposerSummarizerCreateOptions({
			type: this.type,
			length: this.length,
			constraints: this.draftConstraints()
		});
	}

	private invalidateSession(): void {
		destroySummarizer(this.summarizerSession);
		this.summarizerSession = null;
		this.sessionKey = null;
	}

	private createSessionKey(core: ComposerSummarizerCreateCoreOptions): string {
		return `${core.type}:${core.length}:${core.sharedContext}`;
	}

	private async startSummarizerSession(): Promise<void> {
		const gen = ++this.sessionGeneration;
		this.phase = 'resolving';
		this.availability = null;
		this.downloadPercent = null;
		this.errorMessage = null;
		this.abortController = new AbortController();
		this.refreshCreateCore({ resetLengthFromLimit: true });

		if (!isSummarizerSupported()) {
			if (gen !== this.sessionGeneration) return;
			this.phase = 'unsupported';
			this.availability = 'unavailable';
			return;
		}

		const nextAvailability = await getSummarizerAvailability(this.createCore);
		if (gen !== this.sessionGeneration) return;
		this.availability = nextAvailability;

		if (nextAvailability === 'unavailable') {
			this.phase = 'unsupported';
			return;
		}

		this.phase = 'ready';

		if (nextAvailability === 'downloadable' || nextAvailability === 'downloading') {
			void this.ensureSummarizer().catch((err) => {
				if (gen !== this.sessionGeneration) return;
				const aborted =
					(err instanceof DOMException && err.name === 'AbortError') ||
					(err instanceof Error && err.name === 'AbortError');
				if (aborted) return;
				this.downloadPercent = null;
				this.pendingToastError =
					err instanceof Error && err.message
						? err.message
						: 'Could not download the on-device Summarizer model.';
			});
		}
	}

	private async ensureSummarizer(): Promise<SummarizerSession> {
		const key = this.createSessionKey(this.createCore);
		if (this.summarizerSession && this.sessionKey === key) {
			return this.summarizerSession;
		}

		this.invalidateSession();

		const created = await createComposerSummarizer({
			signal: this.abortController?.signal,
			createOptions: this.createCore,
			onDownloadProgress: (loaded) => {
				this.downloadPercent = Math.round(loaded * 100);
			}
		});
		this.summarizerSession = created;
		this.sessionKey = key;
		this.downloadPercent = 100;
		this.availability = 'available';
		return created;
	}
}
