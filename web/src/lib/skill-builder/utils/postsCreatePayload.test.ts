import { describe, expect, it } from 'vitest';

import {
	defaultPostsCreateFormFields,
	fieldsToPostsCreatePayload,
	postsCreatePayloadToFields
} from '$lib/skill-builder/utils/postsCreatePayload';

describe('postsCreatePayload', () => {
	it('round-trips form fields to API payload shape', () => {
		const fields = {
			...defaultPostsCreateFormFields(),
			body: 'Hello world',
			integrationId: 'abc-123'
		};

		const payload = fieldsToPostsCreatePayload(fields);
		expect(payload).toEqual({
			scheduledAt: fields.scheduledAt,
			status: 'scheduled',
			body: 'Hello world',
			integrationIds: ['abc-123']
		});

		expect(postsCreatePayloadToFields(payload)).toEqual(fields);
	});
});
