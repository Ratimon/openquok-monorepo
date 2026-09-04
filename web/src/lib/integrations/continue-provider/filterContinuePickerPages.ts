import type {
	AccountConflictViewModel,
	ContinueConnectPageRow
} from '$lib/integrations/continue-provider/types';

import { socialProviderDisplayLabel } from '$data/social-providers';

export type ConnectedInternalIdRef = {
	id: string;
	internalId: string;
	identifier: string;
	inBetweenSteps: boolean;
};

export function filterContinuePickerPages(params: {
	pages: ContinueConnectPageRow[];
	connectedIntegrations: ConnectedInternalIdRef[];
	excludeIntegrationId: string;
}): {
	pages: ContinueConnectPageRow[];
	allFilteredAsAlreadyConnected: boolean;
} {
	const connectedInternalIds = new Set(
		params.connectedIntegrations
			.filter((row) => row.id !== params.excludeIntegrationId)
			.filter((row) => !row.inBetweenSteps)
			.map((row) => row.internalId.trim())
			.filter(Boolean)
	);

	const pages = params.pages.filter((page) => !connectedInternalIds.has(page.id));
	return {
		pages,
		allFilteredAsAlreadyConnected: params.pages.length > 0 && pages.length === 0
	};
}

export function buildAllPagesConnectedMessage(params: {
	originalPages: ContinueConnectPageRow[];
	connectedIntegrations: ConnectedInternalIdRef[];
	connectingProviderIdentifier: string;
	fallbackMessage: string;
}): string {
	if (params.originalPages.length !== 1) {
		return params.fallbackMessage;
	}

	const pageId = params.originalPages[0]?.id;
	if (!pageId) {
		return params.fallbackMessage;
	}

	const existing = params.connectedIntegrations.find(
		(row) => !row.inBetweenSteps && row.internalId === pageId
	);
	if (!existing) {
		return params.fallbackMessage;
	}

	const existingLabel = socialProviderDisplayLabel(existing.identifier);
	const connectingLabel = socialProviderDisplayLabel(params.connectingProviderIdentifier);
	return `This Instagram account is already connected as ${existingLabel}. Disconnect that channel, then add ${connectingLabel} again.`;
}

export function resolveAccountConflictForFilteredPages(params: {
	originalPages: ContinueConnectPageRow[];
	connectedIntegrations: ConnectedInternalIdRef[];
	excludeIntegrationId: string;
	connectingProviderIdentifier: string;
	fallbackMessage: string;
}): AccountConflictViewModel | undefined {
	if (params.originalPages.length !== 1) {
		return undefined;
	}

	const page = params.originalPages[0];
	const pageId = page?.id;
	if (!pageId) {
		return undefined;
	}

	const existing = params.connectedIntegrations.find(
		(row) =>
			row.id !== params.excludeIntegrationId && !row.inBetweenSteps && row.internalId === pageId
	);
	if (!existing) {
		return undefined;
	}

	return {
		message: buildAllPagesConnectedMessage({
			originalPages: params.originalPages,
			connectedIntegrations: params.connectedIntegrations,
			connectingProviderIdentifier: params.connectingProviderIdentifier,
			fallbackMessage: params.fallbackMessage
		}),
		existingIntegrationId: existing.id,
		existingProviderIdentifier: existing.identifier,
		accountLabel: page.name
	};
}
