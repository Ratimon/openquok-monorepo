import type { BlogTopicProgrammerModel } from '$lib/blogs/Blog.repository.svelte';
import { stringToSlug } from '$lib/ui/helpers/common';

/**
 * Builds a topic view model after create/update for optimistic list updates (no refetch).
 * Slug is derived from name to match server slug rules until the next full load.
 */
export function buildBlogTopicViewModelFromUpsert(params: {
	id: string;
	name: string;
	description: string;
	parentId: string | null | undefined;
	allTopics: Pick<BlogTopicProgrammerModel, 'id' | 'name' | 'slug'>[];
}): BlogTopicProgrammerModel {
	const parentId = params.parentId ?? null;
	const parentRow = parentId ? params.allTopics.find((t) => t.id === parentId) : undefined;
	const parent = parentRow
		? { id: parentRow.id, name: parentRow.name, slug: parentRow.slug }
		: null;

	return {
		id: params.id,
		name: params.name,
		slug: stringToSlug(params.name),
		description: params.description || null,
		parentId,
		parent
	};
}
