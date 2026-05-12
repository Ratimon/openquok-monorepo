/**
 * Programmatic post-group read ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Returns the canonical edit-mode view for a post group: the global `body`,
 * per-channel overrides, media, tags, repeat interval, and any
 * provider-specific settings (e.g. Threads replies). Backed by
 * {@link services/PostsService.getPostGroupProgrammatic}.
 *
 * @openapi
 * /public/posts/group/{postGroup}:
 *   get:
 *     operationId: getPublicPostGroup
 *     tags:
 *       - Posts
 *     summary: Get a post group (API key)
 *     description: >-
 *       Returns the full edit-mode payload for the post group identified by
 *       `{postGroup}`. The shape mirrors what the workspace composer needs to
 *       re-hydrate the form, and is the source of truth for diffing before a
 *       `PUT /public/posts/group/{postGroup}` update.
 *     parameters:
 *       - in: path
 *         name: postGroup
 *         required: true
 *         description: Post group UUID (returned by `POST /public/posts`).
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Post group details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PostGroupDetails'
 *             example:
 *               success: true
 *               data:
 *                 postGroup: 9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33
 *                 organizationId: c1d8a3f4-1234-4abc-bf12-1234567890ab
 *                 isGlobal: true
 *                 repeatInterval: null
 *                 publishDateIso: '2026-05-14T10:00:00.000Z'
 *                 status: scheduled
 *                 integrationIds: ['1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22']
 *                 body: 'Hello from the public API!'
 *                 bodiesByIntegrationId:
 *                   '1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22': 'Hello from the public API!'
 *                 media: []
 *                 tagNames: ['launch-week']
 *                 postIds: ['5b3c1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1']
 *                 providerSettingsByIntegrationId: {}
 *       '400':
 *         description: Invalid post group id or workspace mismatch.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post group not found in this workspace.
 *
 * components:
 *   schemas:
 *     PostGroupDetails:
 *       type: object
 *       required: [postGroup, organizationId, isGlobal, publishDateIso, status, integrationIds, body, bodiesByIntegrationId, media, tagNames]
 *       properties:
 *         postGroup:
 *           type: string
 *           format: uuid
 *         organizationId:
 *           type: string
 *           format: uuid
 *         isGlobal:
 *           type: boolean
 *           description: When `true`, all channels share `body` unless overridden.
 *         repeatInterval:
 *           type: string
 *           nullable: true
 *           enum: [day, two_days, three_days, four_days, five_days, six_days, week, two_weeks, month]
 *         publishDateIso:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [draft, scheduled]
 *         integrationIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         body:
 *           type: string
 *         bodiesByIntegrationId:
 *           type: object
 *           additionalProperties:
 *             type: string
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             required: [id, path]
 *             properties:
 *               id:
 *                 type: string
 *               path:
 *                 type: string
 *         tagNames:
 *           type: array
 *           items:
 *             type: string
 *         postIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         providerSettingsByIntegrationId:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             additionalProperties: true
 */
export {};
