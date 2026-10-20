import type { IColumn } from '@svar-ui/svelte-grid';
import { describe, expect, it } from 'vitest';

import { ProductDirectoryChannelsGridTablePresenter } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

function columnHidden(columns: IColumn[], id: string): boolean {
	const col = columns.find((c) => c.id === id);
	return Boolean(col?.hidden);
}

describe('ProductDirectoryChannelsGridTablePresenter responsive columns', () => {
	const presenter = new ProductDirectoryChannelsGridTablePresenter();

	it('hides narrow-only columns at typical phone widths', () => {
		const columns = presenter.getGridColumnsForHostWidth(480);
		expect(columnHidden(columns, 'listUrlDisplay')).toBe(true);
		expect(columnHidden(columns, 'catalogDrUpdatedDisplay')).toBe(true);
		expect(columnHidden(columns, 'readinessDisplay')).toBe(true);
		expect(columnHidden(columns, 'authEmailDisplay')).toBe(true);
	});

	it('shows list URL and DR updated on medium widths', () => {
		const columns = presenter.getGridColumnsForHostWidth(960);
		expect(columnHidden(columns, 'listUrlDisplay')).toBe(false);
		expect(columnHidden(columns, 'catalogDrUpdatedDisplay')).toBe(false);
		expect(columnHidden(columns, 'readinessDisplay')).toBe(true);
	});

	it('shows all optional columns on wide layouts', () => {
		const columns = presenter.getGridColumnsForHostWidth(1280);
		expect(columnHidden(columns, 'listUrlDisplay')).toBe(false);
		expect(columnHidden(columns, 'catalogDrUpdatedDisplay')).toBe(false);
		expect(columnHidden(columns, 'readinessDisplay')).toBe(false);
		expect(columnHidden(columns, 'authEmailDisplay')).toBe(false);
	});
});
