/**
 * Delete a connected channel ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Soft-deletes the integration row. Future requests to `GET /public/integrations`
 * will no longer return this channel and scheduled posts attached to it will
 * stop publishing. Backed by
 * {@link services/IntegrationConnectionService.publicDeleteChannel}.
 *
 * @openapi
 * /public/integrations/{id}:
 *   delete:
 *     operationId: deletePublicIntegration
 *     tags:
 *       - Integrations
 *     summary: Disconnect a channel (API key)
 *     description: >-
 *       Soft-deletes the channel row identified by `{id}`. The channel disappears
 *       from `GET /public/integrations` and stops being eligible for publishing.
 *       Use `GET /public/social/{integration}?refresh={id}` to re-link the same
 *       provider account to a fresh row.
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
 *         description: The channel was disconnected (or was already inactive).
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
 *               id: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *       '400':
 *         description: Invalid integration id (must be a UUID).
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Integration not found in this workspace.
 */
export {};
