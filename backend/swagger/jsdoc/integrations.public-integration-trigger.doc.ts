/**
 * Programmatic integration tool trigger ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Invokes an allow-listed provider method on a connected channel. Backed by
 * {@link services/IntegrationConnectionService.triggerIntegrationTool}, which
 * retries once after a token refresh on `ProviderAccessTokenExpiredError` and
 * soft-deletes the channel (returning 401) if the refresh fails.
 *
 * @openapi
 * /public/integration-trigger/{id}:
 *   post:
 *     operationId: postPublicIntegrationTrigger
 *     tags:
 *       - Integrations
 *     summary: Invoke a provider tool on a connected channel (API key)
 *     description: >-
 *       Invokes an allow-listed provider method on a connected channel. The
 *       `methodName` must match an entry in `output.tools[]` returned by
 *       `GET /public/integration-settings/{id}`; the `data` payload shape is
 *       provider-specific (see that tool's `dataSchema`). When the provider
 *       raises an expired-token error, the server refreshes the access token
 *       and retries once. If the refresh itself fails, the channel is
 *       soft-deleted and a 401 is returned so callers know to reconnect.
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
 *             required: [methodName]
 *             properties:
 *               methodName:
 *                 type: string
 *                 minLength: 1
 *                 description: Tool method name (from `output.tools[].methodName` of `integration-settings`).
 *               data:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Provider-specific input payload; defaults to `{}` when omitted.
 *           example:
 *             methodName: searchThings
 *             data:
 *               query: programming
 *     responses:
 *       '200':
 *         description: Tool output envelope. `output` shape is provider-specific (see the tool's `dataSchema`).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [output]
 *               properties:
 *                 output:
 *                   description: Whatever the invoked provider method returns.
 *             example:
 *               output:
 *                 - id: "thing-1"
 *                   label: "Item A"
 *                 - id: "thing-2"
 *                   label: "Item B"
 *       '400':
 *         description: Invalid integration id or missing/empty `methodName`.
 *       '401':
 *         description: Missing/invalid API key, or the channel was disconnected after a failed token refresh.
 *       '404':
 *         description: Integration row, provider, or tool not found.
 */
export {};
