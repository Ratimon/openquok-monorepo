/** Shared copy: scheduling is user-controlled (publish now, schedule, or draft + approve). */

export const WORKFLOW_PUBLISH_CHOICE_SENTENCE =
	'You can publish now, schedule for later, or save drafts and approve on OpenQuok when you are ready.';

export const CHANNEL_QUEUE_PUBLISH_CHOICE_SUFFIX =
	'Queue posts, then publish now, schedule for later, or approve on the calendar or kanban.';

export const MCP_CLIENT_PUBLISH_CHOICE_TAGLINE =
	'Publish now, schedule for later, or approve drafts on the calendar or kanban.';

export const COMPARISON_PUBLISH_CHOICE_FEATURE =
	'You choose publish-now, schedule, or draft — approve on OpenQuok when you want a review step';

export function buildPublishApprovalFaqAnswer(callee: string): string {
	return `It depends on you. You can ask ${callee} to publish now when the copy is ready, or save drafts and scheduled posts and approve them later on the OpenQuok calendar or kanban. Tell ${callee} to use draft-only or not to publish when you want a review step first.`;
}

export const PUBLISH_APPROVAL_FAQ_TITLE = 'publish immediately or wait for approval?';
