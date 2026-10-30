/** Session-scoped composer draft written by the context menu and read by the Social tab. */

export const SOCIAL_SESSION_DRAFT_STORAGE_KEY = 'openquok.socialComposerDraft';

export type SocialComposerDraftSource = 'selection' | 'page' | 'image';

export type SocialComposerSessionDraft = {
	source: SocialComposerDraftSource;
	body: string;
	mediaUrl?: string;
	pageUrl?: string;
	pageTitle?: string;
	createdAt: number;
};

export type SocialComposerDraftInput = Omit<SocialComposerSessionDraft, 'createdAt'>;

export function applySocialComposerDraftToBody(draft: SocialComposerDraftInput): string {
	const body = draft.body.trim();
	const mediaUrl = draft.mediaUrl?.trim();
	if (!mediaUrl) return body;
	if (!body) return mediaUrl;
	if (body.includes(mediaUrl)) return body;
	return `${body}\n\n${mediaUrl}`;
}

export async function writeSocialComposerDraft(draft: SocialComposerDraftInput): Promise<void> {
	await chrome.storage.session.set({
		[SOCIAL_SESSION_DRAFT_STORAGE_KEY]: {
			...draft,
			createdAt: Date.now(),
		} satisfies SocialComposerSessionDraft,
	});
}

export async function peekSocialComposerDraft(): Promise<SocialComposerSessionDraft | null> {
	const result = await chrome.storage.session.get(SOCIAL_SESSION_DRAFT_STORAGE_KEY);
	const raw = result[SOCIAL_SESSION_DRAFT_STORAGE_KEY];
	if (!raw || typeof raw !== 'object') return null;
	const record = raw as Record<string, unknown>;
	if (typeof record.body !== 'string' || typeof record.source !== 'string') return null;
	if (record.source !== 'selection' && record.source !== 'page' && record.source !== 'image') {
		return null;
	}
	return {
		source: record.source,
		body: record.body,
		mediaUrl: typeof record.mediaUrl === 'string' ? record.mediaUrl : undefined,
		pageUrl: typeof record.pageUrl === 'string' ? record.pageUrl : undefined,
		pageTitle: typeof record.pageTitle === 'string' ? record.pageTitle : undefined,
		createdAt: typeof record.createdAt === 'number' ? record.createdAt : Date.now(),
	};
}

export async function readAndClearSocialComposerDraft(): Promise<SocialComposerSessionDraft | null> {
	const draft = await peekSocialComposerDraft();
	if (draft) {
		await clearSocialComposerDraft();
	}
	return draft;
}

export async function clearSocialComposerDraft(): Promise<void> {
	await chrome.storage.session.remove(SOCIAL_SESSION_DRAFT_STORAGE_KEY);
}
