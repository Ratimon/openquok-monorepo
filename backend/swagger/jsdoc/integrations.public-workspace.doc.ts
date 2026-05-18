/**
 * Workspace metadata for programmatic auth ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Returns the organization (workspace) bound to the supplied API key or OAuth app token.
 *
 * @openapi
 * /public/workspace:
 *   get:
 *     operationId: getPublicWorkspace
 *     tags:
 *       - Integrations
 *     summary: Resolve workspace from API credentials
 *     description: >-
 *       Returns the workspace `id` and `name` for the organization associated with the
 *       `Authorization` header. Use after a successful `GET /public/is-connected` when
 *       agents or scripts need to display which workspace the CLI is acting on.
 *     responses:
 *       '200':
 *         description: Workspace resolved from the token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [workspace]
 *               properties:
 *                 workspace:
 *                   type: object
 *                   required: [id, name]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *             example:
 *               workspace:
 *                 id: "00000000-0000-4000-8000-000000000001"
 *                 name: "My workspace"
 *       '401':
 *         description: Missing or invalid API key / OAuth app token.
 */
export {};
