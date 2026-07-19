import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';

export function GetSuccessfulListingCommentsStub(): ListingCommentViewModel[] {
	return [
		{
			id: 'comment-1',
			content: 'Great playbook!',
			isApproved: true,
			createdAt: '2024-01-03T00:00:00Z',
			updatedAt: null,
			parentId: null,
			userId: 'user-1',
			author: {
				id: 'user-1',
				fullName: 'Commenter One',
				avatarUrl: 'https://example.com/user-1.jpg'
			}
		},
		{
			id: 'comment-2',
			content: 'Thanks for sharing.',
			isApproved: true,
			createdAt: '2024-01-04T00:00:00Z',
			updatedAt: null,
			parentId: 'comment-1',
			userId: 'user-2',
			author: {
				id: 'user-2',
				fullName: 'Commenter Two',
				avatarUrl: null
			}
		}
	];
}
