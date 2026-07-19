/**
 * List saved global plug rules for a channel ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Backed by {@link services/IntegrationConnectionService.publicListIntegrationPlugs}.
 *
 * @openapi
 * /public/integration-plugs/{id}:
 *   get:
 *     operationId: getPublicIntegrationPlugs
 *     tags:
 *       - Integrations
 *     summary: List global plug rules on a channel (API key)
 *     description: >-
 *       Returns every saved global plug rule row for the integration channel `{id}`.
 *       The `data` column is a JSON string of `{ name, value }` field pairs from the
 *       upsert body. Use `GET /public/plug-catalog` to discover valid `plug_function`
 *       values and field names before creating rules.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Integration channel UUID (from `GET /public/integrations`).
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Saved global plug rules for this channel.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [plugs]
 *               properties:
 *                 plugs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                       - id
 *                       - organization_id
 *                       - integration_id
 *                       - plug_function
 *                       - data
 *                       - activated
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: Plug rule row id (use on update, delete, activate).
 *                       organization_id:
 *                         type: string
 *                         format: uuid
 *                       integration_id:
 *                         type: string
 *                         format: uuid
 *                       plug_function:
 *                         type: string
 *                         description: Plug `methodName` from the catalog (`func` on upsert).
 *                       data:
 *                         type: string
 *                         description: JSON string of `{ name, value }` field pairs.
 *                       activated:
 *                         type: boolean
 *                         description: When false, the rule is saved but not evaluated.
 *             example:
 *               plugs:
 *                 - id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                   organization_id: c1d8a3f4-1234-4abc-bf12-1234567890ab
 *                   integration_id: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                   plug_function: autoPlugPost
 *                   data: >-
 *                     [{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks for reading!"}]
 *                   activated: true
 *       '400':
 *         description: Invalid integration id (must be a UUID).
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Integration not found in this workspace.
 */
export {};
