/**
 * Delete a global plug rule ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Backed by {@link services/IntegrationConnectionService.publicDeleteIntegrationPlug}.
 *
 * @openapi
 * /public/plugs/{plugId}:
 *   delete:
 *     operationId: deletePublicIntegrationPlug
 *     tags:
 *       - Integrations
 *     summary: Delete a global plug rule (API key)
 *     description: >-
 *       Permanently removes the global plug rule identified by `{plugId}`.
 *       Obtain plug ids from `GET /public/integration-plugs/{id}`.
 *     parameters:
 *       - in: path
 *         name: plugId
 *         required: true
 *         description: Plug rule row UUID (from `GET /public/integration-plugs/{id}`).
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Plug rule deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [id]
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *             example:
 *               id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *       '400':
 *         description: Invalid plug id (must be a UUID).
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Plug rule not found in this workspace.
 */
export {};
