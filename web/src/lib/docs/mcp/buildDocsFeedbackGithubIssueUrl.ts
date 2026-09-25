/** Build a GitHub "new issue" URL for documentation feedback (v1: no server persistence). */
export function buildDocsFeedbackGithubIssueUrl(
	githubRepoUrl: string,
	path: string,
	message: string
): string | null {
	const githubRepo = githubRepoUrl.trim();
	if (!githubRepo) return null;

	const issueBase = githubRepo.replace(/\/?$/, '/issues/new');
	const title = encodeURIComponent(`Docs feedback: ${path}`);
	const body = encodeURIComponent(`Path: ${path}\n\n${message}`);
	return `${issueBase}?title=${title}&body=${body}`;
}
