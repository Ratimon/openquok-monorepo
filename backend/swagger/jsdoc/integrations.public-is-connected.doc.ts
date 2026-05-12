/**
 * Healthcheck for programmatic auth ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Returns `{ connected: true }` whenever the request carries a valid API key
 * or OAuth app token. Intended for SDKs, scripts, and the CLI to verify the
 * caller's credentials before performing real work.
 *
 * @openapi
 * /public/is-connected:
 *   get:
 *     operationId: getPublicIsConnected
 *     tags:
 *       - Integrations
 *     summary: Verify API credentials are accepted (API key)
 *     description: >-
 *       Lightweight healthcheck for the programmatic API. A `200 { connected: true }`
 *       confirms the supplied `Authorization` header was accepted; the endpoint
 *       does not return organization metadata. Use it to validate stored API
 *       keys in CI, the CLI, and SDK setup flows.
 *     responses:
 *       '200':
 *         description: The API key (or OAuth app token) was accepted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [connected]
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   description: Always `true` when the response status is 200.
 *             example:
 *               connected: true
 *       '401':
 *         description: Missing or invalid API key / OAuth app token.
 */
export {};
