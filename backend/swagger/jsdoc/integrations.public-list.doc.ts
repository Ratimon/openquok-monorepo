/**
 * List integration channels ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Returns every connected channel in the organization scoped by the API key.
 * Backed by {@link services/IntegrationConnectionService.publicListIntegrations}.
 *
 * @openapi
 * /public/integrations:
 *   get:
 *     operationId: getPublicIntegrations
 *     tags:
 *       - Integrations
 *     summary: List connected channels (API key)
 *     description: >-
 *       Returns the connected social channels for the organization the API key belongs to.
 *       Each row exposes the provider identifier, display name, picture, disabled flag,
 *       and (when assigned) the customer the channel was bound to via the UI.
 *     responses:
 *       '200':
 *         description: Connected channels for this workspace.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required: [id, name, identifier, picture, disabled, profile, customer]
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: Integration channel UUID (use as `{id}` in other `/public` routes).
 *                   name:
 *                     type: string
 *                     description: Display name (typically the social account handle).
 *                   identifier:
 *                     type: string
 *                     description: Provider identifier (e.g. `threads`, `instagram`, `instagram-standalone`).
 *                   picture:
 *                     type: string
 *                     description: Profile picture URL. Defaults to `/no-picture.jpg` when unavailable.
 *                   disabled:
 *                     type: boolean
 *                     description: True when the channel was disabled (e.g. revoked token, soft-disabled by admin).
 *                   profile:
 *                     type: string
 *                     nullable: true
 *                     description: Profile URL of the connected social account, when the provider exposes one.
 *                   customer:
 *                     description: Workspace "customer" (logical grouping) the channel was assigned to, or `null`.
 *                     oneOf:
 *                       - type: 'null'
 *                       - type: object
 *                         required: [id, name]
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *             example:
 *               - id: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                 name: openquok.demo
 *                 identifier: threads
 *                 picture: https://example.com/profile.jpg
 *                 disabled: false
 *                 profile: https://www.threads.net/@openquok.demo
 *                 customer: null
 *       '401':
 *         description: Missing or invalid API key.
 */
export {};
