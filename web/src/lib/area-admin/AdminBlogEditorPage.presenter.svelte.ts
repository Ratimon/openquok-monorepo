import type { BlogRepository } from '$lib/blog/Blog.repository.svelte';
import type { ImageRepository } from '$lib/core/Image.repository.svelte';

import type {
	BlogPostEditorViewModel,
	BlogTopicViewModel
} from '$lib/blog/GetBlog.presenter.svelte';
import type { BlogPostFormSchemaType } from '$lib/blog/blog.types';
import { BLOG_IMAGES_BUCKET } from '$lib/blog/constants/config';
import { extractBlogImageStoragePathsFromHtml } from '$lib/blog/utils';


export class AdminBlogEditorPagePresenter {
	public blogPost: BlogPostEditorViewModel | null = $state(null);
	public topicChoices: BlogTopicViewModel[] = $state([]);
	public loadingPost = $state(false);
	public loadingTopics = $state(false);
	public submitting = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	/** After update: optional second toast for removed inline image storage cleanup. */
	public showStorageInlineToast = $state(false);
	public storageInlineToastMessage = $state('');
	public storageInlineToastIsError = $state(false);
	public redirectToManager = $state(false);

	constructor(
		private readonly blogRepository: BlogRepository,
		private readonly imageRepository: ImageRepository
	) {}

	private getOrphanedBlogImageStoragePaths(
		previousHtml: string,
		nextHtml: string,
		options?: { reservedStoragePaths?: Iterable<string> }
	): string[] {
		const prev = extractBlogImageStoragePathsFromHtml(previousHtml);
		const next = extractBlogImageStoragePathsFromHtml(nextHtml);
		const reserved = new Set(
			[...(options?.reservedStoragePaths ?? [])].map((p) => p.replace(/^\/+/, '').trim()).filter(Boolean)
		);
		const orphans: string[] = [];
		for (const p of prev) {
			if (!next.has(p) && !reserved.has(p)) orphans.push(p);
		}
		return orphans;
	}

	/** Remove `blog_images` objects that were only referenced by previous HTML and are gone from the new body (and not the hero). */
	private async deleteOrphanedInlineBlogImages(
		previousHtml: string,
		nextHtml: string,
		reservedHeroPath: string
	): Promise<{ deleted: number; failed: number }> {
		const reserved = reservedHeroPath.trim() ? [reservedHeroPath.trim()] : [];
		const orphans = this.getOrphanedBlogImageStoragePaths(previousHtml, nextHtml, {
			reservedStoragePaths: reserved
		});
		let deleted = 0;
		let failed = 0;
		for (const path of orphans) {
			const { success, message } = await this.imageRepository.deleteImage(BLOG_IMAGES_BUCKET, path);
			if (success) {
				deleted += 1;
			} else {
				failed += 1;
				console.warn('[AdminBlogEditor] Failed to delete removed inline image', path, message);
			}
		}
		return { deleted, failed };
	}

	/** Load a single post by id (for edit). Returns true if found, false if not found. */
	async loadPostById(postId: string, fetch?: typeof globalThis.fetch): Promise<boolean> {
		this.loadingPost = true;
		try {
			const post = await this.blogRepository.getBlogPostById(postId, fetch);
			this.blogPost = post;
			return post != null;
		} finally {
			this.loadingPost = false;
		}
	}

	/** Load all topics for the topic dropdown. */
	async loadTopics(fetch?: typeof globalThis.fetch): Promise<void> {
		this.loadingTopics = true;
		try {
			this.topicChoices = await this.blogRepository.getBlogTopics(fetch);
		} finally {
			this.loadingTopics = false;
		}
	}

	/** Initial load: fetch post (if id) and topics. Call from page load. */
	async init(postId: string | undefined, fetch?: typeof globalThis.fetch): Promise<{ postFound: boolean }> {
		if (!postId) {
			this.blogPost = null;
		}
		const loadPost = postId ? this.loadPostById(postId, fetch) : Promise.resolve(false);
		await Promise.all([loadPost, this.loadTopics(fetch)]);
		const postFound = !postId || this.blogPost != null;
		return { postFound };
	}

	/** Submit form: create or update. Sets toast and redirectToManager on success. */
	async submit(
		formData: BlogPostFormSchemaType,
		fetch?: typeof globalThis.fetch
	): Promise<void> {
		this.submitting = true;
		this.showToastMessage = false;
		this.showStorageInlineToast = false;
		try {
			const id = formData.id ?? '';
			const isUpdate = !!id && id.length > 0;
			const resultPm = isUpdate
				? await this.blogRepository.updateBlogPost(id, formData, fetch)
				: await this.blogRepository.createBlogPost(formData, fetch);

			if (resultPm.success) {
				const { deleted, failed } = await this.deleteOrphanedInlineBlogImages(
					isUpdate ? (this.blogPost?.content ?? '') : '',
					formData.content ?? '',
					(formData.hero_image_filename ?? '').trim()
				);
				this.toastMessage = resultPm.message ?? (isUpdate ? 'Blog post updated.' : 'Blog post created.');
				this.showToastMessage = true;
				this.redirectToManager = true;

				if (isUpdate && (deleted > 0 || failed > 0)) {
					if (failed === 0) {
						this.storageInlineToastMessage =
							deleted === 1
								? 'Removed 1 unused inline image from storage.'
								: `Removed ${deleted} unused inline images from storage.`;
						this.storageInlineToastIsError = false;
					} else {
						this.storageInlineToastIsError = true;
						if (deleted === 0) {
							this.storageInlineToastMessage =
								failed === 1
									? 'Could not delete 1 removed inline image from storage.'
									: `Could not delete ${failed} removed inline images from storage.`;
						} else {
							this.storageInlineToastMessage = `Removed ${deleted} from storage; ${failed} could not be deleted.`;
						}
					}
					this.showStorageInlineToast = true;
				}
			} else {
				this.toastMessage = resultPm.message ?? 'Something went wrong.';
				this.showToastMessage = true;
			}
		} finally {
			this.submitting = false;
		}
	}

	/** Map current blog post to form default values. */
	getFormDefaults(): Partial<BlogPostFormSchemaType> {
		const p = this.blogPost;
		if (!p) {
			return {
				title: '',
				description: '',
				content: '',
				topic_id: '',
				hero_image_filename: '',
				is_sponsored: false,
				is_featured: false,
				is_user_published: false,
				is_admin_approved: false
			};
		}
		return {
			id: p.id,
			title: p.title,
			description: p.description ?? '',
			content: p.content ?? '',
			topic_id: p.topicId,
			hero_image_filename: p.heroImageFilename ?? '',
			is_sponsored: p.isSponsored,
			is_featured: p.isFeatured,
			is_user_published: p.isUserPublished,
			is_admin_approved: p.isAdminApproved
		};
	}
}
