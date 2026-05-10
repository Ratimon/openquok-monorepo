/**
 * Programmatic OAuth URL ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * @openapi
 * /public/social/{integration}:
 *   get:
 *     operationId: getPublicSocialOAuthUrl
 *     tags:
 *       - Integrations
 *     summary: Get OAuth URL for a channel (API key)
 *     description: >-
 *       Returns an OAuth authorization URL for the given integration. Requires an organization API key in the
 *       Authorization header (same as other `/public/*` routes). Use this from backends or scripts; the browser
 *       app typically uses the session-scoped GET `/integrations/social/{integration}` instead.
 *     parameters:
 *       - in: path
 *         name: integration
 *         required: true
 *         description: Provider identifier (e.g. twitter, threads) from your environment’s catalog.
 *         schema:
 *           type: string
 *       - in: query
 *         name: refresh
 *         required: false
 *         description: Existing integration (channel) UUID to refresh OAuth for instead of starting a new connection.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: OAuth authorization URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - url
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL to redirect the user to for authorization
 *             example:
 *               url: https://oauth.example.com/authorize?client_id=...
 *       '400':
 *         description: Integration not allowed or requires an external URL
 */
export {};
