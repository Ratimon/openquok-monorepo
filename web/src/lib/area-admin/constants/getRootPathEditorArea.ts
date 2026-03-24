/**
 * Root path for editor-only area (within protected routes).
 */
export function getRootPathEditorArea(): string {
	return 'editor';
}

/**
 * Segment for editor feedback manager (use with getRootPathEditorArea).
 */
export function getRootPathFeedbackManager(): string {
	return 'feedback-manager';
}

/**
 * Full path for editor feedback manager.
 */
export function getRootPathEditorFeedbackManager(): string {
	return `${getRootPathEditorArea()}/${getRootPathFeedbackManager()}`;
}
