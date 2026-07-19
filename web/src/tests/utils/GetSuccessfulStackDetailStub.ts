import type { StackDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

export function GetSuccessfulStackDetailStub(): StackDetailViewModel {
	return {
		id: 'stack-1',
		title: 'Test Playbook',
		slug: 'test-playbook',
		excerpt: 'Playbook excerpt',
		description: 'Playbook description',
		content: '# Playbook content',
		skillName: 'test-playbook-skill',
		version: '1.0.0',
		license: 'MIT',
		stackBlueprint: null,
		logoImageUrl: 'https://example.com/playbook-logo.jpg',
		sourceRepoUrl: 'https://example.com/repo',
		likes: 12,
		views: 240,
		clicks: 30,
		averageRating: 4.5,
		ratingsCount: 8,
		createdAt: '2024-01-01T00:00:00Z',
		publishedAt: '2024-01-02T00:00:00Z',
		category: {
			id: 'category-1',
			name: 'Automation',
			slug: 'automation',
			parentPath: '/automation'
		},
		tags: [
			{ id: 'tag-1', name: 'CLI', slug: 'cli' },
			{ id: 'tag-2', name: 'Workflow', slug: 'workflow' }
		],
		owner: {
			id: 'owner-1',
			username: 'testuser',
			fullName: 'Test User',
			avatarUrl: 'https://example.com/avatar.jpg',
			tagLine: 'Builder'
		},
		stackMembers: []
	};
}
