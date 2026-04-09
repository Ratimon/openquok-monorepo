/**
 * Integration DTOs for API responses.
 *
 * Notes:
 * - Session routes under `/integrations` return camelCase fields.
 * - These DTOs describe the JSON shapes sent to the web client.
 */
export interface IntegrationCatalogItemDTO {
    name: string;
    identifier: string;
    toolTip?: string;
    editor?: string;
    isExternal?: boolean;
    isWeb3?: boolean;
    isChromeExtension?: boolean;
    extensionCookies?: unknown;
    customFields?: unknown;
}

export interface IntegrationCatalogDTO {
    social: IntegrationCatalogItemDTO[];
    article: IntegrationCatalogItemDTO[];
}

export interface IntegrationListItemDTO {
    id: string;
    internalId: string;
    name: string;
    identifier: string;
    picture: string | null;
    disabled: boolean;
    editor: string;
    type: string;
    inBetweenSteps: boolean;
    refreshNeeded: boolean;
    isCustomFields: boolean;
    customFields?: unknown;
    display: string | null;
    time: unknown[];
    changeProfilePicture: boolean;
    changeNickName: boolean;
    customer: { id: string; name: string } | null;
    additionalSettings: string;
}

export interface IntegrationListDTO {
    integrations: IntegrationListItemDTO[];
}

export interface IntegrationAuthorizeUrlDTO {
    url: string;
}

export interface IntegrationConnectResultDTO {
    id: string;
    organizationId: string;
    internalId: string;
    name: string;
    picture: string | null;
    providerIdentifier: string;
    type: string;
    disabled: boolean;
    inBetweenSteps: boolean;
    refreshNeeded: boolean;
    onboarding: boolean;
    pages: unknown[];
}

