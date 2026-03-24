import type { BlogRepository } from '$lib/blog/Blog.repository.svelte';
import type { BlogTopicViewModel } from '$lib/blog/GetBlog.presenter.svelte';
import { sortTopics } from '$lib/blog/utils/parentPathCreator';

export class AdminBlogTopicsManagerPagePresenter {
	public allTopicsToManageVm: BlogTopicViewModel[] = $state([]);
	public loading = $state(false);

	constructor(private readonly blogRepository: BlogRepository) {}

	public async loadAllTopics(fetch?: typeof globalThis.fetch): Promise<BlogTopicViewModel[]> {
		this.loading = true;
		try {
			const topics = await this.blogRepository.getBlogTopics(fetch);
			this.allTopicsToManageVm = sortTopics(topics);
			return this.allTopicsToManageVm;
		} finally {
			this.loading = false;
		}
	}

	/** Merge a newly created topic into the list (no refetch). */
	public addBlogTopic(vm: BlogTopicViewModel): void {
		this.allTopicsToManageVm = sortTopics([...this.allTopicsToManageVm, vm]);
	}

	/** Replace an existing topic in the list (no refetch). */
	public updateBlogTopic(vm: BlogTopicViewModel): void {
		const existingIndex = this.allTopicsToManageVm.findIndex((t) => t.id === vm.id);
		if (existingIndex < 0) {
			this.addBlogTopic(vm);
			return;
		}
		this.allTopicsToManageVm = sortTopics([
			...this.allTopicsToManageVm.slice(0, existingIndex),
			vm,
			...this.allTopicsToManageVm.slice(existingIndex + 1)
		]);
	}

	/** Remove a topic from the list after successful delete (no refetch). */
	public removeBlogTopic(topicId: string): void {
		this.allTopicsToManageVm = this.allTopicsToManageVm.filter((t) => t.id !== topicId);
	}
}
