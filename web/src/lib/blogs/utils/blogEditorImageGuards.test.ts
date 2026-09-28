import { describe, expect, it, vi } from 'vitest';

import {
	BLOG_TOPIC_REQUIRED_BEFORE_IMAGE_UPLOAD,
	requireBlogTopicForImageUpload
} from '$lib/blogs/utils/blogEditorImageGuards';

vi.mock('$lib/ui/sonner', () => ({
	toast: { error: vi.fn() }
}));

describe('requireBlogTopicForImageUpload', () => {
	it('returns true when topic id is set', () => {
		expect(requireBlogTopicForImageUpload('d5f7a000-0000-4000-a000-000000000403')).toBe(true);
	});

	it('returns false and toasts when topic id is missing', async () => {
		const { toast } = await import('$lib/ui/sonner');
		vi.mocked(toast.error).mockClear();

		expect(requireBlogTopicForImageUpload('')).toBe(false);
		expect(requireBlogTopicForImageUpload(null)).toBe(false);
		expect(toast.error).toHaveBeenCalledWith(BLOG_TOPIC_REQUIRED_BEFORE_IMAGE_UPLOAD);
	});
});
