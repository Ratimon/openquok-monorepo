import { describe, expect, it } from 'vitest';

import { checkFacebookLaunchValidity } from '$lib/ui/components/posts/providers/facebook/facebook.provider';

describe('checkFacebookLaunchValidity', () => {
	it('rejects follow-up comments for Facebook Stories', () => {
		expect(
			checkFacebookLaunchValidity({
				settings: { facebook: { postType: 'story' } },
				media: [{ id: 'm1', path: 'uploads/story.jpg' }],
				threadReplies: [{ id: 'r1', message: 'Nice!', delaySeconds: 0 }]
			})
		).toBe('Follow-up comments are not supported for Facebook Stories');
	});

	it('allows Facebook Stories without follow-up replies', () => {
		expect(
			checkFacebookLaunchValidity({
				settings: { facebook: { postType: 'story' } },
				media: [{ id: 'm1', path: 'uploads/story.jpg' }],
				threadReplies: []
			})
		).toBe(true);
	});
});
