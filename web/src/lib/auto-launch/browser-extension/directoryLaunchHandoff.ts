import {
	BROWSER_EXTENSION_MESSAGE_TYPE,
	coerceAutoLaunchHandoffRequestFields,
	type AutoLaunchHandoffRequestFields
} from 'openquok-common';

import type { AutoLaunchSubmissionIntentDto } from '$lib/auto-launch/auto-launch.types';

import { getBrowserExtensionId } from '$lib/integrations/browser-extension/extensionConfig';
import { sendBrowserExtensionRequest } from '$lib/integrations/browser-extension/extensionClient';

export function buildAutoLaunchHandoffRequest(
	intent: AutoLaunchSubmissionIntentDto
): AutoLaunchHandoffRequestFields {
	const coerced = coerceAutoLaunchHandoffRequestFields({
		submissionId: intent.submissionId,
		launchToken: intent.launchToken,
		providerSlug: intent.providerSlug,
		startUrl: intent.startUrl,
		profileSnapshot: intent.profileSnapshot,
		extensionConfig: intent.extensionConfig ?? {}
	});
	if (!coerced) {
		throw new Error('Directory launch intent is missing required handoff fields.');
	}
	return coerced;
}

export type DirectoryLaunchHandoffOptions = {
	/** Dashboard opened `startUrl` in a new tab; extension should attach there instead of opening again. */
	skipStartUrlTabOpen?: boolean;
};

export async function sendDirectoryLaunchHandoff(
	intent: AutoLaunchSubmissionIntentDto,
	options?: DirectoryLaunchHandoffOptions
): Promise<{ ok: true } | { ok: false; error: string }> {
	const extensionId = getBrowserExtensionId();
	if (!extensionId) {
		return { ok: false, error: 'OpenQuok browser extension is not configured for this site.' };
	}
	const request = {
		type: BROWSER_EXTENSION_MESSAGE_TYPE.AUTO_LAUNCH_HANDOFF,
		...buildAutoLaunchHandoffRequest(intent),
		...(options?.skipStartUrlTabOpen ? { skipStartUrlTabOpen: true } : {})
	};
	try {
		const response = await sendBrowserExtensionRequest(extensionId, request);
		if (!response.ok) {
			return { ok: false, error: response.error };
		}
		if (response.type !== BROWSER_EXTENSION_MESSAGE_TYPE.AUTO_LAUNCH_HANDOFF) {
			return { ok: false, error: 'Unexpected extension response.' };
		}
		return { ok: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not reach the browser extension.';
		return { ok: false, error: message };
	}
}
