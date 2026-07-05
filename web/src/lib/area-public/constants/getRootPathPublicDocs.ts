/** Route segment for public documentation index (no leading slash). */
export function getRootPathPublicDocs(): string {
	return 'docs';
}

/** Self-hosted setup docs: `docs/getting-started-for-dev`. */
export function getRootPathPublicDocsGettingStartedForDev(): string {
	return `${getRootPathPublicDocs()}/getting-started-for-dev`;
}
