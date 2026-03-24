import type { GetBlogPresenter } from '$lib/blog/GetBlog.presenter.svelte';
import type { BlogPostViewModel } from '$lib/blog/GetBlog.presenter.svelte';
import type { ImageRepository } from '$lib/core/Image.repository.svelte';

import { BLOG_IMAGES_BUCKET } from '$lib/blog/constants/config';
import { extractBlogImageStoragePathsFromHtml } from '$lib/blog/utils';

export type PostDeleteStorageCleanupResultVm =
	| { kind: 'none' }
	| { kind: 'ok'; deletedCount: number }
	| { kind: 'failed'; failedPaths: string[]; deletedCount: number };

export class AdminBlogPostsManagerPagePresenter {
	public allPostsToManageVm: BlogPostViewModel[] = $state([]);
	public loading = $state(false);

	constructor(
		private readonly getBlogPresenter: GetBlogPresenter,
		private readonly imageRepository: ImageRepository
	) {}

	public async loadAllPosts(fetch?: typeof globalThis.fetch): Promise<BlogPostViewModel[]> {
		this.loading = true;
		try {
			const posts = await this.getBlogPresenter.loadAdminPosts(fetch);
			this.allPostsToManageVm = posts;
			return this.allPostsToManageVm;
		} finally {
			this.loading = false;
		}
	}

	/** In-memory list update after successful delete (HTTP runs in `deleteBlogPostVerificationPresenter`). */
	public removeBlogPost(postId: string): void {
		this.allPostsToManageVm = this.allPostsToManageVm.filter((p) => p.id !== postId);
	}

	/**
	 * After the delete API succeeds: drop the row locally and remove hero + inline `blog_images` objects
	 * referenced by the post (deduped paths).
	 */
	public async removeBlogPostAndCleanupStorage(post: {
		id: string;
		heroImageFilename?: string | null;
		content?: string | null;
	}): Promise<PostDeleteStorageCleanupResultVm> {
		this.removeBlogPost(post.id);

		const paths = new Set<string>();
		const hero = (post.heroImageFilename ?? '').trim();
		if (hero) paths.add(hero);
		for (const p of extractBlogImageStoragePathsFromHtml(post.content ?? '')) {
			paths.add(p);
		}

		if (paths.size === 0) return { kind: 'none' };

		const failedPaths: string[] = [];
		let deletedCount = 0;
		for (const path of paths) {
			const result = await this.imageRepository.deleteImage(BLOG_IMAGES_BUCKET, path);
			if (result.success) deletedCount += 1;
			else failedPaths.push(path);
		}

		if (failedPaths.length === 0) return { kind: 'ok', deletedCount };
		return { kind: 'failed', failedPaths, deletedCount };
	}
}
