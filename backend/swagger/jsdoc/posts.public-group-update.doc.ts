/**
 * Programmatic post-group update ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Replaces the post group's per-channel rows in place: changing
 * `integrationIds`, `media`, body, or schedule mirrors the workspace composer's
 * edit-mode save. Backed by
 * {@link services/PostsService.updatePostGroupProgrammatic}.
 *
 * @openapi
 * /public/posts/group/{postGroup}:
 *   put:
 *     operationId: putPublicPostGroup
 *     tags:
 *       - Posts
 *     summary: Update a post group (API key)
 *     description: >-
 *       Atomically replaces the rows in a post group. Pass the full desired
 *       state — channels removed from `integrationIds` are soft-deleted, new
 *       ones are inserted, and the schedule/tags/media are rewritten. Use
 *       `status: "draft"` to roll back to draft without re-enqueuing.
 *     parameters:
 *       - in: path
 *         name: postGroup
 *         required: true
 *         description: Post group UUID.
 *         schema:
 *           type: string
 *           format: uuid
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
 *               bodiesByIntegrationId:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                   maxLength: 50000
 *               media:
 *                 type: array
 *                 maxItems: 20
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
 *               integrationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               isGlobal:
 *                 type: boolean
 *                 default: true
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               repeatInterval:
 *                 type: string
 *                 nullable: true
 *                 enum: [day, two_days, three_days, four_days, five_days, six_days, week, two_weeks, month]
 *               tagNames:
 *                 type: array
 *                 maxItems: 50
 *                 items:
 *                   type: string
 *               providerSettingsByIntegrationId:
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *                   additionalProperties: true
 *               status:
 *                 type: string
 *                 enum: [draft, scheduled]
 *           example:
 *             scheduledAt: '2026-05-14T11:00:00.000Z'
 *             status: scheduled
 *             body: 'Hello — updated copy!'
 *             integrationIds: ['1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22']
 *             tagNames: ['launch-week']
 *     responses:
 *       '200':
 *         description: Post group updated.
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
 *                     publishDate: '2026-05-14T11:00:00.000Z'
 *                     organizationId: c1d8a3f4-1234-4abc-bf12-1234567890ab
 *                     integrationId: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                     content: 'Hello — updated copy!'
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
 *                     updatedAt: '2026-05-10T10:00:00.000Z'
 *       '400':
 *         description: Validation error or workspace mismatch.
 *       '401':
 *         description: Missing or invalid API key.
 *       '404':
 *         description: Post group not found in this workspace.
 */
export {};
