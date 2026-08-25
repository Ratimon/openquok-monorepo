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
 *       from `GET /public/integrations` and frees a connected slot on Cloud billing.
 *       Returns **409** while any post row (draft, queued, published, or error)
 *       still references the channel — delete those rows first with
 *       `DELETE /public/posts/{postId}`, or disable the channel in the workspace
 *       instead. Use `GET /public/social/{integration}?refresh={id}` to re-link the
 *       same provider account to a fresh row after a successful delete.
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
 *       '409':
 *         description: >-
 *           The channel still has post rows in this workspace (any state). Delete
 *           those posts first, or disable the channel instead of deleting it.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, message, error]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   enum: [false]
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 *                   required: [type, message]
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: AppError
 *                     message:
 *                       type: string
 *             example:
 *               success: false
 *               message: You have to delete all the posts associated with this channel before deleting it
 *               error:
 *                 type: AppError
 *                 message: You have to delete all the posts associated with this channel before deleting it
 */
export {};
