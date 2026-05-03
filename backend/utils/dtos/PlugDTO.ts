
/** API body for creating/updating a plug (matches common upstream shape). */
export type PlugFieldsDto = { name: string; value: string };

export type PlugUpsertBodyDto = {
    func: string;
    fields: PlugFieldsDto[];
    /** When set, updates this plug row; omit to create another rule for the same plug type. */
    plugId?: string;
};

export type IntegrationPlugRowDto = {
    id: string;
    organization_id: string;
    integration_id: string;
    plug_function: string;
    data: string;
    activated: boolean;
};

/** Catalog entry returned to the web app (regex patterns as strings). */
export type PlugFieldCatalogDto = {
    name: string;
    description: string;
    type: string;
    placeholder: string;
    validation?: string;
};

export type GlobalPlugCatalogEntryDto = {
    methodName: string;
    identifier: string;
    title: string;
    description: string;
    runEveryMilliseconds: number;
    totalRuns: number;
    fields: PlugFieldCatalogDto[];
};

export type ProviderPlugsCatalogDto = {
    name: string;
    identifier: string;
    plugs: GlobalPlugCatalogEntryDto[];
};

export type InternalPlugCatalogEntryDto = {
    identifier: string;
    methodName: string;
    title: string;
    description: string;
};
