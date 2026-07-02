export type ListingPublishStatus = 'draft' | 'awaiting_approval' | 'published';

export type ListingPublishStatusBadge = {
	status: ListingPublishStatus;
	label: string;
	className: string;
};

export function getListingPublishStatusBadge(
	isUserPublished?: boolean,
	isAdminPublished?: boolean
): ListingPublishStatusBadge | null {
	if (isUserPublished == null && isAdminPublished == null) return null;

	if (!isUserPublished) {
		return {
			status: 'draft',
			label: 'Draft',
			className: 'badge badge-info badge-sm'
		};
	}

	if (!isAdminPublished) {
		return {
			status: 'awaiting_approval',
			label: 'Awaiting approval',
			className: 'badge badge-warning badge-sm'
		};
	}

	return {
		status: 'published',
		label: 'Published',
		className: 'badge badge-success badge-sm'
	};
}
