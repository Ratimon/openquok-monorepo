/**
 * Global plug type catalog ({@link routes/publicApi/IntegrationRoutes.ts}).
 *
 * Aggregates {@link integrations/integrationManager.listGlobalPlugCatalog} from
 * providers that expose channel-level (likes-threshold) plug rules.
 *
 * @openapi
 * /public/plug-catalog:
 *   get:
 *     operationId: getPublicPlugCatalog
 *     tags:
 *       - Integrations
 *     summary: List global plug types per provider (API key)
 *     description: >-
 *       Returns the catalog of global plug types (auto-repost, auto-reply when likes
 *       cross a threshold, and similar channel-level rules). Use each entry's
 *       `methodName` as `func` on `POST /public/integration-plugs/{id}` and match
 *       `fields[].name` in the upsert body. Internal (per-post) plugs are configured
 *       on `POST /public/posts` via `providerSettingsByIntegrationId` — not here.
 *     responses:
 *       '200':
 *         description: Global plug catalog grouped by provider.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [plugs]
 *               properties:
 *                 plugs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required: [name, identifier, plugs]
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Provider display name.
 *                       identifier:
 *                         type: string
 *                         description: Provider identifier (e.g. `threads`, `x`, `linkedin-page`).
 *                       plugs:
 *                         type: array
 *                         items:
 *                           type: object
 *                           required:
 *                             - methodName
 *                             - identifier
 *                             - title
 *                             - description
 *                             - runEveryMilliseconds
 *                             - totalRuns
 *                             - fields
 *                           properties:
 *                             methodName:
 *                               type: string
 *                               description: Value for `func` when upserting a rule.
 *                             identifier:
 *                               type: string
 *                               description: Stable plug type id within the provider.
 *                             title:
 *                               type: string
 *                             description:
 *                               type: string
 *                             runEveryMilliseconds:
 *                               type: integer
 *                               description: Orchestrator re-check interval (typically 6 hours).
 *                             totalRuns:
 *                               type: integer
 *                               description: Maximum threshold checks per published post.
 *                             fields:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 required: [name, description, type, placeholder]
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   description:
 *                                     type: string
 *                                   type:
 *                                     type: string
 *                                   placeholder:
 *                                     type: string
 *                                   validation:
 *                                     type: string
 *                                     description: Optional regex pattern as a string.
 *             example:
 *               plugs:
 *                 - name: Threads
 *                   identifier: threads
 *                   plugs:
 *                     - methodName: autoPlugPost
 *                       identifier: threads-autoPlugPost
 *                       title: Auto plug post
 *                       description: >-
 *                         When a thread reaches a certain number of likes, publish a reply
 *                         so followers get another notification.
 *                       runEveryMilliseconds: 21600000
 *                       totalRuns: 3
 *                       fields:
 *                         - name: likesAmount
 *                           description: The number of likes required to trigger the reply
 *                           type: number
 *                           placeholder: Amount of likes
 *                           validation: /^\\d+$/
 *                         - name: post
 *                           description: Message content for the reply
 *                           type: richtext
 *                           placeholder: Post to plug
 *                           validation: /^[\\s\\S]{3,}$/g
 *       '401':
 *         description: Missing or invalid API key.
 */
export {};
