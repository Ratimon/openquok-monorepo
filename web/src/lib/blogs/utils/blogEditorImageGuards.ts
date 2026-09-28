import { toast } from '$lib/ui/sonner';

export const BLOG_TOPIC_REQUIRED_BEFORE_IMAGE_UPLOAD =
	'Choose a blog topic before you upload images.';

/** Returns false and shows a toast when `topicId` is missing (blog image uploads). */
export function requireBlogTopicForImageUpload(topicId: string | null | undefined): boolean {
	if (typeof topicId === 'string' && topicId.trim().length > 0) return true;
	toast.error(BLOG_TOPIC_REQUIRED_BEFORE_IMAGE_UPLOAD);
	return false;
}
