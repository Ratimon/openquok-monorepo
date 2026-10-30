import { describe, expect, it } from 'vitest';

import { isExtensionContextInvalidatedError } from './extensionRuntime.js';

describe('isExtensionContextInvalidatedError', () => {
	it('detects Chrome invalidated-context message', () => {
		expect(isExtensionContextInvalidatedError(new Error('Extension context invalidated.'))).toBe(
			true
		);
		expect(isExtensionContextInvalidatedError(new Error('network'))).toBe(false);
	});
});
