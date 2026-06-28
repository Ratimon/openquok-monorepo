import type { AdminListingActivityVm } from '$lib/listings/listing.types';
import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';

export class AdminListingActivitiesManagerPagePresenter {
	public activitiesToManageVm: AdminListingActivityVm[] = $state([]);
	public loading = $state(false);

	constructor(private readonly getListingPresenter: GetListingPresenter) {}

	public async loadActivities(fetch?: typeof globalThis.fetch): Promise<AdminListingActivityVm[]> {
		this.loading = true;
		try {
			const activities = await this.getListingPresenter.loadAdminActivitiesVm({ limit: 100 }, fetch);
			this.activitiesToManageVm = activities;
			return this.activitiesToManageVm;
		} finally {
			this.loading = false;
		}
	}
}
