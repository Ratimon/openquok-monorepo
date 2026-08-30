export {
	HUMANIZE_API_DOCS_URL,
	HUMANIZE_SOFT_OPT_IN_STORAGE_KEY,
	HUMANIZE_MODES,
	HUMANIZE_DEFAULT_MODE,
	HUMANIZE_REGISTER_OVERLAYS,
	COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS,
	COMPOSER_HUMANIZE_DEFAULTS,
	type HumanizeMode,
	type HumanizeModeOption,
	type HumanizeUiCopy
} from '$lib/ai-humanize/constants/config';

export { HUMANIZE_MODE_OPTIONS } from '$lib/ai-humanize/constants/locales/en/ui';

export { HUMANIZE_UI_COPY } from '$lib/ai-humanize/constants/locales/index';

export {
	COMPOSER_HUMANIZE_HUMAN_PREAMBLE,
	COMPOSER_HUMANIZE_ROUGHEN_PREAMBLE,
	COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT,
	COMPOSER_HUMANIZE_ROUGHEN_SHARED_CONTEXT,
	serializeHumanizeWritingGuide,
	buildHumanizeModeSharedContext
} from '$lib/ai-humanize/constants/locales/en/sharedContext';

export { COMPOSER_HUMANIZE_TH_LANGUAGE_CONTEXT } from '$lib/ai-humanize/constants/locales/th/rewriterContext';

export { HUMANIZE_MODE_OPTIONS_TH } from '$lib/ai-humanize/constants/locales/th/ui';

export { HUMANIZE_WRITING_GUIDE } from '$lib/ai-humanize/constants/locales/en/writingGuide';
export type {
	HumanizeLexiconGroupId,
	HumanizeMarkerEntry,
	HumanizeRegisterOverlay,
	HumanizeRewriteConstraint,
	HumanizeSmokingGunEntry,
	HumanizeSwapRow,
	HumanizeTellCategory,
	HumanizeTellDetectability,
	HumanizeTellEntry,
	HumanizeTier2LexiconEntry
} from '$lib/ai-humanize/constants/locales/en/writingGuide';

export {
	HUMANIZE_TIER1_LEXICON,
	HUMANIZE_TIER1_LEXICON_BY_GROUP,
	HUMANIZE_TIER1_TERMS,
	HUMANIZE_TIER2_LEXICON,
	HUMANIZE_TIER2_CLUSTER,
	type HumanizeLexiconEntry
} from '$lib/ai-humanize/constants/locales/en/lexicon';

export {
	PUBLIC_HUMANIZE_GENERIC_CONFIG,
	getHumanizeChannelBySlug,
	listHumanizeChannelsForHub,
	type HumanizeChannelPageConfig
} from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';

export {
	buildHumanizeFaqSection,
	type HumanizeFaqSection
} from '$lib/ai-humanize/constants/publicHumanizeFaqConfig';

export {
	isRewriterSupported,
	getRewriterAvailability,
	type RewriterAvailability,
	createComposerRewriter,
	type CreateComposerRewriterOptions,
	type RewriterSession,
	rewriteDraftStreaming,
	type RewriteDraftStreamingOptions,
	destroyAiSession,
	hasHumanizeSoftOptIn,
	acceptHumanizeSoftOptIn,
	buildComposerHumanizeCreateOptions,
	buildComposerHumanizeSharedContext,
	createComposerHumanizeSessionKey,
	formatHumanizeConstraintTargetLabel,
	normalizeHumanizeProviderIdentifiers,
	toComposerRewriterCreateOptions,
	toHumanizeConstraintProviders,
	type BuildComposerHumanizeCreateOptionsInput,
	type ComposerHumanizeConstraintProvider,
	type ComposerHumanizeCreateCoreOptions,
	type ComposerHumanizeDraftConstraints,
	auditHumanizeTells,
	type HumanizeAuditResult,
	type HumanizeTellHit,
	type HumanizeTellKind,
	applyLocalHumanizeRewrite,
	detectHumanizeLocale,
	isThaiText,
	thaiCharRatio,
	detectHumanizeUiLocale,
	humanizeModeOptionsFor,
	humanizeUiCopyFor,
	prefersThaiLanguage,
	findInventedSpecifics,
	type HumanizeInventedKind,
	type HumanizeInventedSpecific,
	buildHumanizeMockChannels,
	humanizeMockChannelId,
	HUMANIZE_MOCK_CHANNEL_ID_PREFIX
} from '$lib/ai-humanize/utils';

export {
	HumanizePresenter,
	type HumanizeUiPhase,
	type HumanizeRunStatus,
	type HumanizeRewriteSource,
	type HumanizeComposerMode,
	type HumanizeChannelHubLinkViewModel,
	type HumanizeToolPageViewModel,
	type HumanizeThreadReplyViewModel
} from '$lib/ai-humanize/Humanize.presenter.svelte';

export {
	PublicHumanizeComposerPresenter,
	type PublicHumanizeComposerInit
} from '$lib/ai-humanize/PublicHumanizeComposer.presenter.svelte';
