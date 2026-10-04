import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/ui/sonner', () => ({
	toast: {
		success: vi.fn()
	}
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

import { goto } from '$app/navigation';
import { toast } from '$lib/ui/sonner';
import { showListingBookmarkToast } from '$lib/listings/GetListing.presenter.svelte';

describe('showListingBookmarkToast', () => {
	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(goto).mockClear();
	});

	it('shows Saved → Libs → Bookmarked copy for building blocks', () => {
		showListingBookmarkToast(true, 'extension');

		expect(toast.success).toHaveBeenCalledWith(
			'Building block bookmarked. Create your own under Saved → Libs → Bookmarked.',
			expect.objectContaining({
				action: expect.objectContaining({ label: 'Create' })
			})
		);
	});

	it('uses Playbook label for stacks', () => {
		showListingBookmarkToast(true, 'stack');

		expect(toast.success).toHaveBeenCalledWith(
			'Playbook bookmarked. View it under Saved → Libs → Bookmarked.',
			expect.any(Object)
		);
	});

	it('shows removed message when unbookmarking', () => {
		showListingBookmarkToast(false);

		expect(toast.success).toHaveBeenCalledWith('Bookmark removed.');
	});
});
