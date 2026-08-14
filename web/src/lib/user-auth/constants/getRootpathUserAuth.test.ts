import { describe, expect, it } from 'vitest';

import { getAuthDocumentTitle } from '$lib/user-auth/constants/getRootpathUserAuth';

describe('getAuthDocumentTitle', () => {
	it('maps each auth pathname to a distinct title', () => {
		expect(getAuthDocumentTitle('/sign-in')).toBe('Sign in');
		expect(getAuthDocumentTitle('/sign-up')).toBe('Sign up');
		expect(getAuthDocumentTitle('/forgot-password')).toBe('Forgot password');
		expect(getAuthDocumentTitle('/verify-signup')).toBe('Verify email');
		expect(getAuthDocumentTitle('/confirm-change-password')).toBe('Confirm change password');
		expect(getAuthDocumentTitle('/auth-error')).toBe('Sign-in error');
	});

	it('strips a trailing slash before lookup', () => {
		expect(getAuthDocumentTitle('/sign-in/')).toBe('Sign in');
	});
});
