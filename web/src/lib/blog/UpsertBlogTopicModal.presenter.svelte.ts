import type { BlogRepository, BlogUpsertProgrammerModel } from '$lib/blog/Blog.repository.svelte';
import type { BlogTopicFormSchemaType } from '$lib/blog/blog.types';

export enum UpsertBlogTopicModalStatus {
	UNKNOWN = 'unknown',
	UPSERTING = 'upserting',
	UPSERTED = 'upserted'
}

/**
 * Blog topic create/update for the admin upsert modal (mirrors UpsertTagGroupModalPresenter pattern).
 */
export class UpsertBlogTopicModalPresenter {
	public status: UpsertBlogTopicModalStatus = $state(UpsertBlogTopicModalStatus.UNKNOWN);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(private readonly blogRepository: BlogRepository) {}

	public async createBlogTopic(
		input: Omit<BlogTopicFormSchemaType, 'id'>,
		fetch?: typeof globalThis.fetch
	): Promise<BlogUpsertProgrammerModel> {
		this.status = UpsertBlogTopicModalStatus.UPSERTING;
		const result = await this.blogRepository.upsertBlogTopic(
			{
				name: input.name,
				description: input.description,
				...(input.parent_id ? { parent_id: input.parent_id } : {})
			},
			fetch
		);
		this.applyUpsertResult(result);
		return result;
	}

	public async updateBlogTopic(
		input: BlogTopicFormSchemaType & { id: string },
		fetch?: typeof globalThis.fetch
	): Promise<BlogUpsertProgrammerModel> {
		this.status = UpsertBlogTopicModalStatus.UPSERTING;
		const resultPm = await this.blogRepository.upsertBlogTopic(
			{
				id: input.id,
				name: input.name,
				description: input.description,
				...(input.parent_id ? { parent_id: input.parent_id } : {})
			},
			fetch
		);
		this.applyUpsertResult(resultPm);
		return resultPm;
	}

	private applyUpsertResult(resultPm: BlogUpsertProgrammerModel): void {
		if (resultPm.success) {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Saved.';
			this.status = UpsertBlogTopicModalStatus.UPSERTED;
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message ?? 'Something went wrong.';
			this.status = UpsertBlogTopicModalStatus.UNKNOWN;
		}
	}
}
