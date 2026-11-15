import { describe, expect, it } from 'vitest';

import { isOpenQuokSignInMessage } from './openQuokSignInPrompt.js';

describe('isOpenQuokSignInMessage', () => {
	it('matches dashboard session errors', () => {
		expect(isOpenQuokSignInMessage('Sign in to OpenQuok on the dashboard first.')).toBe(true);
		expect(isOpenQuokSignInMessage('Sign in to OpenQuok in your browser, then try again.')).toBe(
			true
		);
	});

	it('rejects unrelated errors', () => {
		expect(isOpenQuokSignInMessage('Fill failed.')).toBe(false);
	});
});