/**
 * DTOs for workspace integration customers (`public.integration_customers`)
 * returned from session routes under `/integrations/customers` and related handlers.
 *
 * Notes:
 * - Session routes return camelCase fields.
 * - Shapes match the JSON payloads under `{ success: true, data: … }` where applicable.
 */

/** One row from `integration_customers` (id + display name). */
export interface IntegrationCustomerDTO {
    id: string;
    name: string;
}

/** `data` for GET `/integrations/customers?organizationId=`. */
export interface IntegrationCustomersListDTO {
    customers: IntegrationCustomerDTO[];
}

/** `data` for POST `/integrations/customers`. */
export type IntegrationCustomerCreatedDTO = IntegrationCustomerDTO;

/** `data` for PUT `/integrations/:id/group`. */
export interface IntegrationCustomerAssignOkDTO {
    ok: true;
}
