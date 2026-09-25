import { describe, expect, it } from 'vitest';

import {
	buildCursorMcpInstallDeeplink,
	buildCursorPromptDeeplink
} from '$lib/docs/utils/site/cursorDeeplinks';

describe('buildCursorMcpInstallDeeplink', () => {
	it('matches Cursor install-link shape (name + base64 config)', () => {
		const link = buildCursorMcpInstallDeeplink('OpenQuok Documentation', {
			url: 'https://www.openquok.com/mcp'
		});
		expect(link).toMatch(/^cursor:\/\/anysphere\.cursor-deeplink\/mcp\/install\?/);
		expect(link).toContain('name=OpenQuok+Documentation');
		const configParam = new URL(link).searchParams.get('config');
		expect(configParam).toBeTruthy();
		const decoded = JSON.parse(atob(configParam!));
		expect(decoded).toEqual({ url: 'https://www.openquok.com/mcp' });
	});

	it('URL-encodes special characters in the display name', () => {
		const link = buildCursorMcpInstallDeeplink('Docs & More', { url: 'https://example.com/mcp' });
		expect(link).toContain('name=Docs+%26+More');
		expect(link).not.toContain('name=Docs & More');
	});
});

describe('buildCursorPromptDeeplink', () => {
	it('sets the prompt text query param', () => {
		const link = buildCursorPromptDeeplink('Read from https://example.com/docs/foo');
		expect(link).toMatch(/^cursor:\/\/anysphere\.cursor-deeplink\/prompt\?/);
		expect(new URL(link).searchParams.get('text')).toBe('Read from https://example.com/docs/foo');
	});
});
