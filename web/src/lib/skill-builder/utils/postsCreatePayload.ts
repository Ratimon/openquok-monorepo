export type PostsCreateFormFields = {
	scheduledAt: string;
	status: 'draft' | 'scheduled';
	body: string;
	integrationId: string;
};

export function defaultPostsCreatePayload(): Record<string, unknown> {
	return fieldsToPostsCreatePayload(defaultPostsCreateFormFields());
}

export function defaultPostsCreateFormFields(): PostsCreateFormFields {
	return {
		scheduledAt: '2026-01-01T12:00:00.000Z',
		status: 'scheduled',
		body: 'Carousel caption — links in bio.',
		integrationId: '<integration-id>'
	};
}

export function fieldsToPostsCreatePayload(fields: PostsCreateFormFields): Record<string, unknown> {
	const integrationId = fields.integrationId.trim() || '<integration-id>';

	return {
		scheduledAt: fields.scheduledAt.trim() || '2026-01-01T12:00:00.000Z',
		status: fields.status,
		body: fields.body,
		integrationIds: [integrationId]
	};
}

export function postsCreatePayloadToFields(
	payload: Record<string, unknown> | undefined
): PostsCreateFormFields {
	const defaults = defaultPostsCreateFormFields();
	if (!payload) return defaults;

	const integrationIds = Array.isArray(payload.integrationIds)
		? payload.integrationIds.map(String)
		: [];
	const status = payload.status === 'draft' ? 'draft' : 'scheduled';

	return {
		scheduledAt: typeof payload.scheduledAt === 'string' ? payload.scheduledAt : defaults.scheduledAt,
		status,
		body: typeof payload.body === 'string' ? payload.body : defaults.body,
		integrationId: integrationIds[0] ?? defaults.integrationId
	};
}

export function isPostsCreateCommand(commandName: string): boolean {
	return commandName === 'posts:create';
}

/** Only posts:create exports a JSON body block in Core Workflow markdown. */
export function supportsWorkflowJsonPayload(commandName: string): boolean {
	return isPostsCreateCommand(commandName);
}
