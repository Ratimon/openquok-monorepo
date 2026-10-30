import { describe, expect, it } from 'vitest';

import {
	buildSocialComposerDraftFromContextMenu,
	SOCIAL_CONTEXT_MENU_IDS,
} from './contextMenu.js';
import { applySocialComposerDraftToBody } from './sessionDraftStorage.js';

describe('buildSocialComposerDraftFromContextMenu', () => {
	it('maps selection text to body', () => {
		const draft = buildSocialComposerDraftFromContextMenu(
			{
				menuItemId: SOCIAL_CONTEXT_MENU_IDS.SHARE_SELECTION,
				selectionText: 'Hello world',
				pageUrl: 'https://example.com/post',
			},
			{ title: 'Example', url: 'https://example.com/post' } as chrome.tabs.Tab
		);
		expect(draft).toEqual({
			source: 'selection',
			body: 'Hello world',
			pageUrl: 'https://example.com/post',
			pageTitle: 'Example',
		});
	});

	it('maps link share to link URL in body', () => {
		const draft = buildSocialComposerDraftFromContextMenu(
			{
				menuItemId: SOCIAL_CONTEXT_MENU_IDS.SHARE_LINK,
				linkUrl: 'https://example.com/article',
				pageUrl: 'https://example.com/',
			},
			{ title: 'Example home' } as chrome.tabs.Tab
		);
		expect(draft?.body).toBe('Example home\n\nhttps://example.com/article');
	});

	it('maps page share to title and URL', () => {
		const draft = buildSocialComposerDraftFromContextMenu(
			{
				menuItemId: SOCIAL_CONTEXT_MENU_IDS.SHARE_PAGE,
				pageUrl: 'https://example.com/',
			},
			{ title: 'Example home' } as chrome.tabs.Tab
		);
		expect(draft?.body).toBe('Example home\n\nhttps://example.com/');
		expect(draft?.source).toBe('page');
	});

	it('maps image share to title and media URL', () => {
		const draft = buildSocialComposerDraftFromContextMenu(
			{
				menuItemId: SOCIAL_CONTEXT_MENU_IDS.SHARE_IMAGE,
				srcUrl: 'https://cdn.example.com/photo.jpg',
				pageUrl: 'https://example.com/gallery',
			},
			{ title: 'Gallery' } as chrome.tabs.Tab
		);
		expect(draft).toMatchObject({
			source: 'image',
			body: 'Gallery',
			mediaUrl: 'https://cdn.example.com/photo.jpg',
		});
	});

	it('returns null for empty selection', () => {
		const draft = buildSocialComposerDraftFromContextMenu(
			{
				menuItemId: SOCIAL_CONTEXT_MENU_IDS.SHARE_SELECTION,
				selectionText: '   ',
			},
			undefined
		);
		expect(draft).toBeNull();
	});
});

describe('applySocialComposerDraftToBody', () => {
	it('appends media URL when not already in body', () => {
		const body = applySocialComposerDraftToBody({
			source: 'image',
			body: 'Gallery',
			mediaUrl: 'https://cdn.example.com/photo.jpg',
		});
		expect(body).toBe('Gallery\n\nhttps://cdn.example.com/photo.jpg');
	});
});
