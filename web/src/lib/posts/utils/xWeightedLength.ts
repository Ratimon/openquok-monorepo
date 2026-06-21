import twitterText from 'twitter-text';

import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const X_STANDARD_MAX_CHARACTERS = 280;
export const X_VERIFIED_MAX_CHARACTERS = 4000;

type AdditionalSettingRow = { title?: string; value?: unknown };

/** Weighted character count aligned with X API / backend `validateTweetWeightedLength`. */
export function xWeightedLength(text: string): number {
	return twitterText.parseTweet(text ?? '').weightedLength;
}

export function parseXAdditionalSettings(raw: string | null | undefined): AdditionalSettingRow[] {
	if (!raw?.trim()) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed) ? (parsed as AdditionalSettingRow[]) : [];
	} catch {
		return [];
	}
}

export function isXVerifiedChannel(
	channel: Pick<CreateSocialPostChannelViewModel, 'additionalSettings'> | null | undefined
): boolean {
	const verified = parseXAdditionalSettings(channel?.additionalSettings).find(
		(row) => row?.title === 'Verified'
	)?.value;
	return verified === true;
}

export function xMaxCharactersForChannel(
	channel: Pick<CreateSocialPostChannelViewModel, 'additionalSettings'> | null | undefined
): number {
	return isXVerifiedChannel(channel) ? X_VERIFIED_MAX_CHARACTERS : X_STANDARD_MAX_CHARACTERS;
}
