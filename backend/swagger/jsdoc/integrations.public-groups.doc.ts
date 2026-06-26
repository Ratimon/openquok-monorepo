/**
 * List channel groups ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Returns workspace channel groups (`integration_customers`) for filtering
 * {@link services/IntegrationConnectionService.publicListIntegrations} via `?group=`.
 *
 * @openapi
 * /public/groups:
 *   get:
 *     operationId: getPublicGroups
 *     tags:
 *       - Integrations
 *     summary: List channel groups (API key)
 *     description: >-
 *       Returns logical channel groups (customers) in the organization the API key belongs to.
 *       Pass a group `id` to `GET /public/integrations?group=` to list only channels assigned to that group.
 *     responses:
 *       '200':
 *         description: Channel groups for this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [id, name]
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: Channel group UUID (use as `group` on `GET /public/integrations`).
 *                   name:
 *                     type: string
 *                     description: Display name of the group.
 *             example:
 *               - id: 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b
 *                 name: Client A
 *       '401':
 *         description: Missing or invalid API key.
 */
export {};
