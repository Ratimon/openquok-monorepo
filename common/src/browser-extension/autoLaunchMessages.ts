import type {
	AutoLaunchCompletePayload,
	AutoLaunchExtensionConfig,
	AutoLaunchHandoffSession,
	AutoLaunchProfileSnapshot,
	AutoLaunchProgressPayload,
} from './pageAssist.js';

/** Runtime messages between extension popup, background, and content scripts. */
export const AUTO_LAUNCH_MESSAGE_TYPE = {
	HANDOFF: 'AUTO_LAUNCH_HANDOFF',
	START: 'AUTO_LAUNCH_START',
	FILL_STEP: 'AUTO_LAUNCH_FILL_STEP',
	FILL_ALL: 'AUTO_LAUNCH_FILL_ALL',
	PROGRESS: 'AUTO_LAUNCH_PROGRESS',
	COMPLETE: 'AUTO_LAUNCH_COMPLETE',
} as const;

export type AutoLaunchMessageType =
	(typeof AUTO_LAUNCH_MESSAGE_TYPE)[keyof typeof AUTO_LAUNCH_MESSAGE_TYPE];

const AUTO_LAUNCH_MESSAGE_TYPES = new Set<string>(Object.values(AUTO_LAUNCH_MESSAGE_TYPE));

export function isAutoLaunchMessageType(value: unknown): value is AutoLaunchMessageType {
	return typeof value === 'string' && AUTO_LAUNCH_MESSAGE_TYPES.has(value);
}

export type AutoLaunchStartMessage = {
	type: typeof AUTO_LAUNCH_MESSAGE_TYPE.START;
	submissionId?: string;
};

export type AutoLaunchFillStepMessage = {
	type: typeof AUTO_LAUNCH_MESSAGE_TYPE.FILL_STEP;
	stepId: string;
};

export type AutoLaunchFillAllMessage = {
	type: typeof AUTO_LAUNCH_MESSAGE_TYPE.FILL_ALL;
};

export type AutoLaunchProgressMessage = {
	type: typeof AUTO_LAUNCH_MESSAGE_TYPE.PROGRESS;
} & AutoLaunchProgressPayload;

export type AutoLaunchCompleteMessage = {
	type: typeof AUTO_LAUNCH_MESSAGE_TYPE.COMPLETE;
} & AutoLaunchCompletePayload;

/** Internal extension messaging (not sent from the web dashboard via `externally_connectable`). */
export type AutoLaunchRuntimeMessage =
	| AutoLaunchStartMessage
	| AutoLaunchFillStepMessage
	| AutoLaunchFillAllMessage
	| AutoLaunchProgressMessage
	| AutoLaunchCompleteMessage;

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nullableStringField(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	return typeof value === 'string' ? value : null;
}

function coerceProfileSnapshot(value: unknown): AutoLaunchProfileSnapshot | null {
	if (!isPlainObject(value)) return null;
	const name = typeof value.name === 'string' ? value.name.trim() : '';
	if (!name) return null;

	const profileDataRaw = value.profile_data ?? value.profileData;
	const profile_data = isPlainObject(profileDataRaw) ? profileDataRaw : {};

	return {
		name,
		tagline: nullableStringField(value.tagline),
		description: nullableStringField(value.description),
		website_url: nullableStringField(value.website_url ?? value.websiteUrl),
		logo_url: nullableStringField(value.logo_url ?? value.logoUrl),
		profile_data,
		integration_customer_id: nullableStringField(
			value.integration_customer_id ?? value.integrationCustomerId
		),
	};
}

function coerceExtensionConfig(value: unknown): AutoLaunchExtensionConfig | null {
	if (!isPlainObject(value)) return null;

	const config: AutoLaunchExtensionConfig = {};

	if (value.version !== undefined && value.version !== null) {
		const version =
			typeof value.version === 'number' ? value.version : Number.parseFloat(String(value.version));
		if (!Number.isFinite(version)) return null;
		config.version = version;
	}
	if (value.startUrlPatterns !== undefined) {
		if (!Array.isArray(value.startUrlPatterns)) return null;
		config.startUrlPatterns = value.startUrlPatterns as string[];
	}
	if (value.readyUrlHint !== undefined) {
		if (typeof value.readyUrlHint !== 'string') return null;
		config.readyUrlHint = value.readyUrlHint;
	}
	if (value.steps !== undefined) {
		if (!Array.isArray(value.steps)) return null;
		config.steps = value.steps as AutoLaunchExtensionConfig['steps'];
	}
	if (value.proof !== undefined) {
		if (!isPlainObject(value.proof)) return null;
		config.proof = value.proof;
	}

	return config;
}

function isAutoLaunchProfileSnapshot(value: unknown): value is AutoLaunchProfileSnapshot {
	return coerceProfileSnapshot(value) !== null;
}

function isAutoLaunchExtensionConfig(value: unknown): value is AutoLaunchExtensionConfig {
	return coerceExtensionConfig(value) !== null;
}

/** Dashboard → extension handoff fields (also used in `BrowserExtensionRequest`). */
export type AutoLaunchHandoffRequestFields = {
	submissionId: string;
	launchToken: string;
	providerSlug: string;
	startUrl: string;
	profileSnapshotHash?: string;
	profileSnapshot: AutoLaunchProfileSnapshot;
	extensionConfig: AutoLaunchExtensionConfig;
	/** When true, the dashboard already opened `startUrl` in a new tab; do not navigate the current tab. */
	skipStartUrlTabOpen?: boolean;
};

/** Normalize dashboard handoff payloads before `chrome.runtime.sendMessage`. */
export function coerceAutoLaunchHandoffRequestFields(
	value: unknown
): AutoLaunchHandoffRequestFields | null {
	if (!isPlainObject(value)) return null;
	if (
		!isNonEmptyString(value.submissionId) ||
		!isNonEmptyString(value.launchToken) ||
		!isNonEmptyString(value.providerSlug) ||
		!isNonEmptyString(value.startUrl)
	) {
		return null;
	}
	if (value.profileSnapshotHash !== undefined && !isNonEmptyString(value.profileSnapshotHash)) {
		return null;
	}

	const profileSnapshot = coerceProfileSnapshot(value.profileSnapshot);
	const extensionConfig = coerceExtensionConfig(value.extensionConfig);
	if (!profileSnapshot || extensionConfig === null) return null;

	return {
		submissionId: value.submissionId.trim(),
		launchToken: value.launchToken.trim(),
		providerSlug: value.providerSlug.trim(),
		startUrl: value.startUrl.trim(),
		...(value.profileSnapshotHash !== undefined
			? { profileSnapshotHash: value.profileSnapshotHash.trim() }
			: {}),
		...(value.skipStartUrlTabOpen === true ? { skipStartUrlTabOpen: true } : {}),
		profileSnapshot,
		extensionConfig,
	};
}

export function isAutoLaunchHandoffRequestFields(
	value: unknown
): value is AutoLaunchHandoffRequestFields {
	return coerceAutoLaunchHandoffRequestFields(value) !== null;
}

export function toAutoLaunchHandoffSession(
	fields: AutoLaunchHandoffRequestFields
): AutoLaunchHandoffSession {
	return {
		submissionId: fields.submissionId,
		launchToken: fields.launchToken,
		providerSlug: fields.providerSlug,
		startUrl: fields.startUrl,
		profileSnapshotHash: fields.profileSnapshotHash,
		profileSnapshot: fields.profileSnapshot,
		extensionConfig: fields.extensionConfig,
	};
}

export function isAutoLaunchRuntimeMessage(value: unknown): value is AutoLaunchRuntimeMessage {
	if (!isPlainObject(value)) return false;
	const type = value.type;
	if (!isAutoLaunchMessageType(type)) return false;

	switch (type) {
		case AUTO_LAUNCH_MESSAGE_TYPE.START:
			return value.submissionId === undefined || isNonEmptyString(value.submissionId);
		case AUTO_LAUNCH_MESSAGE_TYPE.FILL_STEP:
			return isNonEmptyString(value.stepId);
		case AUTO_LAUNCH_MESSAGE_TYPE.FILL_ALL:
			return true;
		case AUTO_LAUNCH_MESSAGE_TYPE.PROGRESS:
			return (
				isNonEmptyString(value.providerSlug) &&
				isNonEmptyString(value.stepId) &&
				typeof value.filledCount === 'number' &&
				typeof value.totalFields === 'number'
			);
		case AUTO_LAUNCH_MESSAGE_TYPE.COMPLETE:
			return (
				isNonEmptyString(value.submissionId) &&
				typeof value.success === 'boolean'
			);
		case AUTO_LAUNCH_MESSAGE_TYPE.HANDOFF:
			return false;
		default:
			return false;
	}
}
