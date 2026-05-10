/**
 * OAuth / connection helper routes ({@link routes/integrationApi/NoAuthRoutes.ts}).
 *
 * @openapi
 * /integrations/social-connect/{integration}:
 *   post:
 *     operationId: postIntegrationsSocialConnect
 *     tags:
 *       - Integrations
 *     summary: Social connect (no-auth flow)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: integration
 *         required: true
 *         description: Provider identifier for the OAuth flow (e.g. twitter). Use a slug from your environment’s integration catalog.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OAuth authorization URL or redirect payload depending on provider
 *         content:
 *           application/json:
 *             example:
 *               url: https://oauth.example.com/authorize?client_id=...
 */
export {};
