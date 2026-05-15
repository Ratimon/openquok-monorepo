/**
 * Programmatic draft ↔ scheduled flip ({@link routes/publicApi/PostRoutes.ts}).
 *
 * Loads the post group via the row id and reapplies the same payload with a new
 * `status` at the stored publish time. Full group read/update/delete over HTTP
 * remain session (`/posts/group/*`) only — API keys use this route for status
 * toggles. Backed by {@link services/PostsService.flipPostGroupStatusByPostIdProgrammatic}.
 *
 * @openapi
 * /public/posts/{postId}/status:
 *   put:
 *     operationId: putPublicPostStatus
 *     tags:
 *       - Posts
 *     summary: Flip post group draft ↔ scheduled (API key)
 *     description: >-
 *       Pass any post row UUID from `GET /public/posts/list` in `{postId}`.
 *       The server loads the parent group, keeps schedule/content/channels intact,
 *       and sets `status` to `draft` or `scheduled`. Use `schedule` as a synonym
 *       for `scheduled` in the JSON body. For arbitrary edits (new time, channels,
 *       media), use the workspace composer or authenticated `PUT /posts/group/{postGroup}`.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post row UUID (any row in the target group).
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, schedule, scheduled]
 *                 description: '`draft` pauses publishing; `schedule` or `scheduled` (re)queues at the stored time.'
 *           example:
 *             status: draft
 *     responses:
 *       '200':
 *         description: Post group updated (same shape as create/update responses).
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
 *                     state: DRAFT
 *                     publishDate: '2026-05-14T11:00:00.000Z'
 *                     organizationId: c1d8a3f4-1234-4abc-bf12-1234567890ab
 *                     integrationId: 1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22
 *                     content: 'Hello — still scheduled time'
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
 *         description: Post not found in this workspace.
 */
export {};
