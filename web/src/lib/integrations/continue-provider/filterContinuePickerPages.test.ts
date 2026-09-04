import { describe, expect, it } from 'vitest';

import {
	buildAllPagesConnectedMessage,
	filterContinuePickerPages
} from '$lib/integrations/continue-provider/filterContinuePickerPages';

const page = { id: '17841414302190559', name: '@openquok', pictureUrl: '', pageId: '123' };

describe('filterContinuePickerPages', () => {
	it('removes picker rows whose id matches a connected internal_id', () => {
		const result = filterContinuePickerPages({
			pages: [page, { id: '999', name: 'Other', pictureUrl: '', pageId: '456' }],
			connectedIntegrations: [
				{
					id: 'existing-1',
					internalId: page.id,
					identifier: 'instagram-standalone',
					inBetweenSteps: false
				}
			],
			excludeIntegrationId: 'in-progress'
		});

		expect(result.pages).toEqual([{ id: '999', name: 'Other', pictureUrl: '', pageId: '456' }]);
		expect(result.allFilteredAsAlreadyConnected).toBe(false);
	});

	it('ignores the in-progress integration and between-steps rows', () => {
		const result = filterContinuePickerPages({
			pages: [page],
			connectedIntegrations: [
				{
					id: 'in-progress',
					internalId: 'fb-user',
					identifier: 'instagram-business',
					inBetweenSteps: true
				}
			],
			excludeIntegrationId: 'in-progress'
		});

		expect(result.pages).toEqual([page]);
		expect(result.allFilteredAsAlreadyConnected).toBe(false);
	});

	it('flags when every row was filtered out', () => {
		const result = filterContinuePickerPages({
			pages: [page],
			connectedIntegrations: [
				{
					id: 'existing-1',
					internalId: page.id,
					identifier: 'instagram-standalone',
					inBetweenSteps: false
				}
			],
			excludeIntegrationId: 'in-progress'
		});

		expect(result.pages).toEqual([]);
		expect(result.allFilteredAsAlreadyConnected).toBe(true);
	});
});

describe('buildAllPagesConnectedMessage', () => {
	it('names the existing provider when a single account conflicts', () => {
		const message = buildAllPagesConnectedMessage({
			originalPages: [page],
			connectedIntegrations: [
				{
					id: 'existing-1',
					internalId: page.id,
					identifier: 'instagram-standalone',
					inBetweenSteps: false
				}
			],
			connectingProviderIdentifier: 'instagram-business',
			fallbackMessage: 'Fallback'
		});

		expect(message).toBe(
			'This Instagram account is already connected as Instagram (Standalone). Disconnect that channel, then add Instagram (Business) again.'
		);
	});

	it('uses the fallback when multiple accounts were filtered', () => {
		const message = buildAllPagesConnectedMessage({
			originalPages: [page, { id: '999', name: 'Other', pictureUrl: '', pageId: '456' }],
			connectedIntegrations: [],
			connectingProviderIdentifier: 'instagram-business',
			fallbackMessage: 'Every account is already connected.'
		});

		expect(message).toBe('Every account is already connected.');
	});
});
