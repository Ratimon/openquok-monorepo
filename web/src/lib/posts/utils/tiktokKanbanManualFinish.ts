import { readTiktokLaunchSettings } from '$lib/ui/components/posts/providers/tiktok/tiktok.provider';

export type TiktokManualFinishKind = 'inbox' | 'private_draft';

export type TiktokManualFinishViewModel = {
	kind: TiktokManualFinishKind;
	statusLabel: string;
	/** Shown on kanban when `posts.note` is empty; agents should prefer `--note` with the same text. */
	defaultReviewNote: string;
};

function parsePostSettingsJson(settings: string | null | undefined): Record<string, unknown> | null {
	if (!settings?.trim()) return null;
	try {
		const parsed: unknown = JSON.parse(settings);
		return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

function providerSettingsFromPostSettings(
	settings: string | null | undefined
): Record<string, unknown> {
	const root = parsePostSettingsJson(settings);
	if (!root) return {};
	const ps = root.providerSettings;
	return ps && typeof ps === 'object' ? (ps as Record<string, unknown>) : {};
}

/**
 * TikTok rows that OpenQuok marked PUBLISHED but still need finishing in the TikTok app
 * (inbox upload or private draft for manual music/editing).
 */
export function resolveTiktokManualFinish(row: {
	state: string;
	providerIdentifier?: string | null;
	settings?: string | null;
}): TiktokManualFinishViewModel | null {
	if (row.state !== 'PUBLISHED') return null;
	if (row.providerIdentifier?.trim() !== 'tiktok') return null;

	const tiktok = readTiktokLaunchSettings(providerSettingsFromPostSettings(row.settings));
	if (tiktok.content_posting_method === 'UPLOAD') {
		return {
			kind: 'inbox',
			statusLabel: 'In TikTok inbox',
			defaultReviewNote:
				'Finish in TikTok app: open inbox, add trending audio, pick cover, then publish.'
		};
	}
	if (tiktok.privacy_level === 'SELF_ONLY') {
		return {
			kind: 'private_draft',
			statusLabel: 'Private on TikTok',
			defaultReviewNote:
				'Finish in TikTok app: add trending audio, set privacy to public, then publish.'
		};
	}
	return null;
}
