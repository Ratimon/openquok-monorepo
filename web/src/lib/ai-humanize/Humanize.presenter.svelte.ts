import type { IconName } from '$data/icons';
import type {
	ComposerHumanizeConstraintProvider,
	ComposerHumanizeCreateCoreOptions,
	ComposerHumanizeDraftConstraints,
	HumanizeAuditResult,
	HumanizeInventedSpecific,
	HumanizeMode,
	RewriterAvailability,
	RewriterSession
} from '$lib/ai-humanize/utils';

import {
	COMPOSER_HUMANIZE_DEFAULTS,
	COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS,
	HUMANIZE_DEFAULT_MODE
} from '$lib/ai-humanize/constants/config';
import {
	acceptHumanizeSoftOptIn,
	applyLocalHumanizeRewrite,
	auditHumanizeTells,
	buildComposerHumanizeCreateOptions,
	createComposerHumanizeSessionKey,
	findInventedSpecifics,
	hasHumanizeSoftOptIn,
	normalizeHumanizeProviderIdentifiers,
	toComposerRewriterCreateOptions,
	toHumanizeConstraintProviders
} from '$lib/ai-humanize/utils';
import {
	createComposerRewriter,
	destroyAiSession,
	getRewriterAvailability,
	isRewriterSupported,
	rewriteDraftStreaming
} from '$lib/ai-writer/utils';

export type HumanizeUiPhase = 'opt-in' | 'resolving' | 'unsupported' | 'ready';

export type HumanizeRunStatus = 'ready' | 'submitted' | 'streaming' | 'error';

export type HumanizeRewriteSource = 'rewriter' | 'local';

export type HumanizeComposerMode = 'global' | 'custom';

export type HumanizeChannelHubLinkViewModel = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	description: string;
};

export interface HumanizeToolPageViewModel {
	/** SERP `<title>` keyword target (brand appended in `+page.server.ts`). */
	metaTitle: string;
	/** On-page `<h1>` — reader-facing headline, related but not identical to `metaTitle`. */
	heroTitle: string;
	metaDescription: string;
	/** Set on `/tools/humanizer/{channelSlug}` programmatic SEO routes. */
	channelSlug: string | null;
	channelLabel: string | null;
	/** Integration catalog identifier for platform-focused composer constraints. */
	focusedProviderIdentifier: string | null;
	composerMode: HumanizeComposerMode;
}

export type HumanizeThreadReplyViewModel = {
	id: string;
	message: string;
	delaySeconds: number;
};

/**
 * Feature presenter for the composer Humanize modal: soft opt-in, on-device
 * Rewriter session lifecycle keyed by mode, streaming rewrite, and a local
 * lexicon/tell fallback when Rewriter is missing. One source → one replaceable rewrite.
 */
export class HumanizePresenter {
	phase = $state<HumanizeUiPhase>('resolving');
	availability = $state<RewriterAvailability | null>(null);
	downloadPercent = $state<number | null>(null);
	runStatus = $state<HumanizeRunStatus>('ready');
	rewriteText = $state('');
	errorMessage = $state<string | null>(null);
	/** One-shot error for the modal to toast; cleared via {@link clearPendingToastError}. */
	pendingToastError = $state<string | null>(null);

	/** Soft character limit mirrored from the composer (for UI + create options). */
	maxCharacters = $state(COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS);
	providerIdentifier = $state<string | null>(null);
	providerIdentifiers = $state<string[]>([]);
	constraintProvidersVm = $state<ComposerHumanizeConstraintProvider[]>([]);
	composerMode = $state<HumanizeComposerMode>('global');
	mode = $state<HumanizeMode>(HUMANIZE_DEFAULT_MODE);

	sourceAudit = $state<HumanizeAuditResult | null>(null);
	rewriteAudit = $state<HumanizeAuditResult | null>(null);
	inventedSpecifics = $state<HumanizeInventedSpecific[]>([]);
	rewriteSource = $state<HumanizeRewriteSource | null>(null);

	private rewriterSession: RewriterSession | null = null;
	/** Cache key `mode:tone:length:sharedContext` for the current Rewriter session. */
	private sessionKey: string | null = null;
	private abortController: AbortController | null = null;
	private sessionGeneration = 0;
	private createCore: ComposerHumanizeCreateCoreOptions = buildComposerHumanizeCreateOptions();

	isBusy = $derived(this.runStatus === 'submitted' || this.runStatus === 'streaming');
	canReplace = $derived(this.rewriteText.trim().length > 0 && !this.isBusy);
	/**
	 * Rewriter may be used (API present and not confirmed unavailable).
	 * `null` availability (still probing) counts as usable so ready can stream promptly.
	 */
	rewriterUsable = $derived(
		isRewriterSupported() && this.availability !== 'unavailable'
	);
	canUseRewriter = $derived(this.phase === 'ready' && this.rewriterUsable);
	showDownloadBanner = $derived(
		this.downloadPercent != null &&
			this.downloadPercent < 100 &&
			(this.availability === 'downloadable' ||
				this.availability === 'downloading' ||
				this.runStatus === 'submitted')
	);
	rewriteLength = $derived(this.rewriteText.length);
	isOverLimit = $derived(this.rewriteLength > this.maxCharacters);
	tellCountBefore = $derived(this.sourceAudit?.tellCount ?? 0);
	tellCountAfter = $derived(this.rewriteAudit?.tellCount ?? 0);

	/** Updates create-time constraints; call before {@link onOpen} / session create. */
	setDraftConstraints(constraints: ComposerHumanizeDraftConstraints): void {
		const max = Number.isFinite(constraints.maxCharacters)
			? Math.max(1, Math.floor(constraints.maxCharacters))
			: COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS;
		const ids = normalizeHumanizeProviderIdentifiers(
			constraints.providerIdentifiers?.length
				? constraints.providerIdentifiers
				: constraints.providerIdentifier
					? [constraints.providerIdentifier]
					: []
		);
		this.maxCharacters = max;
		this.providerIdentifiers = ids;
		this.providerIdentifier = ids[0] ?? null;
		this.constraintProvidersVm = toHumanizeConstraintProviders(ids);
		this.composerMode = constraints.composerMode ?? 'global';
		this.refreshCreateCore();
	}

	/**
	 * Updates Human vs Roughen. Invalidates the on-device session because
	 * Rewriter `sharedContext` is immutable per session.
	 */
	setMode(mode: HumanizeMode): void {
		if (this.mode === mode) return;
		this.mode = mode;
		this.inventedSpecifics = [];
		this.invalidateSession();
		this.refreshCreateCore();
	}

	/**
	 * Drops a platform from Humanize sharedContext. Invalidates the on-device session
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
		if (isRewriterSupported() && !hasHumanizeSoftOptIn()) {
			this.phase = 'opt-in';
			return;
		}
		await this.startHumanizeSession();
	}

	async acceptOptIn(): Promise<void> {
		acceptHumanizeSoftOptIn();
		await this.startHumanizeSession();
	}

	resetUi(): void {
		this.phase = 'resolving';
		this.availability = null;
		this.downloadPercent = null;
		this.runStatus = 'ready';
		this.rewriteText = '';
		this.errorMessage = null;
		this.pendingToastError = null;
		this.providerIdentifiers = [];
		this.providerIdentifier = null;
		this.constraintProvidersVm = [];
		this.mode = COMPOSER_HUMANIZE_DEFAULTS.mode;
		this.sourceAudit = null;
		this.rewriteAudit = null;
		this.inventedSpecifics = [];
		this.rewriteSource = null;
		this.createCore = buildComposerHumanizeCreateOptions();
		this.sessionKey = null;
	}

	clearPendingToastError(): void {
		this.pendingToastError = null;
	}

	teardown(): void {
		this.sessionGeneration += 1;
		this.abortController?.abort();
		this.abortController = null;
		destroyAiSession(this.rewriterSession);
		this.rewriterSession = null;
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
	 * Rewrites `sourceText` into {@link rewriteText}. Prefers streaming Rewriter;
	 * falls back to the local tell cleanup when the API is missing or fails.
	 */
	async runHumanize(sourceText: string): Promise<void> {
		const trimmed = sourceText.trim();
		if (!trimmed || this.isBusy) return;
		if (this.phase === 'opt-in' || this.phase === 'resolving') return;

		this.rewriteText = '';
		this.errorMessage = null;
		this.rewriteSource = null;
		this.rewriteAudit = null;
		this.inventedSpecifics = [];
		this.sourceAudit = auditHumanizeTells(trimmed);
		this.runStatus = 'submitted';
		const gen = this.sessionGeneration;

		try {
			if (this.canUseRewriter) {
				await this.streamRewriter(trimmed, gen);
			} else {
				this.applyLocalRewrite(trimmed);
			}
			if (gen !== this.sessionGeneration) return;
			this.finishAudit(trimmed);
			this.runStatus = 'ready';
		} catch (err) {
			if (gen !== this.sessionGeneration) return;
			if (this.isAbortError(err)) {
				this.runStatus = 'ready';
				return;
			}
			try {
				this.applyLocalRewrite(trimmed);
				this.finishAudit(trimmed);
				this.runStatus = 'ready';
			} catch (fallbackErr) {
				this.failRun(fallbackErr);
			}
		}
	}

	private applyLocalRewrite(sourceText: string): void {
		const next = applyLocalHumanizeRewrite(sourceText, this.mode).trim();
		this.rewriteText = next || sourceText;
		this.rewriteSource = 'local';
	}

	private async streamRewriter(sourceText: string, gen: number): Promise<void> {
		const rewriter = await this.ensureRewriter();
		if (gen !== this.sessionGeneration) return;

		this.runStatus = 'streaming';
		let assembled = '';
		for await (const chunk of rewriteDraftStreaming(rewriter, sourceText, {
			signal: this.abortController?.signal
		})) {
			if (gen !== this.sessionGeneration) return;
			assembled += chunk;
			this.rewriteText = assembled;
		}
		if (gen !== this.sessionGeneration) return;
		if (!assembled.trim()) {
			this.applyLocalRewrite(sourceText);
			return;
		}
		this.rewriteSource = 'rewriter';
	}

	private finishAudit(sourceText: string): void {
		const rewritten = this.rewriteText.trim();
		this.rewriteAudit = auditHumanizeTells(rewritten);
		this.inventedSpecifics = findInventedSpecifics(sourceText, rewritten);
	}

	private failRun(err: unknown): void {
		if (this.isAbortError(err)) {
			this.runStatus = 'ready';
			return;
		}
		this.runStatus = 'error';
		const message =
			err instanceof Error && err.message
				? err.message
				: 'Could not rewrite this post. Try again.';
		this.errorMessage = message;
		this.pendingToastError = message;
	}

	private isAbortError(err: unknown): boolean {
		return (
			(err instanceof DOMException && err.name === 'AbortError') ||
			(err instanceof Error && err.name === 'AbortError')
		);
	}

	private draftConstraints(): ComposerHumanizeDraftConstraints {
		return {
			maxCharacters: this.maxCharacters,
			providerIdentifiers: this.providerIdentifiers,
			providerIdentifier: this.providerIdentifier,
			composerMode: this.composerMode
		};
	}

	private refreshCreateCore(): void {
		this.createCore = buildComposerHumanizeCreateOptions({
			mode: this.mode,
			constraints: this.draftConstraints()
		});
	}

	private invalidateSession(): void {
		destroyAiSession(this.rewriterSession);
		this.rewriterSession = null;
		this.sessionKey = null;
	}

	private async startHumanizeSession(): Promise<void> {
		const gen = ++this.sessionGeneration;
		this.phase = 'resolving';
		this.availability = null;
		this.downloadPercent = null;
		this.errorMessage = null;
		this.abortController = new AbortController();
		this.refreshCreateCore();

		if (!isRewriterSupported()) {
			if (gen !== this.sessionGeneration) return;
			this.phase = 'unsupported';
			this.availability = 'unavailable';
			return;
		}

		const nextAvailability = await getRewriterAvailability(
			toComposerRewriterCreateOptions(this.createCore)
		);
		if (gen !== this.sessionGeneration) return;
		this.availability = nextAvailability;

		if (nextAvailability === 'unavailable') {
			this.phase = 'unsupported';
			return;
		}

		this.phase = 'ready';

		if (nextAvailability === 'downloadable' || nextAvailability === 'downloading') {
			void this.ensureRewriter().catch((err) => {
				if (gen !== this.sessionGeneration) return;
				if (this.isAbortError(err)) return;
				this.downloadPercent = null;
				this.pendingToastError =
					err instanceof Error && err.message
						? err.message
						: 'Could not download the on-device Rewriter model.';
			});
		}
	}

	private async ensureRewriter(): Promise<RewriterSession> {
		const key = createComposerHumanizeSessionKey(this.createCore);
		if (this.rewriterSession && this.sessionKey === key) {
			return this.rewriterSession;
		}

		this.invalidateSession();

		const created = await createComposerRewriter({
			signal: this.abortController?.signal,
			createOptions: toComposerRewriterCreateOptions(this.createCore),
			onDownloadProgress: (loaded) => {
				this.downloadPercent = Math.round(loaded * 100);
			}
		});
		this.rewriterSession = created;
		this.sessionKey = key;
		this.downloadPercent = 100;
		this.availability = 'available';
		return created;
	}
}
