/**
 * Programmatic integration settings ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Returns the provider rules, post-length cap, settings schema, and the
 * allow-listed `tools[]` that `POST /public/integration-trigger/{id}` accepts.
 * Backed by {@link services/IntegrationConnectionService.getIntegrationSettings}.
 *
 * @openapi
 * /public/integration-settings/{id}:
 *   get:
 *     operationId: getPublicIntegrationSettings
 *     tags:
 *       - Integrations
 *     summary: Get rules, max length, settings schema, and tools for a channel (API key)
 *     description: >-
 *       Returns provider-specific metadata for a connected integration channel:
 *       `rules` (natural-language constraints), `maxLength` (post character cap,
 *       which may vary with a "Verified" flag stored in the channel's
 *       additional settings), `settings` (provider settings schema, or the
 *       literal string `"No additional settings required"` when the provider
 *       does not declare one), and `tools[]` (allow-listed methods invocable
 *       via `POST /public/integration-trigger/{id}`).
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
 *         description: Channel settings and tools envelope.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [output]
 *               properties:
 *                 output:
 *                   type: object
 *                   required: [rules, maxLength, settings, tools]
 *                   properties:
 *                     rules:
 *                       type: string
 *                       description: Natural-language constraints from the provider; empty when the provider doesn't declare `rules`.
 *                     maxLength:
 *                       type: integer
 *                       description: Maximum post body length for this channel.
 *                     settings:
 *                       description: Provider settings schema (shape is provider-defined) or the literal string "No additional settings required".
 *                       oneOf:
 *                         - type: string
 *                         - type: object
 *                         - type: array
 *                     tools:
 *                       type: array
 *                       description: Allow-listed methods invocable via `POST /public/integration-trigger/{id}`.
 *                       items:
 *                         type: object
 *                         required: [methodName, description]
 *                         properties:
 *                           methodName:
 *                             type: string
 *                           description:
 *                             type: string
 *                           dataSchema:
 *                             description: Provider-defined shape for the `data` payload of the corresponding `integration-trigger` call.
 *             example:
 *               output:
 *                 rules: ""
 *                 maxLength: 500
 *                 settings: "No additional settings required"
 *                 tools: []
 *       '400':
 *         description: Invalid integration id (must be a UUID).
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Integration not found in this workspace.
 */
export {};
