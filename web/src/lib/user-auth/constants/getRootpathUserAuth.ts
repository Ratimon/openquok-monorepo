export function getRootPathSignin(): string {
	return 'sign-in';
}

export function getRootPathSignup(): string {
	return 'sign-up';
}

export function getRootPathForgotPassword(): string {
	return 'forgot-password';
}

export function getRootPathUpdatePassword(): string {
	return 'update-password';
}

export function getRootPathVerifySignup(): string {
	return 'verify-signup';
}

export function getRootPathConfirmChangePassword(): string {
	return 'confirm-change-password';
}

export function getRootPathAuthError(): string {
	return 'auth-error';
}

/** Public invite accept page. */
export function getRootPathJoinOrg(): string {
	return 'join-org';
}

/** Third-party OAuth approve UI. */
export function getRootPathOauthAuthorize(): string {
	return 'oauth/authorize';
}

function pathnameFromSegment(segment: string): string {
	return segment.startsWith('/') ? segment : `/${segment}`;
}

function normalizePathname(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith('/')) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

/** Short document title (before `| company`) for auth routes. */
export function getAuthDocumentTitle(pathname: string): string {
	const titles: Record<string, string> = {
		[pathnameFromSegment(getRootPathSignin())]: 'Sign in',
		[pathnameFromSegment(getRootPathSignup())]: 'Sign up',
		[pathnameFromSegment(getRootPathForgotPassword())]: 'Forgot password',
		[pathnameFromSegment(getRootPathUpdatePassword())]: 'Update password',
		[pathnameFromSegment(getRootPathVerifySignup())]: 'Verify email',
		[pathnameFromSegment(getRootPathConfirmChangePassword())]: 'Confirm change password',
		[pathnameFromSegment(getRootPathAuthError())]: 'Sign-in error'
	};
	return titles[normalizePathname(pathname)] ?? 'Sign in';
}
