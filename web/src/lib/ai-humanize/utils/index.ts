export {
	isRewriterSupported,
	getRewriterAvailability,
	type RewriterAvailability
} from '$lib/ai-writer/utils/availability';
export {
	createComposerRewriter,
	type CreateComposerRewriterOptions,
	type RewriterSession
} from '$lib/ai-writer/utils/createSession';
export { destroyAiSession } from '$lib/ai-writer/utils/destroySession';
export {
	rewriteDraftStreaming,
	type RewriteDraftStreamingOptions
} from '$lib/ai-writer/utils/draftStreaming';
export {
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
	type ComposerHumanizeDraftConstraints
} from '$lib/ai-humanize/utils/buildCreateOptions';
export {
	hasHumanizeSoftOptIn,
	acceptHumanizeSoftOptIn
} from '$lib/ai-humanize/utils/softOptIn';
export {
	auditHumanizeTells,
	type HumanizeAuditResult,
	type HumanizeTellHit,
	type HumanizeTellKind
} from '$lib/ai-humanize/utils/auditTells';
export { applyLocalHumanizeRewrite } from '$lib/ai-humanize/utils/localRewrite';
export {
	findInventedSpecifics,
	type HumanizeInventedKind,
	type HumanizeInventedSpecific
} from '$lib/ai-humanize/utils/inventedSpecifics';
export {
	buildHumanizeMockChannels,
	humanizeMockChannelId,
	HUMANIZE_MOCK_CHANNEL_ID_PREFIX
} from '$lib/ai-humanize/utils/buildHumanizeMockChannels';
export type { HumanizeMode } from '$lib/ai-humanize/constants/config';
