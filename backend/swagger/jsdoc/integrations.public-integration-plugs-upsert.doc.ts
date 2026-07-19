/**
 * Create or update a global plug rule ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Backed by {@link services/IntegrationConnectionService.publicUpsertIntegrationPlug}.
 *
 * @openapi
 * /public/integration-plugs/{id}:
 *   post:
 *     operationId: upsertPublicIntegrationPlug
 *     tags:
 *       - Integrations
 *     summary: Create or update a global plug rule (API key)
 *     description: >-
 *       Creates a new global plug rule on channel `{id}`, or updates an existing row
 *       when `plugId` is set. The `func` value must match a `methodName` from
 *       `GET /public/plug-catalog` for that channel's provider. Field names and
 *       values are validated against the catalog entry before save.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Integration channel UUID (from `GET /public/integrations`).
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [func, fields]
 *             properties:
 *               func:
 *                 type: string
 *                 description: Plug `methodName` from `GET /public/plug-catalog`.
 *               fields:
 *                 type: array
 *                 description: Name/value pairs matching the catalog field definitions.
 *                 items:
 *                   type: object
 *                   required: [name, value]
 *                   properties:
 *                     name:
 *                       type: string
 *                     value:
 *                       type: string
 *               plugId:
 *                 type: string
 *                 format: uuid
 *                 description: >-
 *                   When set, updates this plug row. Omit to create another rule for
 *                   the same plug type on the same channel.
 *           example:
 *             func: autoPlugPost
 *             fields:
 *               - name: likesAmount
 *                 value: "100"
 *               - name: post
 *                 value: Thanks for reading!
 *     responses:
 *       '200':
 *         description: Plug rule saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [id, activated]
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 activated:
 *                   type: boolean
 *                   description: Whether the rule is currently enabled.
 *             example:
 *               id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               activated: true
 *       '400':
 *         description: Validation error (unknown plug type, invalid fields, or plug type mismatch on update).
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Integration or plug row not found in this workspace.
 */
export {};
