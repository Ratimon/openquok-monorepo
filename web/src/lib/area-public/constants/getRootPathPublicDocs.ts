/** Route segment for public documentation index (no leading slash). */
export function getRootPathPublicDocs(): string {
	return 'docs';
}

/** Contributor getting-started docs: `docs/getting-started-for-dev`. */
export function getRootPathPublicDocsGettingStartedForDev(): string {
	return `${getRootPathPublicDocs()}/getting-started-for-dev`;
}

/** Self-host Docker Compose docs: `docs/installation/docker-compose`. */
export function getRootPathPublicDocsInstallationDockerCompose(): string {
	return `${getRootPathPublicDocs()}/installation/docker-compose`;
}
