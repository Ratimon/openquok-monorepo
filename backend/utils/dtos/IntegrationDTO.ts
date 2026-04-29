/**
 * Integration DTOs for API responses.
 *
 * Notes:
 * - Session routes under `/integrations` return camelCase fields.
 * - These DTOs describe the JSON shapes sent to the web client.
 */
import type { IntegrationCustomerDTO } from "./CustomerDTO";

/** Table `public.integrations` — connected channels (snake_case columns). Repository shape. */
export type IntegrationLike = {
    id: string;
    organization_id: string;
    internal_id: string;
    name: string;
    picture: string | null;
    provider_identifier: string;
    type: string;
    token: string;
    disabled: boolean;
    token_expiration: string | null;
    refresh_token: string | null;
    profile: string | null;
    deleted_at: string | null;
    in_between_steps: boolean;
    refresh_needed: boolean;
    posting_times: string;
    custom_instance_details: string | null;
    additional_settings: string;
    customer_id: string | null;
    /** Set when row comes from `internal_list_integrations_by_org` (joined label). */
    customer_name?: string | null;
    root_internal_id: string | null;
    created_at: string;
    updated_at: string;
};

export type IntegrationCustomerLike = {
    id: string;
    organization_id: string;
    name: string;
    created_at: string;
    updated_at: string;
};

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
    customer: IntegrationCustomerDTO | null;
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
