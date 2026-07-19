import type { StacksHubViewModel } from '$lib/listings/GetListing.presenter.svelte';

export function GetSuccessfulStacksHubStub(): StacksHubViewModel {
	return {
		stacks: [
			{
				id: 'stack-1',
				title: 'Test Playbook',
				slug: 'test-playbook',
				excerpt: 'Playbook excerpt',
				description: 'Playbook description',
				logoImageUrl: 'https://example.com/playbook-logo.jpg',
				likes: 12,
				views: 240,
				memberCount: 3,
				isOfficial: true,
				createdAt: '2024-01-01T00:00:00Z',
				category: { id: 'category-1', name: 'Automation', slug: 'automation' },
				tags: [
					{ id: 'tag-1', name: 'CLI', slug: 'cli' },
					{ id: 'tag-2', name: 'Workflow', slug: 'workflow' }
				],
				ownerUsername: 'testuser'
			},
			{
				id: 'stack-2',
				title: 'Community Playbook',
				slug: 'community-playbook',
				excerpt: 'Community excerpt',
				description: 'Community description',
				logoImageUrl: null,
				likes: 4,
				views: 80,
				memberCount: 1,
				isOfficial: false,
				createdAt: '2024-02-01T00:00:00Z',
				category: { id: 'category-2', name: 'Content', slug: 'content' },
				tags: [{ id: 'tag-3', name: 'Social', slug: 'social' }],
				ownerUsername: 'creator'
			}
		],
		categories: [
			{ id: 'category-1', name: 'Automation', slug: 'automation' },
			{ id: 'category-2', name: 'Content', slug: 'content' }
		],
		totalCount: 2
	};
}
