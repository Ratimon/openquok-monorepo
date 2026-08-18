/** Append `redirectURL` so auth returns to the current tool page. */
export function withAuthRedirectQuery(authPath: string, currentPathAndSearch: string): string {
	const redirectTarget = currentPathAndSearch.trim() || '/';
	const sep = authPath.includes('?') ? '&' : '?';
	return `${authPath}${sep}redirectURL=${encodeURIComponent(redirectTarget)}`;
}

export function buildGuestComposerAuthHrefs(args: {
	signInPath: string;
	signUpPath: string;
	currentPathAndSearch: string;
}): { signInHref: string; signUpHref: string } {
	return {
		signInHref: withAuthRedirectQuery(args.signInPath, args.currentPathAndSearch),
		signUpHref: withAuthRedirectQuery(args.signUpPath, args.currentPathAndSearch)
	};
}
