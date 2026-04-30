import type { AdminBlogActivityVm } from '$lib/blogs/blog.types';
import type { GetBlogPresenter } from '$lib/blogs/GetBlog.presenter.svelte';

export class AdminBlogActivitiesManagerPagePresenter {
	public activitiesToManageVm: AdminBlogActivityVm[] = $state([]);
	public loading = $state(false);

	constructor(private readonly getBlogPresenter: GetBlogPresenter) {}

	public async loadActivities(fetch?: typeof globalThis.fetch): Promise<AdminBlogActivityVm[]> {
		this.loading = true;
		try {
			const activities = await this.getBlogPresenter.loadAdminActivitiesVm({ limit: 100 }, fetch);
			this.activitiesToManageVm = activities;
			return this.activitiesToManageVm;
		} finally {
			this.loading = false;
		}
	}
}
