/**
 * Programmatic create-post ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Creates a new post group and one row per selected channel. Inserts schedule
 * the group for publishing; drafts persist without enqueuing the worker.
 * Backed by {@link services/PostsService.createPostProgrammatic}.
 *
 * @openapi
 * /public/posts:
 *   post:
 *     operationId: postPublicPosts
 *     tags:
 *       - Posts
 *     summary: Create a post group (API key)
 *     description: >-
 *       Creates a post group and the per-channel rows that make it up. Set
 *       `status: "draft"` to persist without enqueuing publishing (useful for
 *       AI / approval flows), or `status: "scheduled"` to publish at
 *       `scheduledAt`. Use `bodiesByIntegrationId` to override `body` for
 *       individual channels (customize mode); use
 *       `providerSettingsByIntegrationId` to attach Threads thread replies,
 *       Instagram post-type, etc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduledAt, status]
 *             properties:
 *               body:
 *                 type: string
 *                 maxLength: 50000
 *                 description: Canonical post body used when an integration does not have a per-channel override.
 *               bodiesByIntegrationId:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                   maxLength: 50000
 *                 description: Per-channel body overrides keyed by integration (channel) UUID.
 *               media:
 *                 type: array
 *                 maxItems: 20
 *                 description: Media references obtained from `POST /public/upload` (`id`, `path`).
 *                 items:
 *                   type: object
 *                   required: [id, path]
 *                   properties:
 *                     id:
 *                       type: string
 *                     path:
 *                       type: string
 *                     bucket:
 *                       type: string
 *                       description: Storage bucket name (defaults to the composer media bucket).
 *               integrationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Channel UUIDs to publish to (from `GET /public/integrations`).
 *               isGlobal:
 *                 type: boolean
 *                 default: true
 *                 description: When `true`, the same body is shared across channels unless overridden via `bodiesByIntegrationId`.
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: ISO-8601 publish time. Required.
 *               repeatInterval:
 *                 type: string
 *                 nullable: true
 *                 enum: [day, two_days, three_days, four_days, five_days, six_days, week, two_weeks, month]
 *                 description: Optional repeat cadence; `null` disables repetition.
 *               tagNames:
 *                 type: array
 *                 maxItems: 50
 *                 items:
 *                   type: string
 *                 description: Post tag labels (created on demand within the workspace).
 *               providerSettingsByIntegrationId:
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *                   additionalProperties: true
 *                 description: Per-channel provider settings (e.g. Threads thread replies, Instagram post type).
 *               status:
 *                 type: string
 *                 enum: [draft, scheduled]
 *                 description: '`draft` persists without enqueuing; `scheduled` schedules at `scheduledAt`.'
 *               isAgent:
 *                 type: boolean
 *                 default: true
 *                 description: >-
 *                   When true or omitted, sets `isAgentEdited` for kanban review. The CLI sends `true`.
 *                   Dashboard session creates never use this field.
 *           example:
 *             scheduledAt: '2026-05-14T10:00:00.000Z'
 *             status: scheduled
 *             body: 'Hello from the public API!'
 *             integrationIds: ['1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22']
 *             tagNames: ['launch-week']
 *     responses:
 *       '200':
 *         description: Post group created.
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
 *                   required: [postGroup, posts]
 *                   properties:
 *                     postGroup:
 *                       type: string
 *                       format: uuid
 *                       description: The new post-group id (correlates rows in `GET /public/posts/list`; full group edits are session/UI only).
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SocialPostDTO'
 *             example:
 *               success: true
 *               data:
 *                 postGroup: 9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33
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
 *         description: Validation error (missing `scheduledAt`/`status`, bad UUIDs, body too long, etc.).
 *       '401':
 *         description: Missing or invalid API key.
 */
export {};
