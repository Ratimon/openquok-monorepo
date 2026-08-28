class AccountSidebarTourPresenter {
	/** When true, a blocking first-run modal is open—defer sidebar feature tours. */
	firstRunBlocksTours = $state(false);

	setFirstRunBlocksTours(block: boolean): void {
		if (this.firstRunBlocksTours === block) return;
		this.firstRunBlocksTours = block;
	}
}

export const accountSidebarTourPresenter = new AccountSidebarTourPresenter();
