/**
 * Enable or disable a global plug rule ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Backed by {@link services/IntegrationConnectionService.publicSetIntegrationPlugActivated}.
 *
 * @openapi
 * /public/plugs/{plugId}/activate:
 *   put:
 *     operationId: setPublicIntegrationPlugActivated
 *     tags:
 *       - Integrations
 *     summary: Enable or disable a global plug rule (API key)
 *     description: >-
 *       Toggles whether the global plug rule `{plugId}` is evaluated by the
 *       orchestrator. Disabled rules remain stored and can be re-enabled without
 *       re-entering field values.
 *     parameters:
 *       - in: path
 *         name: plugId
 *         required: true
 *         description: Plug rule row UUID (from `GET /public/integration-plugs/{id}`).
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activated]
 *             properties:
 *               activated:
 *                 type: boolean
 *                 description: '`true` to evaluate the rule; `false` to pause it.'
 *           example:
 *             activated: false
 *     responses:
 *       '200':
 *         description: Plug rule activation updated.
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
 *         description: Invalid plug id or request body.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Plug rule not found in this workspace.
 */
export {};
