export type TopicLike = {
	id: string;
	name: string;
	parentId?: string | null;
};

/**
 * Creates a path string for a topic, showing its position in the hierarchy.
 * Example: "Parent > Child > Grandchild"
 */
export function createTopicPath<T extends TopicLike>(topic: T, allTopics: T[]): string {
	const path: string[] = [topic.name];
	let current: T | undefined = topic;

	while (current && current.parentId) {
		const parentTopic = allTopics.find((t) => t.id === current!.parentId);
		if (!parentTopic) break;
		path.unshift(parentTopic.name);
		current = parentTopic;
	}

	return path.join(' > ');
}

/**
 * Sorts topics by parent path (hierarchy path).
 */
export function sortTopics<T extends TopicLike>(topics: T[]): T[] {
	const safeAll = [...topics];
	return safeAll.sort((a, b) => createTopicPath(a, safeAll).localeCompare(createTopicPath(b, safeAll)));
}

/**
 * Creates a sorted list of topic choices for a parent dropdown.
 * Each topic's label includes its full path in the hierarchy.
 */
export function createSortedTopicChoices<T extends TopicLike>(topics: T[]): { value: string; label: string }[] {
	const safeAll = [...topics];
	return safeAll
		.map((topic) => ({
			value: topic.id,
			label: createTopicPath(topic, safeAll)
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
}
