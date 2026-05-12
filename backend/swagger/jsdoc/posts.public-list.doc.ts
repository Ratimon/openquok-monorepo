/**
 * Programmatic posts calendar listing ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Filters by an ISO date window. Optionally narrows to a comma-separated set of
 * integration ids (channel UUIDs). Cached via the same calendar-posts cache key
 * the session endpoint uses; mutations through other `/public/posts` routes
 * automatically invalidate it.
 *
 * @openapi
 * /public/posts/list:
 *   get:
 *     operationId: getPublicPostsList
 *     tags:
 *       - Posts
 *     summary: List posts in a date window (API key)
 *     description: >-
 *       Returns the calendar rows visible to the API key's organization within
 *       the `start..end` ISO range. Pass `integrationIds` as a comma-separated
 *       list of channel UUIDs to narrow the result; omit to include every
 *       channel (and ungrouped posts).
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         description: Start of the date window (ISO-8601, inclusive).
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2026-05-01T00:00:00.000Z'
 *       - in: query
 *         name: end
 *         required: true
 *         description: End of the date window (ISO-8601, inclusive).
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2026-05-31T23:59:59.999Z'
 *       - in: query
 *         name: integrationIds
 *         required: false
 *         description: Optional comma-separated channel UUIDs. Empty value returns every channel.
 *         schema:
 *           type: string
 *         example: '1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22,2c8b5e4a-5a4b-4f7d-8e2c-9b3f1c4d5e22'
 *     responses:
 *       '200':
 *         description: Posts (one DTO per row, multi-channel groups appear as separate rows sharing `postGroup`).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   required: [posts]
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SocialPostDTO'
 *             example:
 *               success: true
 *               data:
 *                 posts:
 *                   - id: 5b3c1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1
 *                     state: QUEUE
 *                     publishDate: '2026-05-14T10:00:00.000Z'
 *                     organizationId: c1d8a3f4-1234-4abc-bf12-1234567890ab
 *                     integrationId: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                     content: 'Hello from the public API!'
 *                     delay: 0
 *                     postGroup: 9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33
 *                     title: null
 *                     description: null
 *                     parentPostId: null
 *                     releaseId: null
 *                     releaseUrl: null
 *                     settings: null
 *                     image: null
 *                     intervalInDays: null
 *                     error: null
 *                     deletedAt: null
 *                     createdByUserId: null
 *                     createdAt: '2026-05-10T09:00:00.000Z'
 *                     updatedAt: '2026-05-10T09:00:00.000Z'
 *       '400':
 *         description: Invalid date range (`start`/`end` missing or non-parseable).
 *       '401':
 *         description: Missing or invalid API key.
 *
 * components:
 *   schemas:
 *     SocialPostDTO:
 *       type: object
 *       required: [id, state, publishDate, organizationId, content, delay, postGroup, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         state:
 *           type: string
 *           description: Lifecycle state (e.g. `DRAFT`, `QUEUE`, `PUBLISHED`, `ERROR`).
 *         publishDate:
 *           type: string
 *           format: date-time
 *         organizationId:
 *           type: string
 *           format: uuid
 *         integrationId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         content:
 *           type: string
 *         delay:
 *           type: integer
 *           description: Delay (seconds) applied for thread replies relative to the parent post.
 *         postGroup:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         parentPostId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         releaseId:
 *           type: string
 *           nullable: true
 *           description: Provider-assigned release id once published.
 *         releaseUrl:
 *           type: string
 *           nullable: true
 *           description: Public URL of the published post on the provider, when available.
 *         settings:
 *           type: string
 *           nullable: true
 *           description: JSON-encoded settings blob (per-channel provider settings, repeat interval, etc.).
 *         image:
 *           type: string
 *           nullable: true
 *           description: JSON-encoded media list (`[{ id, path }]`).
 *         intervalInDays:
 *           type: integer
 *           nullable: true
 *         error:
 *           type: string
 *           nullable: true
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdByUserId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export {};
