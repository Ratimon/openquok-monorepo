/**
 * Provider catalog (metadata only). Matches {@link routes/integrationApi}.
 *
 * @openapi
 * /integrations:
 *   get:
 *     operationId: getIntegrationsCatalog
 *     tags:
 *       - Integrations
 *     summary: List integration providers (public catalog)
 *     security: []
 *     responses:
 *       '200':
 *         description: Provider catalog metadata
 */
export {};
